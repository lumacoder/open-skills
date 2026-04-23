import { CursorAdapter } from './cursor-adapter.js';
import type { SkillMeta } from '../../types/index.js';
import type { EditorPreset } from '../../types/index.js';

export class MarkerPluginAdapter extends CursorAdapter {
  constructor(
    preset: EditorPreset,
    private readonly headerTemplate?: string
  ) {
    super(preset);
  }

  generateHeaderContent(skills: SkillMeta[]): string {
    if (!this.headerTemplate) {
      return super.generateHeaderContent(skills);
    }

    return (
      this.headerTemplate
      .replace(/\{agent\}/g, this.name)
      .replace(/\{agentId\}/g, this.id)
      .replace(/\{count\}/g, String(skills.length))
    );
  }
}
