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
| `open-skills create <name> --category <cat>` | 创建本地 Skill 脚手架（dev 模式常用） |
| `open-skills --dev` | 启动开发者管理面板 |

## 快速创建 Skill

```bash
# 交互式创建
open-skills create

# 快速创建（指定所有字段）
open-skills create my-awesome-skill \
  --category frontend \
  --display-name "My Awesome Skill" \
  --description "What this skill does" \
  --author "your-name"
```

创建后会自动生成：
- `bundles/{category}/{name}/SKILL.md` — 脚手架内容
- `registry/{name}.yaml` — 自动注册的元数据

## 开发者模式

通过 `open-skills --dev` 或设置环境变量 `OPEN_SKILLS_DEV=1` 启动开发者面板：

```bash
open-skills --dev
```

面板功能：
- 查看 Registry 状态（分类、skill 数量、数据源类型）
- 创建新 Skill（生成 bundle + registry YAML）
- 扫描并自动注册 Bundles（将 bundles/ 下新目录自动生成 registry YAML）
- 校验 Registry 完整性

### 发布前自动检测

`npm run validate-registry` 会先自动扫描 bundles/ 目录，将未\u6ce8册的 skill \u81ea动\u751f\u6210 YAML，\u518d\u8fdb\u884c\u6821\u9a8c\u3002

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
