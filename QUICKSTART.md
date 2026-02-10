# 快速使用指南

## 查看"最新"分类

### 启动本地服务器

```bash
cd prototype
python -m http.server 8000
```

或使用Node.js:

```bash
cd prototype
npx http-server -p 8000
```

### 访问平台

在浏览器中打开: `http://localhost:8000`

### 浏览最新Skills

1. 在左侧分类栏顶部，你会看到 ⭐ **最新** 分类（带星标图标）
2. 点击"最新"分类
3. 查看所有18个新加入的skills

## 添加更多新Skills

### 1. 准备Skill文件

将新的skill仓库放入 `skills/` 文件夹，确保包含 `SKILL.md` 文件：

```markdown
---
name: my-awesome-skill
description: This skill does amazing things
---

# My Awesome Skill

Skill documentation here...
```

### 2. 运行导入脚本

```bash
node scripts/add-new-skills.js
```

脚本会自动：
- ✅ 扫描所有SKILL.md文件
- ✅ 提取skill信息
- ✅ 智能分类
- ✅ 添加到skills.json
- ✅ 标记为新skill
- ✅ 更新分类计数

### 3. 验证结果

```bash
node test-latest-category.js
```

## 当前新Skills列表

共18个新skills已添加：

### 生产力工具 (7个)
- pi-planning-with-files - 文件规划工具
- dispatching-parallel-agents - 并行任务分发
- requesting-code-review - 代码审查
- subagent-driven-development - 子代理开发
- writing-plans - 计划编写
- writing-skills - Skills编写

### AI & LLMs (6个)
- pptx - PowerPoint处理
- slack-gif-creator - GIF创建
- web-artifacts-builder - Web组件构建
- brainstorming - 头脑风暴
- systematic-debugging - 系统调试
- verification-before-completion - 完成验证

### Web开发 (3个)
- theme-factory - 主题工厂
- finishing-a-development-branch - 分支完成
- using-superpowers - Superpowers指南

### 其他 (2个)
- xhs-note-creator - 小红书创作 (Marketing & Sales)
- test-driven-development - TDD (Coding Agents & IDEs)
- using-git-worktrees - Git工作树 (DevOps & Cloud)

## 技术细节

### 数据结构

每个新skill包含以下字段：

```json
{
  "id": "skill-name",
  "name": "skill-name",
  "author": "local",
  "description": "Skill description",
  "descriptionCn": "技能描述",
  "githubUrl": "https://github.com/...",
  "category": "Original Category",
  "installCommand": "npx clawhub@latest install skill-name",
  "isNew": true  // 新增标记
}
```

### 分类逻辑

"最新"分类使用特殊过滤逻辑：

```javascript
// 显示所有标记为isNew的skills
if (category === 'Latest') {
  skills.filter(skill => skill.isNew === true)
}
```

## 常见问题

### Q: 如何移除某个skill的"新"标记？

A: 编辑 `prototype/data/skills.json`，将对应skill的 `isNew` 字段改为 `false` 或删除该字段。

### Q: 如何更改skill的分类？

A: 编辑 `prototype/data/skills.json`，修改skill的 `category` 字段为目标分类名称。

### Q: 如何自定义分类映射规则？

A: 编辑 `scripts/add-new-skills.js` 中的 `categoryMapping` 对象，添加或修改关键词映射。

### Q: 导入的GitHub URL不正确怎么办？

A: 编辑 `scripts/add-new-skills.js` 中的 `generateGithubUrl` 函数，根据实际仓库结构调整URL生成逻辑。

## 相关文件

- `IMPLEMENTATION.md` - 详细实现说明
- `scripts/add-new-skills.js` - Skills导入脚本
- `test-latest-category.js` - 功能测试脚本
- `prototype/data/skills.json` - Skills数据文件
- `prototype/js/search-filter.js` - 过滤逻辑

## 下一步

1. 访问 http://localhost:8000 查看效果
2. 点击"最新"分类浏览新skills
3. 尝试搜索和过滤功能
4. 添加更多自定义skills

祝使用愉快！🎉
