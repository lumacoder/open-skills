import type { RemoteResolver } from './remote-resolver.js';
import type { SkillMetaV3 } from '../../types/index.js';
import { parseGitHubUrl, fetchGitHubRepo, fetchGitHubLatestTag } from '../github-utils.js';

export class ClawHubResolver implements RemoteResolver {
  provider = 'clawhub';

  async resolve(ref: string): Promise<Partial<SkillMetaV3>> {
    // Full GitHub URL
    if (ref.startsWith('https://github.com/')) {
      const parsed = parseGitHubUrl(ref);
      if (parsed) {
        const repo = await fetchGitHubRepo(parsed.owner, parsed.repo);
        const version = (await fetchGitHubLatestTag(parsed.owner, parsed.repo)) || repo.default_branch || 'main';
        return {
          name: parsed.repo,
          displayName: repo.name,
          description: repo.description || '',
          author: repo.owner.login,
          license: repo.license?.spdx_id || '',
          version,
        };
      }
    }

    // Try owner/repo via GitHub API first (most ClawHub skills are GitHub-hosted)
    const shortMatch = ref.match(/^([^/]+)\/([^/]+)$/);
    if (shortMatch) {
      try {
        const owner = shortMatch[1];
        const repoName = shortMatch[2];
        const repo = await fetchGitHubRepo(owner, repoName);
        const version = (await fetchGitHubLatestTag(owner, repoName)) || repo.default_branch || 'main';
        return {
          name: repoName,
          displayName: repo.name,
          description: repo.description || '',
          author: repo.owner.login,
          license: repo.license?.spdx_id || '',
          version,
        };
      } catch {
        // ignore GitHub errors, fall through to page scraping
      }
    }

    // Fallback: scrape clawhub.ai page for metadata
    const skillName = ref.includes('/') ? ref.split('/').pop()! : ref;
    const clawhubUrl = `https://clawhub.ai/skills/${skillName}`;
    try {
      const res = await fetch(clawhubUrl, { headers: { 'User-Agent': 'open-skills' } });
      if (res.ok) {
        const html = await res.text();
        const ogTitle = html.match(/<meta[^>]*property="og:title"[^>]*content="(.*?)"[^>]*\/?>/i)?.[1] || '';
        const ogDesc = html.match(/<meta[^>]*property="og:description"[^>]*content="(.*?)"[^>]*\/?>/i)?.[1] || '';
        const title = html.match(/<title>(.*?)<\/title>/i)?.[1] || '';

        // Try to find a GitHub repo link in the page to enrich metadata
        const repoMatch = html.match(/https:\/\/github\.com\/([^"'>\s]+)/);
        if (repoMatch) {
          const gh = parseGitHubUrl(repoMatch[1]);
          if (gh) {
            try {
              const repo = await fetchGitHubRepo(gh.owner, gh.repo);
              const version = (await fetchGitHubLatestTag(gh.owner, gh.repo)) || repo.default_branch || 'main';
              return {
                name: skillName,
                displayName: ogTitle.split(' - ')[0] || repo.name,
                description: ogDesc || repo.description || '',
                author: repo.owner.login,
                license: repo.license?.spdx_id || '',
                version,
              };
            } catch {
              // ignore
            }
          }
        }

        return {
          name: skillName,
          displayName: ogTitle.split(' - ')[0] || title.split(' - ')[0] || skillName,
          description: ogDesc || '',
        };
      }
    } catch {
      // ignore fetch errors
    }

    throw new Error(`Cannot resolve clawhub ref: "${ref}". Expected owner/repo, GitHub URL, or clawhub skill name.`);
  }
}
