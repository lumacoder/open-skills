import * as path from 'node:path';
import * as os from 'node:os';
import { simpleGit } from 'simple-git';
import type { BaseAdapter } from './adapters/base-adapter.js';
import type { InstallScope, SkillMeta, InstallResult } from '../types/index.js';
import { transformSkillContent } from './transformer.js';
import { cleanDirectory } from './cleaner.js';
import { mkdtemp, readFile, remove, readdir } from './fs-utils.js';
import { cloneWithResolvedRef } from './git-utils.js';

/**
 * Recursively search for a skill file in a directory.
 * Tries SKILL.md first, then common fallbacks.
 */
async function findSkillFile(dir: string): Promise<string | null> {
  const candidates = ['SKILL.md', 'skill.md', 'Claude_Skill.md'];

  async function search(currentDir: string): Promise<string | null> {
    let entries;
    try {
      entries = await readdir(currentDir, { withFileTypes: true });
    } catch {
      return null;
    }

    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);
      if (entry.isFile() && candidates.includes(entry.name)) {
        return fullPath;
      }
    }

    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);
      if (entry.isDirectory() && entry.name !== '.git') {
        const found = await search(fullPath);
        if (found) return found;
      }
    }

    return null;
  }

  return search(dir);
}

export class Engine {
  async process(
    adapter: BaseAdapter,
    scope: InstallScope,
    skills: SkillMeta[]
  ): Promise<InstallResult[]> {
    const skillContents = new Map<string, string>();

    for (const skill of skills) {
      const content = await this.downloadSkill(skill);
      const transformed = transformSkillContent(content, skill, adapter.id);
      skillContents.set(skill.name, transformed);
    }

    if (adapter.getOutputType() === 'directory') {
      const targetPath = adapter.getTargetPath(scope);
      const expectedFiles = new Set<string>();
      for (const skill of skills) {
        expectedFiles.add(path.join(skill.name, 'SKILL.md'));
      }
      expectedFiles.add('index.md');
      await cleanDirectory(targetPath, expectedFiles);
    }

    return adapter.generateOutput(scope, skills, skillContents);
  }

  private async downloadSkill(skill: SkillMeta): Promise<string> {
    if (skill.source) {
      if (skill.source.type === 'git') {
        if (!skill.source.url) {
          throw new Error(`Skill "${skill.name}" has empty git source url`);
        }
        return await this.downloadFromGit(skill);
      } else if (skill.source.type === 'local') {
        if (!skill.source.url) {
          throw new Error(`Skill "${skill.name}" has empty local source path`);
        }
        return await readFile(skill.source.url, 'utf-8');
      } else {
        throw new Error(`Unsupported source type: ${skill.source.type}`);
      }
    } else if (skill.bundle) {
      const bundlePath = path.join(process.cwd(), skill.bundle.path, 'SKILL.md');
      return await readFile(bundlePath, 'utf-8');
    }
    throw new Error('No source or bundle defined');
  }

  private async downloadFromGit(skill: SkillMeta): Promise<string> {
    const git = simpleGit();
    const url = skill.source!.url;
    const ref = skill.source!.ref || 'main';
    const subPath = skill.source!.path;

    if (!subPath) {
      const tmpDir = await mkdtemp(path.join(os.tmpdir(), 'open-skills-'));
      try {
        await cloneWithResolvedRef(url, tmpDir, { ref });
        const skillFile = await findSkillFile(tmpDir);
        if (!skillFile) {
          throw new Error(`No SKILL.md found in cloned repository: ${url}`);
        }
        return await readFile(skillFile, 'utf-8');
      } finally {
        await remove(tmpDir);
      }
    }

    const tmpDir = await mkdtemp(path.join(os.tmpdir(), 'open-skills-'));
    try {
      const resolvedRef = await cloneWithResolvedRef(url, tmpDir, { ref, noCheckout: true });
      const repoGit = simpleGit(tmpDir);
      await repoGit.raw(['sparse-checkout', 'init', '--cone']);
      await repoGit.raw(['sparse-checkout', 'set', subPath]);
      await repoGit.checkout(resolvedRef);
      const skillFile = await findSkillFile(path.join(tmpDir, subPath));
      if (!skillFile) {
        throw new Error(`No SKILL.md found in path "${subPath}" of repository: ${url}`);
      }
      return await readFile(skillFile, 'utf-8');
    } finally {
      await remove(tmpDir);
    }
  }
}
