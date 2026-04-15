import * as path from 'node:path';
import * as YAML from 'yaml';
import { readdir, readFile } from './fs-utils.js';
import { SkillMeta, CategoryGroup } from '../types/index.js';

const REGISTRY_DIR = path.join(process.cwd(), 'registry');

interface CategoryDef {
  id: string;
  display_name: string;
  order: number;
}

interface RegistryIndex {
  categories: CategoryDef[];
}

async function loadRegistryIndex(): Promise<RegistryIndex> {
  const indexPath = path.join(REGISTRY_DIR, '_index.yaml');
  const content = await readFile(indexPath, 'utf-8');
  return YAML.parse(content) as RegistryIndex;
}

export async function loadRegistry(): Promise<CategoryGroup[]> {
  const index = await loadRegistryIndex();
  const categoryMap = new Map<string, CategoryDef>();
  for (const cat of index.categories) {
    categoryMap.set(cat.id, cat);
  }

  const entries = await readdir(REGISTRY_DIR);
  const yamlFiles = entries.filter((f) => f.endsWith('.yaml') || f.endsWith('.yml')).filter((f) => f !== '_index.yaml');

  const skillsByCategory = new Map<string, SkillMeta[]>();

  for (const file of yamlFiles) {
    const content = await readFile(path.join(REGISTRY_DIR, file), 'utf-8');
    const parsed = YAML.parse(content) as SkillMeta;

    if (!categoryMap.has(parsed.category)) {
      console.warn(`[registry] Skill "${parsed.name}" references unknown category "${parsed.category}"`);
    }

    const list = skillsByCategory.get(parsed.category) || [];
    list.push(parsed);
    skillsByCategory.set(parsed.category, list);
  }

  const groups: CategoryGroup[] = [];
  for (const cat of index.categories) {
    const skills = skillsByCategory.get(cat.id) || [];
    if (skills.length > 0) {
      groups.push({
        id: cat.id,
        displayName: cat.display_name,
        skills: skills.sort((a, b) => a.display_name.localeCompare(b.display_name)),
      });
    }
  }

  // Append any skills with uncategorized categories at the end
  for (const [catId, skills] of skillsByCategory) {
    if (!categoryMap.has(catId)) {
      groups.push({
        id: catId,
        displayName: catId,
        skills: skills.sort((a, b) => a.display_name.localeCompare(b.display_name)),
      });
    }
  }

  return groups;
}

export function getCategoryById(groups: CategoryGroup[], id: string): CategoryGroup | undefined {
  return groups.find((g) => g.id === id);
}
