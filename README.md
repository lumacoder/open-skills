# open-skills

一个面向多 IDE/AI 编辑器的 Skill 分发与同步引擎。

## 安装

```bash
npx skills add lumacoder/open-skills -g -y
```

## 使用

启动交互式安装引导：

```bash
open-skills
```

快捷指定参数：

```bash
open-skills --editor claude-code,cursor --scope global --category frontend
```

## CLI 命令

| 命令 | 说明 |
|------|------|
| `open-skills` | 启动交互式安装引导 |
| `open-skills list` | 列出所有可用 skills |
| `open-skills search <keyword>` | 搜索 skills |
| `open-skills validate` | 校验 registry 完整性 |
| `open-skills sync` | 将远程 source 同步到本地 bundle |
| `open-skills update` | 检测并更新已安装的 skills |
| `open-skills export <file>` | 导出当前 stack |
| `open-skills import <file>` | 导入 stack 一键安装 |

## 支持的目标编辑器

- Claude Code (`~/.claude/skills/`)
- Hermes (`~/.hermes/skills/`)
- Cursor (`.cursorrules`)
- Windsurf (`.windsurfrules`)
- Cline (`.clinerules`)
- GitHub Copilot (`.github/skills/`)

## 目录结构

```
open-skills/
├── src/           # 源代码
├── registry/      # skill 元数据清单
├── bundles/       # 本地副本
├── docs/          # 文档
└── dist/          # 构建输出
```

## License

MIT
