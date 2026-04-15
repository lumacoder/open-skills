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
- Cursor Skills (`.cursor/skills/`)
- Roo-Cline (`.roorules`)
- Antigravity (`.antigravityrules`)
- GitHub Copilot (`.github/skills/`)

> **注意：** 对于 directory 模式的编辑器（如 Claude Code），`update` 和 `install` 会清理目标目录中不在当前安装清单内的文件。请勿在这些目录中存放手动文件。
## 目录结构

```
open-skills/
├── src/           # 源代码
├── registry/      # skill 元数据清单
│   ├── _index.yaml  # 分类定义
│   └── *.yaml       # skill 元数据（平铺）
├── bundles/       # 本地副本
├── docs/          # 文档
└── dist/          # 构建输出
```

## Registry 管理

### 分类管理

所有分类定义集中在 `registry/_index.yaml`：

```yaml
categories:
  - id: frontend
    display_name: "前端开发"
    order: 1
```

新增分类只需修改此文件，无需创建文件夹。

### Skill 清单管理

所有 skill 元数据平铺在 `registry/` 根目录，一个 skill 一个 YAML 文件：

```yaml
name: react-best-practices
display_name: "React Best Practices"
description: "React & Next.js 性能优化指南"
category: frontend
tags: [react, nextjs]
source:
  type: git
  url: https://github.com/vercel-labs/agent-skills.git
  path: skills/react-best-practices
  ref: main
author: Vercel Labs
version: "2.1.0"
license: MIT
```

移动 skill 分类只需修改 YAML 内的 `category` 字段。

### 校验与同步

```bash
npm run validate-registry    # 校验所有 YAML 格式
open-skills validate         # 上述命令的简写
open-skills sync             # 将远程 git source 同步到 bundles/
```

## 开发

```bash
npm install
npm run dev
npm run lint
npm run build
npm run validate-registry
```

## License

MIT
