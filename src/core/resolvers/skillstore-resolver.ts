import type { RemoteResolver } from './remote-resolver.js';
import type { SkillMetaV3 } from '../../types/index.js';

export class SkillStoreResolver implements RemoteResolver {
  provider = 'skillstore';

  async resolve(ref: string): Promise<Partial<SkillMetaV3>> {
    // Placeholder for SkillStore API integration
    throw new Error('SkillStore resolver not implemented yet');
  }
}
