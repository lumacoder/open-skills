# open-skills

> 多 IDE/AI 编辑器的 Skill 分发与同步引擎。

通过统一的 Skill 格式，将提示词工程、设计规范、开发流程等知识资产一键分发到 Claude Code、Cursor、Windsurf 等主流 AI 编辑器。

## 目录

- [快速开始](#快速开始)
- [安装](#安装)
- [核心功能](#核心功能)
- [使用指南](#使用指南)
- [CLI 命令参考](#cli-命令参考)
- [内置 Skills](#内置-skills)
- [开发指南](#开发指南)
  - [环境准备](#环境准备)
  - [创建 Skill](#创建-skill)
  - [管理数据源](#管理数据源)
  - [验证与发布](#验证与发布)
- [支持的目标编辑器](#支持的目标编辑器)
- [目录结构](#目录结构)
- [License](#license)

---

## 快速开始

```bash
# 安装 CLI
npx skills add lumacoder/open-skills -g -y

# 启动交互式安装
open-skills

# 或一行命令指定参数
open-skills --editor claude-code,cursor --scope global --category frontend
```

---

## 安装

```bash
# npm
npm install -g open-skills

# pnpm
pnpm add -g open-skills

# npx（无需全局安装）
npx open-skills
```

---

## 核心功能

| 功能 | 说明 |
|------|------|
| **一键分发** | 将 Skill 同步到多个 IDE 的目标目录 |
| **远程同步** | 支持 GitHub / Git 子路径稀疏检出，自动更新 |
| **交互式引导** | 无需记忆参数，向导式选择编辑器、范围、分类 |
| **SkillStore 集成** | 通过 slug 自动解析远程 Skill 元数据 |
| **Stack 管理** | 导出/导入 Skill 组合，实现团队配置共享 |

---

## 使用指南

### 交互式安装（推荐）

```bash
open-skills
```

按向导选择目标编辑器、安装范围（global/local）和 Skill 分类即可。

### 快捷参数安装

```bash
open-skills --editor claude-code,cursor --scope global --category frontend
```

### 搜索 Skills

```bash
# 本地搜索
open-skills search react

# 按名称精确匹配
open-skills search react -n

# 远程 GitHub 搜索
open-skills search react --remote

# 直接解析 GitHub 子路径
open-skills search "https://github.com/owner/repo/tree/main/.claude/skills/my-skill" --remote

# SkillStore slug 查询
open-skills search "1bertogit/frontend-design" --remote
```

### Stack 导出与导入

```bash
# 导出当前配置
open-skills export my-stack.json

# 在新环境一键恢复
open-skills import my-stack.json
```

---

## CLI 命令参考

| 命令 | 说明 |
|------|------|
| `open-skills` | 启动交互式安装引导 |
| `open-skills list` | 列出所有可用 skills |
| `open-skills search <keyword>` | 本地搜索 skills |
| `open-skills search <keyword> --remote` | 远程搜索（GitHub / SkillStore） |
| `open-skills validate` | 校验 registry 完整性 |
| `open-skills sync` | 将远程 source 同步到本地 bundle |
| `open-skills update` | 检测并更新已安装的 skills |
| `open-skills export <file>` | 导出当前 stack |
| `open-skills import <file>` | 导入 stack 一键安装 |
| `open-skills create <name> --category <cat>` | 创建本地 Skill 脚手架 |
| `open-skills move <name> <new-cat>` | 移动 Skill 到新分类 |
| `open-skills --dev` | 启动开发者管理面板 |

---

## 内置 Skills

| ID | 名称 | 简介 |
|----|------|------|
| `frontend-design` | 前端页面设计 | 创建具有高设计质量的独特、生产级前端界面。避免千篇一律的 AI 审美风格。 |
| `ui-design` | UI 样式调整与协作 | 通过"截图定位 → 现状描述 → 方案选择 → 改代码 → 微调"的结构化流程修改 UI。 |
| `andrej-karpathy-skills` | Karpathy 提示词优化技巧 | 基于 Andrej Karpathy 对 LLM 编码缺陷的观察，改进 Agent 行为表现。 |
| `canvas-design` | Canvas 海报与艺术设计 | 运用设计理念创建精美的 PNG/PDF 视觉艺术文档。 |
| `deep-research` | 深度研究与分析 | 执行复杂的深度分析和研究任务，自动收集、整理和总结多维度信息。 |
| `frontend-design-ultimate` | 前端设计终极版 | 极致的用户界面、交互动画与现代化网页开发规范。 |
| `shadcn-ui` | Shadcn UI 专家 | 高质量的 Shadcn UI 组件集成与定制设计支持。 |
| `tailwind-v4-shadcn` | Tailwind v4 & Shadcn | 结合最新 Tailwind CSS v4 与 Shadcn UI 最佳实践。 |
| `baoyu-xhs-images` | 小红书爆款配图生成 | 基于宝玉的小红书图片设计风格，自动生成社交平台配图。 |

---

## 开发指南

### 环境准备

```bash
git clone <repo> && cd open-skills
npm install
npm run build
```

开发时可用 `npm run dev` 代替 `node dist/cli.js`。

### 创建 Skill

#### 方式 A：开发者面板（推荐）

```bash
npm run dev -- --dev
```

选择 **➕ 创建新 Skill**，交互式填写名称、分类、描述，自动生成 bundle 并注册到 `registry/skills.json`。

#### 方式 B：命令行

```bash
open-skills create my-skill \
  --category frontend \
  --display-name "My Skill" \
  --description "What this skill does" \
  --author "your-name"
```

创建后自动生成：
- `bundles/skills/{name}/SKILL.md` — Skill 内容
- `registry/skills.json` — 元数据注册

> **注意**：本地 bundle 统一存放在 `bundles/skills/` 下，不再按分类创建子目录。分类仅在 `registry/skills.json` 中标记。

#### Skill 内容结构

编辑生成的 `SKILL.md`：

```markdown
---
name: my-skill
display_name: "My Skill"
description: "What this skill does"
version: "1.0.0"
author: your-name
---

# My Skill

## 规则

1. ...
2. ...
```

### 管理数据源

#### 本地 Bundle（非 Git 来源）

直接放在 `bundles/skills/` 下，通过开发者面板或命令行扫描注册：

```bash
# 扫描并自动注册
npm run dev -- --dev
# → 选择 "扫描并自动注册 Bundles"

# 或命令行验证（会自动扫描）
npm run validate-registry
```

#### 远程 Git 来源

在 `registry/skills.json` 中配置 `origin`：

```json
{
  "name": "react-best-practices",
  "displayName": "React Best Practices",
  "category": "frontend",
  "origin": {
    "type": "git",
    "url": "https://github.com/vercel-labs/agent-skills.git",
    "path": "skills/react-best-practices",
    "refName": "main"
  }
}
```

同步到本地：

```bash
open-skills sync --category frontend --name react-best-practices
```

> `sync` 支持 `github` / `git` 类型，仅拉取 `path` 指定的子文件夹（sparse-checkout）。

#### GitHub 子路径

```json
{
  "name": "frontend-design",
  "category": "frontend",
  "origin": {
    "type": "github",
    "ref": "1bertogit/modern-face-definitive",
    "path": ".claude/skills/frontend-design",
    "refName": "main"
  }
}
```

#### SkillStore 来源

```json
{
  "name": "frontend-design",
  "category": "frontend",
  "origin": {
    "type": "skillstore",
    "ref": "1bertogit/frontend-design"
  }
}
```

在 Web 开发者面板中填写 slug，点击「查询填充」即可自动获取元数据。

### 验证与发布

```bash
# 校验 registry 格式和必填字段
npm run validate-registry

# 测试本地安装
node dist/cli.js --editor claude-code --scope local --category frontend

# 发布前完整检查
npm run prepublishOnly    # lint + build + validate-registry
```

完整开发流程示例：

```bash
# 1. 创建
node dist/cli.js create docker-best-practices \
  --category devops \
  --display-name "Docker Best Practices" \
  --description "Dockerfile and compose guidelines"

# 2. 开发
code bundles/skills/docker-best-practices/SKILL.md

# 3. 自动注册 + 校验
npm run validate-registry

# 4. 本地安装测试
node dist/cli.js --editor claude-code --scope local --category devops

# 5. 提交
git add -A && git commit -m "feat: add docker-best-practices skill"
```

---

## 支持的目标编辑器

| 编辑器 | 安装路径 |
|--------|----------|
| Claude Code | `~/.claude/skills/` |
| Hermes | `~/.hermes/skills/` |
| Cursor | `.cursorrules` |
| Windsurf | `.windsurfrules` |
| Cline | `.clinerules` |
| Cursor Skills | `.cursor/skills/` |
| Roo-Cline | `.roorules` |
| Antigravity | `.agents/skills/` |
| GitHub Copilot | `.github/skills/` |

> **注意**：对于 directory 模式的编辑器（如 Claude Code），`update` 和 `install` 会清理目标目录中不在当前安装清单内的文件。请勿在这些目录中存放手动文件。

---

## 目录结构

```
open-skills/
├── src/                    # 源代码
├── registry/
│   └── skills.json         # V3 主数据源（分类 + skill 元数据）
├── bundles/
│   └── skills/             # 本地 skill 副本（平铺）
├── docs/                   # 文档
└── dist/                   # 构建输出
```

---

## License

MIT
