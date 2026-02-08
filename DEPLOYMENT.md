# Vercel 部署指南

## 快速部署

### 方式一：通过 Vercel Dashboard（推荐）

1. 访问 [vercel.com](https://vercel.com) 并登录
2. 点击 "Add New Project"
3. 导入 GitHub 仓库：`jeasonholders089-cell/claude-skills-platform`
4. Vercel 会自动检测 `vercel.json` 配置
5. 点击 "Deploy" 开始部署

### 方式二：通过 Vercel CLI

```bash
# 安装 Vercel CLI（如果还没安装）
npm install -g vercel

# 登录 Vercel
vercel login

# 部署项目
vercel

# 部署到生产环境
vercel --prod
```

## 项目配置

项目已配置 `vercel.json`，包含以下设置：

- **输出目录**: `prototype/` - 所有静态文件所在目录
- **无需构建**: 纯静态网站，无需构建步骤
- **Clean URLs**: 启用干净的 URL（无 .html 后缀）

## 部署后访问

部署成功后，您将获得：
- 预览 URL: `https://your-project-xxx.vercel.app`
- 生产 URL: `https://your-project.vercel.app`

## 自定义域名

1. 在 Vercel Dashboard 中打开项目
2. 进入 "Settings" > "Domains"
3. 添加您的自定义域名
4. 按照提示配置 DNS 记录

## 环境变量

当前静态网站不需要环境变量。如果未来需要添加 Serverless Functions，可以在 Vercel Dashboard 的 "Settings" > "Environment Variables" 中配置。

## 注意事项

1. **数据文件**: 网站从 `data/skills.json` 加载数据，已包含在部署中
2. **CDN 资源**: Tailwind CSS 和 Font Awesome 通过 CDN 加载，无需额外配置
3. **浏览器兼容性**: 使用 ES6 模块，需要现代浏览器支持

## 更新部署

每次推送到 GitHub 主分支，Vercel 会自动重新部署：

```bash
git add .
git commit -m "Update content"
git push
```

## 故障排查

如果部署失败：

1. 检查 Vercel 部署日志
2. 确认 `prototype/` 目录包含所有必要文件
3. 验证 `data/skills.json` 文件格式正确
4. 检查浏览器控制台是否有 JavaScript 错误

## 性能优化建议

- ✅ 使用 CDN 加载外部资源
- ✅ 启用浏览器缓存
- 🔄 考虑添加图片优化（如需要）
- 🔄 考虑添加 Service Worker（PWA）
