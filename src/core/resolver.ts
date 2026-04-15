import * as path from 'node:path';
import * as os from 'node:os';
import { InstallScope, SkillMeta } from '../types/index.js';

export function resolveTargetDir(scope: InstallScope, skill: SkillMeta): string {
  const agent = inferAgent(skill);
  const base = scope === 'global' ? os.homedir() : process.cwd();

  switch (agent) {
    case 'claude-code':
      return path.join(base, '.claude', 'skills');
    case 'hermes':
      return path.join(base, '.hermes', 'skills');
    case 'openclaw':
      return path.join(base, '.hermes', 'skills', 'openclaw-imports');
    case 'codex':
      return path.join(base, '.codex', 'skills');
    case 'opencode':
      return path.join(base, '.opencode', 'skills');
    default:
      return path.join(base, '.skills', skill.category);
  }
}

function inferAgent(skill: SkillMeta): string {
  if (skill.agent) return skill.agent;
  const tags = skill.tags.map((t) => t.toLowerCase());
  if (tags.includes('claude-code')) return 'claude-code';
  if (tags.includes('hermes')) return 'hermes';
  if (tags.includes('openclaw')) return 'openclaw';
  if (tags.includes('codex')) return 'codex';
  if (tags.includes('opencode')) return 'opencode';

  // fallback by category heuristics
  return 'claude-code';
}
