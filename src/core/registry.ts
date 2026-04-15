import * as path from 'node:path';
import * as YAML from 'yaml';
import { readdir, readFile } from './fs-utils.js';
import { SkillMeta, CategoryGroup } from '../types/index.js';

const REGISTRY_DIR = path.join(process.cwd(), 'registry');

export async function loadRegistry(): Promise<CategoryGroup[]> {
  const groups: CategoryGroup[] = [];
  const entries = await readdir(REGISTRY_DIR, { withFileTypes: true });
  const dirs = entries.filter((e) => e.isDirectory()).sort((a, b) => a.name.localeCompare(b.name));

  for (const dir of dirs) {
    const categoryPath = path.join(REGISTRY_DIR, dir.name);
    const files = await readdir(categoryPath);
    const yamlFiles = files.filter((f) => f.endsWith('.yaml') || f.endsWith('.yml'));

    const skills: SkillMeta[] = [];
    for (const file of yamlFiles) {
      const content = await readFile(path.join(categoryPath, file), 'utf-8');
      const parsed = YAML.parse(content);
      skills.push(parsed as SkillMeta);
    }

    if (skills.length > 0) {
      groups.push({
        id: dir.name,
        displayName: categoryDisplayName(dir.name),
        skills: skills.sort((a, b) => a.display_name.localeCompare(b.display_name)),
      });
    }
  }

  return groups;
}

function categoryDisplayName(id: string): string {
  const map: Record<string, string> = {
    frontend: '前端开发',
    backend: '后端开发',
    devops: '运维 / DevOps',
    product: '产品设计',
    'ui-ux': 'UI / UX',
    testing: '测试',
    'data-science': '数据科学',
    fullstack: '全栈通用',
  };
  return map[id] || id;
}

export function getCategoryById(groups: CategoryGroup[], id: string): CategoryGroup | undefined {
  return groups.find((g) => g.id === id);
}
