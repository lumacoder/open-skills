import { select } from '@inquirer/prompts';
import { InstallScope } from '../types/index.js';

export async function promptScope(): Promise<InstallScope> {
  const answer = await select<string>({
    message: '选择安装范围：',
    choices: [
      { name: '全局安装 (Global)', value: 'global' },
      { name: '本地安装 (Local)', value: 'local' },
    ],
  });
  return answer as InstallScope;
}
