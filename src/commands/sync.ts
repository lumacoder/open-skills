import * as path from 'node:path';
import * as os from 'node:os';
import { simpleGit } from 'simple-git';
import { loadRegistry } from '../core/registry.js';
import { SkillMeta } from '../types/index.js';
import { ensureDir, emptyDir, copy, remove } from '../core/fs-utils.js';

function parseSyncArgs(args: string[]): { category?: string; name?: string } {
  const result: { category?: string; name?: string } = {};
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--category' && args[i + 1]) {
      result.category = args[i + 1];
      i++;
    } else if (args[i] === '--name' && args[i + 1]) {
      result.name = args[i + 1];
      i++;
    }
  }
  return result;
}

export async function syncCommand(args: string[]) {
  const parsed = parseSyncArgs(args);
  const registry = await loadRegistry();
  const skills: SkillMeta[] = [];

  for (const group of registry) {
    if (parsed.category && group.id !== parsed.category) continue;
    for (const skill of group.skills) {
      if (!parsed.name || skill.name === parsed.name) {
        skills.push(skill);
      }
    }
  }

  if (skills.length === 0) {
    console.log('未找到匹配的 skills');
    return;
  }

  for (const skill of skills) {
    if (!skill.source || skill.source.type !== 'git') {
      console.log(`跳过 ${skill.name}: 无 git source`);
      continue;
    }
    const dest = path.join(process.cwd(), 'bundles', skill.category, skill.name);
    await ensureDir(dest);
    await emptyDir(dest);

    try {
      const git = simpleGit();
      const url = skill.source.url;
      const ref = skill.source.ref || 'main';
      const subPath = skill.source.path;

      if (!subPath) {
        await git.clone(url, dest, ['--depth', '1', '--branch', ref]);
        await remove(path.join(dest, '.git'));
      } else {
        const { mkdtemp } = await import('../core/fs-utils.js');
        const tmpDir = await mkdtemp(path.join(os.tmpdir(), 'open-skills-sync-'));
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
      console.log(`✓ 已同步 ${skill.name} → ${dest}`);
    } catch (err: any) {
      console.log(`✗ 同步失败 ${skill.name}: ${err.message || String(err)}`);
    }
  }
}
