import { simpleGit } from 'simple-git';
import { parseGitHubUrl, fetchGitHubRepo } from './github-utils.js';

const FALLBACK_REFS = ['main', 'master'];

/**
 * 自动探测远程 Git 仓库的默认分支。
 *
 * 策略：
 * 1. GitHub 仓库 → 调用 GitHub API 获取 default_branch（最快最准）
 * 2. 其他 Git 仓库 → git ls-remote --symref <url> HEAD 解析
 * 3. 全部失败 → 依次尝试 fallbackRef / main / master
 */
export async function resolveGitRef(url: string, fallbackRef?: string): Promise<string> {
  // 1. GitHub API 捷径
  const gh = parseGitHubUrl(url);
  if (gh) {
    try {
      const repo = await fetchGitHubRepo(gh.owner, gh.repo);
      if (repo.default_branch) {
        return repo.default_branch;
      }
    } catch {
      // API 失败，继续走 git ls-remote
    }
  }

  // 2. git ls-remote --symref
  try {
    const git = simpleGit();
    const output = await git.raw(['ls-remote', '--symref', url, 'HEAD']);
    // 示例输出：
    // ref: refs/heads/main\tHEAD
    // a1b2c3d...\tHEAD
    const match = output.match(/ref:\s+refs\/heads\/([^\s]+)/);
    if (match && match[1]) {
      return match[1];
    }
  } catch {
    // 无权限或网络问题，继续回退
  }

  // 3. 回退分支列表
  const candidates = [
    ...(fallbackRef ? [fallbackRef] : []),
    ...FALLBACK_REFS,
  ];
  return candidates[0] ?? 'main';
}

/**
 * 尝试用候选分支列表 clone，自动跳过不存在的分支。
 * 返回实际成功使用的分支名。
 */
export async function cloneWithResolvedRef(
  url: string,
  dest: string,
  options: {
    ref?: string;
    subPath?: string;
    noCheckout?: boolean;
  } = {}
): Promise<string> {
  const git = simpleGit();

  // 先自动探测默认分支
  const resolved = await resolveGitRef(url, options.ref);

  // 构造候选列表：已解析的优先，再加上通用 fallback
  const candidates = Array.from(
    new Set([resolved, ...(options.ref && options.ref !== resolved ? [options.ref] : []), ...FALLBACK_REFS])
  );

  for (const ref of candidates) {
    const args = ['--depth', '1', '--branch', ref];
    if (options.noCheckout) args.push('--no-checkout');

    try {
      await git.clone(url, dest, args);
      return ref;
    } catch (err: any) {
      const msg = err?.message || String(err);
      // 分支不存在，尝试下一个
      if (msg.includes('Remote branch') && msg.includes('not found')) {
        continue;
      }
      // 其他错误直接抛出
      throw err;
    }
  }

  throw new Error(`无法克隆 ${url}：所有候选分支均不存在 (${candidates.join(', ')})`);
}
