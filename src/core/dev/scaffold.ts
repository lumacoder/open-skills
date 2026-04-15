import * as path from 'node:path';
import * as YAML from 'yaml';
import { ensureDir, writeFile, pathExists, readFile } from '../fs-utils.js';

const BUNDLES_DIR = path.join(process.cwd(), 'bundles');
const REGISTRY_DIR = path.join(process.cwd(), 'registry');

export interface ScaffoldOptions {
  name: string;
  category: string;
  displayName?: string;
  description?: string;
  author?: string;
}

export async function createSkillScaffold(options: ScaffoldOptions): Promise<string> {
  const { name, category, displayName, description, author } = options;
  const bundleDir = path.join(BUNDLES_DIR, category, name);
  const registryPath = path.join(REGISTRY_DIR, `${name}.yaml`);

  if (await pathExists(registryPath)) {
    throw new Error(`Skill "${name}" already registered at ${registryPath}`);
  }

  // 1. Create bundle directory and SKILL.md
  await ensureDir(bundleDir);

  const skillMdContent = generateSkillMd({ name, displayName, description, author });
  await writeFile(path.join(bundleDir, 'SKILL.md'), skillMdContent, 'utf-8');

  // 2. Create registry YAML
  const registryContent = generateRegistryYaml({ name, category, displayName, description, author });
  await writeFile(registryPath, registryContent, 'utf-8');

  return bundleDir;
}

function generateSkillMd(opts: { name: string; displayName?: string; description?: string; author?: string }): string {
  const lines = [
    '---',
    `name: ${opts.name}`,
    `display_name: "${opts.displayName || opts.name}"`,
    `description: "${opts.description || ''}"`,
    'version: "1.0.0"',
    opts.author ? `author: ${opts.author}` : 'author: unknown',
    '---',
    '',
    `# ${opts.displayName || opts.name}`,
    '',
    opts.description || 'Add your skill description here.',
    '',
    '## Rules',
    '',
    '1. ...',
    '',
  ];
  return lines.join('\n');
}

function generateRegistryYaml(opts: { name: string; category: string; displayName?: string; description?: string; author?: string }): string {
  const meta = {
    name: opts.name,
    display_name: opts.displayName || opts.name,
    description: opts.description || `Skill for ${opts.name}`,
    category: opts.category,
    tags: [],
    bundle: {
      path: path.join('bundles', opts.category, opts.name).replace(/\\/g, '/'),
    },
    author: opts.author || 'unknown',
    version: '1.0.0',
    license: 'MIT',
  };
  return YAML.stringify(meta);
}

export async function scanAndAutoRegister(): Promise<{ registered: string[]; skipped: string[] }> {
  const registered: string[] = [];
  const skipped: string[] = [];

  if (!(await pathExists(BUNDLES_DIR))) {
    return { registered, skipped };
  }

  // Load existing registry names
  const existingNames = new Set<string>();
  const registryFiles = await (await import('../fs-utils.js')).readdir(REGISTRY_DIR);
  for (const file of registryFiles.filter((f: string) => f.endsWith('.yaml') || f.endsWith('.yml'))) {
    if (file === '_index.yaml') continue;
    const content = await readFile(path.join(REGISTRY_DIR, file), 'utf-8');
    const parsed = YAML.parse(content);
    if (parsed.name) {
      existingNames.add(parsed.name);
    }
  }

  // Scan bundles directory
  const { readdir } = await import('../fs-utils.js');
  const categoryDirs = await readdir(BUNDLES_DIR, { withFileTypes: true });

  for (const catDir of categoryDirs.filter((d: any) => d.isDirectory())) {
    const skillDirs = await readdir(path.join(BUNDLES_DIR, catDir.name), { withFileTypes: true });
    for (const skillDir of skillDirs.filter((d: any) => d.isDirectory())) {
      const skillName = skillDir.name;
      if (existingNames.has(skillName)) {
        skipped.push(skillName);
        continue;
      }

      const hasSkillMd = await pathExists(path.join(BUNDLES_DIR, catDir.name, skillName, 'SKILL.md'));
      if (!hasSkillMd) {
        skipped.push(`${skillName} (missing SKILL.md)`);
        continue;
      }

      const yamlContent = generateRegistryYaml({
        name: skillName,
        category: catDir.name,
        displayName: skillName,
        description: `Auto-registered skill for ${skillName}`,
      });
      await writeFile(path.join(REGISTRY_DIR, `${skillName}.yaml`), yamlContent, 'utf-8');
      registered.push(skillName);
    }
  }

  return { registered, skipped };
}
