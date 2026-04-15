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

# 非交互式（CI/脚本友好）
open-skills create my-awesome-skill \
  --category frontend \
  --display-name "My Awesome Skill" \
  --description "What this skill does" \
  --author "your-name"
```

创建后会自动生成：
- `bundles/{category}/{name}/SKILL.md` — 脚手架内容
- `registry/{name}.yaml` — 自动注册的元数据

## 本地开发与管理 Skill 数据源

### 环境准备

```bash
git clone <repo> && cd open-skills
npm install
npm run build          # 构建 dist/
```

开发时可以直接用 `npm run dev` 代替 `node dist/cli.js`。

### 创建新 Skill

#### 方式 A：开发者面板（推荐）
```bash
npm run dev -- --dev
# 或
node dist/cli.js --dev
```

在面板中选择 **➕ 创建新 Skill**，交互式填写名称、分类、描述，即可自动生成 bundle 和 registry YAML。

#### 方式 B：命令行快速创建
见上文「快速创建 Skill」。

### 开发 Skill 内容

创建后直接编辑 bundle 下的 `SKILL.md`：

```bash
code bundles/frontend/my-awesome-skill/SKILL.md
```

一个标准的 `SKILL.md` 结构示例：

```markdown
---
name: my-awesome-skill
display_name: "My Awesome Skill"
description: "What this skill does"
version: "1.0.0"
author: your-name
---

# My Awesome Skill

## 规则

1. ...
2. ...
```

> **注意**：对于非 git 来源的 skill（本地开发），`bundle.path` 指向的就是这个目录。

### 管理 Skill 数据源

#### 本地 Bundle（非 git 库）
如果你开发的 skill 不打算放在远程 git 仓库，直接放在 `bundles/` 下即可：

```bash
# 进入开发者面板扫描自动注册
node dist/cli.js --dev
# → 选择 "扫描并自动注册 Bundles"
```

或在命令行直接扫描并校验：
```bash
npm run validate-registry    # 会先自动扫描注册，再校验
```

#### 远程 Git 来源
如果 skill 来自远程仓库，在 `registry/{name}.yaml` 中配置 `source`：

```yaml
name: react-best-practices
display_name: "React Best Practices"
category: frontend
source:
  type: git
  url: https://github.com/vercel-labs/agent-skills.git
  path: skills/react-best-practices    # 仓库内子路径（可选）
  ref: main
```

同步到本地 bundle：
```bash
node dist/cli.js sync --category frontend --name react-best-practices
```

### 验证与测试

```bash
# 校验所有 registry YAML 格式和必填字段
npm run validate-registry

# 测试安装到本地
node dist/cli.js --editor claude-code --scope local --category frontend

# 查看 registry 状态
node dist/cli.js list
node dist/cli.js search my-awesome-skill
```

### 发布前检查清单

```bash
npm run prepublishOnly    # lint + build + validate-registry
```

这条命令会：
1. 运行 TypeScript 类型检查
2. 构建 `dist/`
3. 自动扫描 `bundles/` 补全未注册的 skill
4. 校验所有 registry YAML 的完整性

### 完整开发流程示例

```bash
# Step 1: 创建
node dist/cli.js create docker-best-practices \
  --category devops \
  --display-name "Docker Best Practices" \
  --description "Dockerfile and compose guidelines"

# Step 2: 开发
code bundles/devops/docker-best-practices/SKILL.md

# Step 3: 自动注册 + 校验
npm run validate-registry

# Step 4: 本地安装测试
node dist/cli.js --editor claude-code --scope local --category devops

# Step 5: 提交
npm add -A && git commit -m "feat: add docker-best-practices skill"
```

## 支持的目标编辑器

- Claude Code (`~/.claude/skills/`)
- Hermes (`~/.hermes/skills/`)
- Cursor (`.cursorrules`)
- Windsurf (`.windsurfrules`)
- Cline (`.clinerules`)
- Cursor Skills (`.cursor/skills/`)
- Roo-Cline (`.roorules`)
- Antigravity (`.agents/skills/`)
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
