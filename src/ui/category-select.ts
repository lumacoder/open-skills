import { select } from '@inquirer/prompts';
import { CategoryGroup } from '../types/index.js';

export async function promptCategory(groups: CategoryGroup[]): Promise<CategoryGroup | null> {
  const choices = groups.map((g) => ({
    name: `${g.displayName} (${g.skills.length})`,
    value: g.id,
  }));

  const answer = await select<string>({
    message: '选择分类：',
    choices,
  });

  return groups.find((g) => g.id === answer) || null;
}
