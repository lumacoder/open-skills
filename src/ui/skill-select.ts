import { checkbox } from '@inquirer/prompts';
import { SkillMeta } from '../types/index.js';

export async function promptSkills(categoryName: string, skills: SkillMeta[]): Promise<SkillMeta[]> {
  const choices = skills.map((s) => ({
    name: `${s.display_name} — ${s.description} (${s.author || 'unknown'})`,
    value: s.name,
  }));

  const selectedNames = await checkbox<string>({
    message: `${categoryName} — 选择要安装的 skills（Space 多选，Enter 确认）：`,
    choices,
  });

  return skills.filter((s) => selectedNames.includes(s.name));
}
