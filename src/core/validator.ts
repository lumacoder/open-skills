import * as path from 'node:path';
import * as YAML from 'yaml';
import { pathExists, readdir, readFile } from './fs-utils.js';
import { SkillMeta } from '../types/index.js';

const REGISTRY_DIR = path.join(process.cwd(), 'registry');

export interface ValidationError {
  file: string;
  message: string;
}

export async function validateRegistry(): Promise<ValidationError[]> {
  const errors: ValidationError[] = [];

  if (!(await pathExists(REGISTRY_DIR))) {
    errors.push({ file: 'registry', message: 'Registry directory does not exist' });
    return errors;
  }

  const entries = await readdir(REGISTRY_DIR, { withFileTypes: true });
  const dirs = entries.filter((e) => e.isDirectory());

  for (const dir of dirs) {
    const categoryPath = path.join(REGISTRY_DIR, dir.name);
    const files = await readdir(categoryPath);
    const yamlFiles = files.filter((f) => f.endsWith('.yaml') || f.endsWith('.yml'));

    for (const file of yamlFiles) {
      const filePath = path.join(categoryPath, file);
      const content = await readFile(filePath, 'utf-8');
      let parsed: unknown;
      try {
        parsed = YAML.parse(content);
      } catch (e: any) {
        errors.push({ file: filePath, message: `Invalid YAML: ${e.message}` });
        continue;
      }

      const skill = parsed as Partial<SkillMeta>;
      if (!skill.name) errors.push({ file: filePath, message: 'Missing required field: name' });
      if (!skill.display_name) errors.push({ file: filePath, message: 'Missing required field: display_name' });
      if (!skill.description) errors.push({ file: filePath, message: 'Missing required field: description' });
      if (!skill.category) errors.push({ file: filePath, message: 'Missing required field: category' });
      if (!skill.source && !skill.bundle) {
        errors.push({ file: filePath, message: 'Must define either source or bundle' });
      }
      if (skill.source && !['git', 'curl', 'local'].includes(skill.source.type)) {
        errors.push({ file: filePath, message: `Invalid source type: ${skill.source.type}` });
      }
    }
  }

  return errors;
}
