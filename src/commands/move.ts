import { loadRegistryV3, saveRegistryV3, getSkillByNameV3, getCategoryByIdV3 } from '../core/registry-v3.js';

export async function moveCommand(args: string[]) {
  if (args.length < 2) {
    console.error('用法: open-skills move <skill-name> <new-category>');
    process.exit(1);
  }

  const [skillName, newCategory] = args;
  
  const registry = await loadRegistryV3();
  const skill = getSkillByNameV3(registry, skillName);
  
  if (!skill) {
    console.error(`未找到 Skill: ${skillName}`);
    process.exit(1);
  }

  const category = getCategoryByIdV3(registry, newCategory);
  if (!category) {
    console.error(`分类未找到: ${newCategory}。你可以在 registry/skills.json 的 categories 列表中查看有效分类。`);
    process.exit(1);
  }

  const oldCategory = skill.category;
  skill.category = newCategory;
  
  await saveRegistryV3(registry);
  console.log(`\u2713 成功将 ${skillName} 从 [${oldCategory}] 移动到 [${newCategory}]`);
}
