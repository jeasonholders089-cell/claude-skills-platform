#!/bin/bash

# 演示脚本 - "最新"分类功能

echo "=================================="
echo "  Claude Skills Platform"
echo "  '最新'分类功能演示"
echo "=================================="
echo ""

# 1. 显示当前状态
echo "📊 当前状态："
echo "-----------------------------------"
node -e "
const data = require('./prototype/data/skills.json');
console.log('总Skills数:', data.totalSkills);
console.log('总分类数:', data.categories.length);
console.log('最新分类:', data.categories[0].nameCn, '(' + data.categories[0].count + '个)');
console.log('更新日期:', data.lastUpdated);
"
echo ""

# 2. 列出新Skills
echo "🌟 新增Skills列表："
echo "-----------------------------------"
node -e "
const data = require('./prototype/data/skills.json');
const newSkills = data.skills.filter(s => s.isNew);
newSkills.forEach((skill, i) => {
  console.log((i+1) + '.', skill.name);
  console.log('   分类:', skill.category);
  console.log('   描述:', skill.description.substring(0, 50) + '...');
  console.log('');
});
"

# 3. 分类统计
echo "📈 分类统计："
echo "-----------------------------------"
node -e "
const data = require('./prototype/data/skills.json');
const newSkills = data.skills.filter(s => s.isNew);
const categoryCount = {};
newSkills.forEach(s => {
  categoryCount[s.category] = (categoryCount[s.category] || 0) + 1;
});
Object.entries(categoryCount).sort((a, b) => b[1] - a[1]).forEach(([cat, count]) => {
  console.log(cat + ':', count + '个');
});
"
echo ""

# 4. 运行测试
echo "✅ 运行测试："
echo "-----------------------------------"
node test-latest-category.js
echo ""

# 5. 启动服务器提示
echo "🚀 启动服务器："
echo "-----------------------------------"
echo "运行以下命令启动本地服务器："
echo ""
echo "  cd prototype"
echo "  python -m http.server 8000"
echo ""
echo "然后访问: http://localhost:8000"
echo "点击左侧 '⭐ 最新' 分类查看新Skills"
echo ""

echo "=================================="
echo "  演示完成！"
echo "=================================="
