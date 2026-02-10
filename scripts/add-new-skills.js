const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

// 读取现有的skills.json
const skillsJsonPath = path.join(__dirname, '../prototype/data/skills.json');
const skillsData = JSON.parse(fs.readFileSync(skillsJsonPath, 'utf8'));

// 分类映射规则
const categoryMapping = {
  'mcp': 'AI & LLMs',
  'ai': 'AI & LLMs',
  'llm': 'AI & LLMs',
  'planning': 'Productivity & Tasks',
  'task': 'Productivity & Tasks',
  'productivity': 'Productivity & Tasks',
  'design': 'Web & Frontend Development',
  'frontend': 'Web & Frontend Development',
  'ui': 'Web & Frontend Development',
  'ux': 'Web & Frontend Development',
  'web': 'Web & Frontend Development',
  'canvas': 'Web & Frontend Development',
  'pdf': 'Productivity & Tasks',
  'docx': 'Productivity & Tasks',
  'pptx': 'Productivity & Tasks',
  'xlsx': 'Productivity & Tasks',
  'document': 'Productivity & Tasks',
  'office': 'Productivity & Tasks',
  'git': 'DevOps & Cloud',
  'development': 'Coding Agents & IDEs',
  'coding': 'Coding Agents & IDEs',
  'debug': 'Coding Agents & IDEs',
  'test': 'Coding Agents & IDEs',
  'brainstorm': 'Productivity & Tasks',
  'communication': 'Communication',
  'slack': 'Communication',
  'redbook': 'Marketing & Sales',
  '小红书': 'Marketing & Sales',
  'social': 'Marketing & Sales',
  'brand': 'Marketing & Sales',
  'art': 'Web & Frontend Development',
  'algorithmic': 'Coding Agents & IDEs'
};

// 自动分类函数
function autoCategorize(name, description) {
  const text = `${name} ${description}`.toLowerCase();

  for (const [keyword, category] of Object.entries(categoryMapping)) {
    if (text.includes(keyword)) {
      return category;
    }
  }

  // 默认分类
  return 'Productivity & Tasks';
}

// 解析SKILL.md文件
function parseSkillFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');

  // 提取YAML frontmatter
  const yamlMatch = content.match(/^---\n([\s\S]*?)\n---/);
  if (!yamlMatch) {
    return null;
  }

  try {
    const frontmatter = yaml.load(yamlMatch[1]);
    return {
      name: frontmatter.name,
      description: frontmatter.description || '',
      license: frontmatter.license
    };
  } catch (e) {
    console.error(`Error parsing ${filePath}:`, e.message);
    return null;
  }
}

// 递归查找所有SKILL.md文件
function findSkillFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      findSkillFiles(filePath, fileList);
    } else if (file === 'SKILL.md') {
      fileList.push(filePath);
    }
  });

  return fileList;
}

// 生成GitHub URL
function generateGithubUrl(filePath, skillName) {
  // 从文件路径提取仓库信息
  const parts = filePath.split(path.sep);
  const skillsIndex = parts.indexOf('skills');

  if (skillsIndex === -1) return '';

  const repoFolder = parts[skillsIndex + 1];

  // 根据不同的仓库结构生成URL
  if (repoFolder === 'Auto-Redbook-Skills-main') {
    return 'https://github.com/your-username/Auto-Redbook-Skills';
  } else if (repoFolder === 'planning-with-files-master') {
    return 'https://github.com/your-username/planning-with-files';
  } else if (repoFolder === 'skills-main') {
    return `https://github.com/your-username/skills/tree/main/skills/${skillName}`;
  } else if (repoFolder === 'superpowers-main') {
    return `https://github.com/your-username/superpowers/tree/main/skills/${skillName}`;
  }

  return '';
}

// 主函数
function main() {
  const skillsDir = path.join(__dirname, '../skills');
  const skillFiles = findSkillFiles(skillsDir);

  console.log(`Found ${skillFiles.length} SKILL.md files`);

  const newSkills = [];
  const skillNames = new Set(skillsData.skills.map(s => s.id));

  skillFiles.forEach(filePath => {
    const skillInfo = parseSkillFile(filePath);

    if (!skillInfo || !skillInfo.name) {
      console.log(`Skipping ${filePath} - no valid skill info`);
      return;
    }

    // 跳过已存在的skills
    if (skillNames.has(skillInfo.name)) {
      console.log(`Skipping ${skillInfo.name} - already exists`);
      return;
    }

    const category = autoCategorize(skillInfo.name, skillInfo.description);
    const githubUrl = generateGithubUrl(filePath, skillInfo.name);

    const skill = {
      id: skillInfo.name,
      name: skillInfo.name,
      author: 'local',
      description: skillInfo.description,
      descriptionCn: skillInfo.description, // 可以后续添加翻译
      githubUrl: githubUrl,
      category: category,
      installCommand: `npx clawhub@latest install ${skillInfo.name}`,
      isNew: true // 标记为新skill
    };

    newSkills.push(skill);
    console.log(`Added: ${skillInfo.name} -> ${category}`);
  });

  // 添加新skills到数据中
  skillsData.skills.push(...newSkills);

  // 添加"最新"分类
  const latestCategory = {
    name: 'Latest',
    nameCn: '最新',
    count: newSkills.length,
    icon: 'fa-star'
  };

  // 将"最新"分类插入到第一个位置
  skillsData.categories.unshift(latestCategory);

  // 更新其他分类的计数
  const categoryCounts = {};
  skillsData.skills.forEach(skill => {
    categoryCounts[skill.category] = (categoryCounts[skill.category] || 0) + 1;
  });

  skillsData.categories.forEach(cat => {
    if (cat.name !== 'Latest') {
      cat.count = categoryCounts[cat.name] || 0;
    }
  });

  // 更新元数据
  skillsData.totalSkills = skillsData.skills.length;
  skillsData.lastUpdated = new Date().toISOString().split('T')[0];

  // 保存更新后的数据
  fs.writeFileSync(skillsJsonPath, JSON.stringify(skillsData, null, 2), 'utf8');

  console.log(`\n✅ Successfully added ${newSkills.length} new skills`);
  console.log(`📊 Total skills: ${skillsData.totalSkills}`);
  console.log(`📁 Total categories: ${skillsData.categories.length}`);

  // 提示需要翻译
  if (newSkills.length > 0) {
    console.log(`\n⚠️  提示: 新添加的skills需要翻译中文描述`);
    console.log(`运行以下命令进行翻译:`);
    console.log(`  node scripts/update-translations.js`);
  }
}

main();