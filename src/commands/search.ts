import { loadRegistry } from '../core/registry.js';

export async function searchCommand(query: string) {
  if (!query) {
    console.log('请输入搜索关键词：open-skills search <keyword>');
    process.exit(1);
  }
  const q = query.toLowerCase();
  const registry = await loadRegistry();
  const results: { group: string; skillName: string; displayName: string; description: string }[] = [];

  for (const group of registry) {
    for (const skill of group.skills) {
      const haystack = `${skill.name} ${skill.display_name} ${skill.description} ${skill.tags.join(' ')}`.toLowerCase();
      if (haystack.includes(q)) {
        results.push({
          group: group.displayName,
          skillName: skill.name,
          displayName: skill.display_name,
          description: skill.description,
        });
      }
    }
  }

  if (results.length === 0) {
    console.log('未找到匹配的 skills');
    return;
  }

  console.log(`找到 ${results.length} 个匹配结果：\n`);
  for (const r of results) {
    console.log(`[${r.group}] ${r.displayName} (${r.skillName})`);
    console.log(`  ${r.description}\n`);
  }
}
