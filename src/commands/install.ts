import { promptEditor } from '../ui/editor-select.js';
import { promptScope } from '../ui/scope-select.js';
import { promptCategory } from '../ui/category-select.js';
import { promptSkills } from '../ui/skill-select.js';
import { promptConfirm } from '../ui/confirm-panel.js';
import { loadRegistry } from '../core/registry.js';
import { Engine } from '../core/engine.js';
import { createAdapter } from '../core/adapters/index.js';
import { editorPresets } from '../core/presets/editors.js';
import { InstallScope, SkillMeta, CategoryGroup, EditorPreset } from '../types/index.js';

interface InstallArgs {
  editors?: string[];
  category?: string;
  scope?: InstallScope;
}

function parseArgs(args: string[]): InstallArgs {
  const result: InstallArgs = {};
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--editor' && args[i + 1]) {
      result.editors = args[i + 1].split(',').map((s) => s.trim());
      i++;
    } else if (args[i] === '--category' && args[i + 1]) {
      result.category = args[i + 1];
      i++;
    } else if (args[i] === '--scope' && args[i + 1]) {
      result.scope = args[i + 1] as InstallScope;
      i++;
    }
  }
  return result;
}

export async function installCommand(args: string[] = []) {
  const parsed = parseArgs(args);
  const registry = await loadRegistry();

  let selectedEditors: EditorPreset[];
  if (parsed.editors) {
    selectedEditors = editorPresets.filter((p) => parsed.editors!.includes(p.id));
    if (selectedEditors.length === 0) {
      console.log('未找到指定的编辑器');
      process.exit(1);
    }
  } else {
    selectedEditors = await promptEditor(editorPresets.filter((p) => p.defaultEnabled));
    if (selectedEditors.length === 0) {
      console.log('未选择编辑器，已取消');
      process.exit(0);
    }
  }

  const scope = parsed.scope || (await promptScope());

  let category: CategoryGroup | null = null;
  if (parsed.category) {
    category = registry.find((g) => g.id === parsed.category) || null;
    if (!category) {
      console.log('未找到指定的分类');
      process.exit(1);
    }
  }

  while (!category) {
    category = await promptCategory(registry);
    if (!category) break;
  }

  if (!category) {
    console.log('已取消');
    process.exit(0);
  }

  let selectedSkills: SkillMeta[] = [];
  while (selectedSkills.length === 0) {
    selectedSkills = await promptSkills(category.displayName, category.skills);
    if (selectedSkills.length === 0) {
      console.log('未选择任何 skill，返回重选...');
    }
  }

  const confirm = await promptConfirm(selectedEditors, scope, selectedSkills);
  if (confirm === null) {
    console.log('已取消');
    process.exit(0);
  }
  if (confirm === false) {
    // Back to skill selection
    selectedSkills = await promptSkills(category.displayName, category.skills);
    if (selectedSkills.length === 0) {
      console.log('未选择任何 skill，已取消');
      process.exit(0);
    }
    const confirm2 = await promptConfirm(selectedEditors, scope, selectedSkills);
    if (confirm2 !== true) {
      console.log('已取消');
      process.exit(0);
    }
  }

  console.log(`\n正在安装 ${selectedSkills.length} 个 skills 到 ${selectedEditors.length} 个编辑器...\n`);
  const engine = new Engine();
  const results: { skill: SkillMeta; success: boolean; message: string }[] = [];

  for (const preset of selectedEditors) {
    const adapter = createAdapter(preset);
    const res = await engine.process(adapter, scope, selectedSkills);
    results.push(...res);
  }

  const success = results.filter((r) => r.success);
  const failed = results.filter((r) => !r.success);

  console.log(`安装完成：成功 ${success.length}，失败 ${failed.length}`);
  for (const r of failed) {
    console.log(`✗ ${r.skill.display_name}: ${r.message}`);
  }
  for (const r of success) {
    console.log(`✓ ${r.skill.display_name}: ${r.message}`);
  }
}
