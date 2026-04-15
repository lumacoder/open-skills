export type InstallScope = 'global' | 'local';

export type SourceType = 'git' | 'curl' | 'local';

export interface SkillSource {
  type: SourceType;
  url: string;
  path?: string;
  ref?: string;
}

export interface SkillBundle {
  path: string;
}

export interface SkillTransformRule {
  remove_frontmatter?: string[];
  map_tools?: Record<string, string>;
  inject_header?: string;
  strip_bash_preamble?: boolean;
}

export interface SkillMeta {
  name: string;
  display_name: string;
  description: string;
  category: string;
  tags: string[];
  source?: SkillSource;
  bundle?: SkillBundle;
  author?: string;
  version?: string;
  license?: string;
  agent?: string;
  transform?: Record<string, SkillTransformRule>;
}

export interface CategoryGroup {
  id: string;
  displayName: string;
  skills: SkillMeta[];
}

export interface InstallResult {
  skill: SkillMeta;
  success: boolean;
  message: string;
  targetPath: string;
}

export interface EditorPreset {
  id: string;
  name: string;
  filePath: string;
  type: 'file' | 'directory';
  defaultEnabled: boolean;
  isSkillType: boolean;
}

export interface MarkerBlock {
  type: 'source' | 'rule' | 'user' | 'file';
  source?: string;
  id?: string;
  priority?: string;
  count?: number;
  content: string;
  raw: string;
}
