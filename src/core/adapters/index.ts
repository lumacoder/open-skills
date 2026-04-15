import { EditorPreset } from '../../types/index.js';
import { BaseAdapter } from './base-adapter.js';
import { ClaudeAdapter } from './claude-adapter.js';
import { HermesAdapter } from './hermes-adapter.js';
import { CursorAdapter } from './cursor-adapter.js';
import { WindsurfAdapter } from './windsurf-adapter.js';
import { ClineAdapter } from './cline-adapter.js';

export function createAdapter(preset: EditorPreset): BaseAdapter {
  switch (preset.id) {
    case 'claude-code':
      return new ClaudeAdapter(preset);
    case 'hermes':
      return new HermesAdapter(preset);
    case 'cursor':
      return new CursorAdapter(preset);
    case 'windsurf':
      return new WindsurfAdapter(preset);
    case 'cline':
      // Cline uses same format as Cursor for MVP
      return new CursorAdapter(preset);
    case 'github-copilot':
      return new ClaudeAdapter(preset);
    default:
      throw new Error(`Unknown editor preset: ${preset.id}`);
  }
}

export * from './base-adapter.js';
export * from './claude-adapter.js';
export * from './hermes-adapter.js';
export * from './cursor-adapter.js';
export * from './windsurf-adapter.js';
