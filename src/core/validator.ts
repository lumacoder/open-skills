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

  const indexPath = path.join(REGISTRY_DIR, '_index.yaml');
  if (!(await pathExists(indexPath))) {
    errors.push({ file: indexPath, message: 'Missing registry _index.yaml' });
  } else {
    const indexContent = await readFile(indexPath, 'utf-8');
    let indexParsed: { categories?: { id: string; display_name: string }[] };
    try {
      indexParsed = YAML.parse(indexContent);
    } catch (e: any) {
      errors.push({ file: indexPath, message: `Invalid index YAML: ${e.message}` });
      indexParsed = {};
    }
    if (!indexParsed.categories || !Array.isArray(indexParsed.categories)) {
      errors.push({ file: indexPath, message: 'Index must define "categories" array' });
    }
  }

  const entries = await readdir(REGISTRY_DIR);
  const yamlFiles = entries.filter((f) => f.endsWith('.yaml') || f.endsWith('.yml')).filter((f) => f !== '_index.yaml');

  if (yamlFiles.length === 0) {
    errors.push({ file: REGISTRY_DIR, message: 'No skill YAML files found' });
  }

  for (const file of yamlFiles) {
    const filePath = path.join(REGISTRY_DIR, file);
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

  return errors;
}
