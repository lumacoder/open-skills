import * as path from 'node:path';
import * as os from 'node:os';
import { simpleGit } from 'simple-git';
import { ensureDir, remove, copy, pathExists as pathExistsFn } from './fs-utils.js';
import { SkillMeta, InstallResult } from '../types/index.js';
import { resolveTargetDir } from './resolver.js';

export async function installSkill(
  scope: 'global' | 'local',
  skill: SkillMeta
): Promise<InstallResult> {
  const targetDir = resolveTargetDir(scope, skill);
  const dest = path.join(targetDir, skill.name);

  await ensureDir(targetDir);
  await remove(dest);

  try {
    if (skill.source) {
      if (skill.source.type === 'git') {
        await installFromGit(skill, dest);
      } else if (skill.source.type === 'curl') {
        throw new Error('curl source not implemented in MVP');
      } else if (skill.source.type === 'local') {
        await copy(skill.source.url, dest);
      }
    } else if (skill.bundle) {
      const bundlePath = path.join(process.cwd(), skill.bundle.path);
      await copy(bundlePath, dest);
    } else {
      throw new Error('No source or bundle defined');
    }

    const skillMd = path.join(dest, 'SKILL.md');
    if (!(await pathExistsFn(skillMd))) {
      throw new Error('Installed skill missing SKILL.md');
    }

    return {
      skill,
      success: true,
      message: `Installed to ${dest}`,
      targetPath: dest,
    };
  } catch (err: any) {
    return {
      skill,
      success: false,
      message: err.message || String(err),
      targetPath: dest,
    };
  }
}

async function installFromGit(skill: SkillMeta, dest: string): Promise<void> {
  const git = simpleGit();
  const url = skill.source!.url;
  const ref = skill.source!.ref || 'main';
  const subPath = skill.source!.path;

  if (!subPath) {
    await git.clone(url, dest, ['--depth', '1', '--branch', ref]);
    await remove(path.join(dest, '.git'));
    return;
  }

  const tmpDir = await (await import('./fs-utils.js')).mkdtemp(path.join(os.tmpdir(), 'open-skills-'));
  try {
    await git.clone(url, tmpDir, ['--depth', '1', '--branch', ref, '--no-checkout']);
    const repoGit = simpleGit(tmpDir);
    await repoGit.raw(['sparse-checkout', 'init', '--cone']);
    await repoGit.raw(['sparse-checkout', 'set', subPath]);
    await repoGit.checkout(ref);

    const src = path.join(tmpDir, subPath);
    await copy(src, dest);
  } finally {
    await remove(tmpDir);
  }
}
