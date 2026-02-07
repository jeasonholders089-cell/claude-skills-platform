const fs = require('fs');
const path = require('path');

// File paths
const README_PATH = path.join(__dirname, '..', 'awesome-openclaw-skills-main', 'awesome-openclaw-skills-main', 'README.md');
const OUTPUT_PATH = path.join(__dirname, '..', 'prototype', 'data', 'skills.json');

// Manual Chinese translations for categories
const categoryTranslations = {
  'Web & Frontend Development': 'Web与前端开发',
  'Coding Agents & IDEs': '编程代理与IDE',
  'Git & GitHub': 'Git与GitHub',
  'Moltbook': 'Moltbook笔记本',
  'DevOps & Cloud': 'DevOps与云服务',
  'Browser & Automation': '浏览器与自动化',
  'Image & Video Generation': '图像与视频生成',
  'Apple Apps & Services': 'Apple应用与服务',
  'Search & Research': '搜索与研究',
  'Clawdbot Tools': 'Clawdbot工具',
  'CLI Utilities': '命令行工具',
  'Marketing & Sales': '营销与销售',
  'Productivity & Tasks': '生产力与任务管理',
  'AI & LLMs': 'AI与大语言模型',
  'Data & Analytics': '数据与分析',
  'Finance': '金融',
  'Media & Streaming': '媒体与流媒体',
  'Notes & PKM': '笔记与个人知识管理',
  'iOS & macOS Development': 'iOS与macOS开发',
  'Transportation': '交通出行',
  'Personal Development': '个人发展',
  'Health & Fitness': '健康与健身',
  'Communication': '通讯',
  'Speech & Transcription': '语音与转录',
  'Smart Home & IoT': '智能家居与物联网',
  'Shopping & E-commerce': '购物与电商',
  'Calendar & Scheduling': '日历与日程安排',
  'PDF & Documents': 'PDF与文档',
  'Self-Hosted & Automation': '自托管与自动化',
  'Security & Passwords': '安全与密码',
  'Gaming': '游戏'
};

// Note: Chinese translations are now handled by translate-skills.js using Kimi K2.5 API

// Read files
console.log('Reading README.md...');
const readmeContent = fs.readFileSync(README_PATH, 'utf-8');

// Parse skills from README (synchronous first pass)
const skills = [];
const categoriesSet = new Set();
let currentCategory = null;

// Split by lines
const lines = readmeContent.split('\n');

console.log('\nParsing skills from README...');
for (let i = 0; i < lines.length; i++) {
  const line = lines[i].trim();

  // Check for category header (format: <summary><h3 style="display:inline">Category Name</h3></summary>)
  const categoryMatch = line.match(/<summary><h3[^>]*>(.*?)<\/h3><\/summary>/);
  if (categoryMatch) {
    currentCategory = categoryMatch[1].trim();
    categoriesSet.add(currentCategory);
    console.log(`Found category: ${currentCategory}`);
    continue;
  }

  // Check for skill entry (format: - [skill-name](github-url) - Description.)
  const skillMatch = line.match(/^-\s+\[(.*?)\]\((.*?)\)\s+-\s+(.*)$/);
  if (skillMatch && currentCategory) {
    const skillName = skillMatch[1].trim();
    const githubUrl = skillMatch[2].trim();
    const description = skillMatch[3].trim();

    // Extract author from GitHub URL
    // URL format: https://github.com/openclaw/skills/tree/main/skills/{author}/{skill-name}/SKILL.md
    let author = 'unknown';
    const urlMatch = githubUrl.match(/\/skills\/(.*?)\/(.*?)\//);
    if (urlMatch) {
      author = urlMatch[1];
    }

    // Create skill object (without translation yet)
    const skill = {
      id: skillName,
      name: skillName,
      author: author,
      description: description,
      descriptionCn: '', // Will be filled by translation
      githubUrl: githubUrl,
      category: currentCategory,
      installCommand: `npx clawhub@latest install ${skillName}`
    };

    skills.push(skill);
  }
}

console.log(`\nParsed ${skills.length} skills from ${categoriesSet.size} categories`);

// Process data and generate output
console.log('\n=== Processing data ===\n');

// Create categories array with translations
console.log('Creating categories array...');
const categories = [];
const categoryArray = Array.from(categoriesSet);

for (const categoryName of categoryArray) {
  const nameCn = categoryTranslations[categoryName] || categoryName;
  const count = skills.filter(s => s.category === categoryName).length;

  categories.push({
    name: categoryName,
    nameCn: nameCn,
    count: count,
    icon: getCategoryIcon(categoryName)
  });

  console.log(`  ${categoryName} (${nameCn}): ${count} skills`);
}

// Note: Chinese descriptions are handled by translate-skills.js (Kimi K2.5 API)

// Generate output JSON
const output = {
  version: '2.0',
  lastUpdated: new Date().toISOString().split('T')[0],
  totalSkills: skills.length,
  categories: categories.sort((a, b) => b.count - a.count),
  skills: skills
};

// Write to file
console.log(`\nWriting to ${OUTPUT_PATH}...`);
fs.writeFileSync(OUTPUT_PATH, JSON.stringify(output, null, 2), 'utf-8');

console.log('\n✓ Successfully generated skills.json');
console.log(`  Version: 2.0`);
console.log(`  Total skills: ${skills.length}`);
console.log(`  Total categories: ${categories.length}`);
console.log(`  File size: ${(fs.statSync(OUTPUT_PATH).size / 1024).toFixed(2)} KB`);

// Print category distribution
console.log('\nTop 10 categories by skill count:');
categories.slice(0, 10).forEach(cat => {
  console.log(`  ${cat.name} (${cat.nameCn}): ${cat.count} skills`);
});

// Helper function to assign Font Awesome icons to categories
function getCategoryIcon(categoryName) {
  const iconMap = {
    'Web & Frontend Development': 'fa-globe',
    'Coding Agents & IDEs': 'fa-code',
    'Git & GitHub': 'fa-code-branch',
    'Moltbook': 'fa-book',
    'DevOps & Cloud': 'fa-cloud',
    'Browser & Automation': 'fa-robot',
    'Image & Video Generation': 'fa-image',
    'Apple Apps & Services': 'fa-apple',
    'Search & Research': 'fa-search',
    'Clawdbot Tools': 'fa-tools',
    'CLI Utilities': 'fa-terminal',
    'Marketing & Sales': 'fa-chart-line',
    'Productivity & Tasks': 'fa-tasks',
    'AI & LLMs': 'fa-brain',
    'Data & Analytics': 'fa-chart-bar',
    'Finance': 'fa-dollar-sign',
    'Media & Streaming': 'fa-film',
    'Notes & PKM': 'fa-sticky-note',
    'iOS & macOS Development': 'fa-mobile-alt',
    'Transportation': 'fa-car',
    'Personal Development': 'fa-user-graduate',
    'Health & Fitness': 'fa-heartbeat',
    'Communication': 'fa-comments',
    'Speech & Transcription': 'fa-microphone',
    'Smart Home & IoT': 'fa-home',
    'Shopping & E-commerce': 'fa-shopping-cart',
    'Calendar & Scheduling': 'fa-calendar-alt',
    'PDF & Documents': 'fa-file-pdf',
    'Self-Hosted & Automation': 'fa-sync',
    'Security & Passwords': 'fa-lock',
    'Gaming': 'fa-gamepad'
  };

  return iconMap[categoryName] || 'fa-cube';
}
