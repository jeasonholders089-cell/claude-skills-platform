const fs = require('fs');
const path = require('path');
const translate = require('translate-google');

// 读取skills.json
const skillsJsonPath = path.join(__dirname, '../prototype/data/skills.json');
const skillsData = JSON.parse(fs.readFileSync(skillsJsonPath, 'utf8'));

// 延迟函数，避免API限流
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// 翻译函数
async function translateText(text) {
  try {
    const result = await translate(text, { from: 'en', to: 'zh-CN' });
    return result;
  } catch (error) {
    console.error('Translation error:', error.message);
    return text; // 翻译失败时返回原文
  }
}

// 主函数
async function main() {
  console.log('开始翻译新skills的描述...\n');

  // 找到所有标记为新的skills
  const newSkills = skillsData.skills.filter(s => s.isNew === true);
  console.log(`找到 ${newSkills.length} 个新skills需要翻译`);

  let translatedCount = 0;

  for (let i = 0; i < newSkills.length; i++) {
    const skill = newSkills[i];

    // 如果descriptionCn和description相同，说明需要翻译
    if (skill.descriptionCn === skill.description) {
      console.log(`\n[${i + 1}/${newSkills.length}] 翻译: ${skill.name}`);
      console.log(`原文: ${skill.description.substring(0, 60)}...`);

      // 翻译
      const translated = await translateText(skill.description);
      skill.descriptionCn = translated;

      console.log(`译文: ${translated.substring(0, 60)}...`);
      translatedCount++;

      // 延迟，避免API限流
      await delay(1000);
    } else {
      console.log(`[${i + 1}/${newSkills.length}] 跳过: ${skill.name} (已有中文翻译)`);
    }
  }

  // 保存更新后的数据
  if (translatedCount > 0) {
    fs.writeFileSync(skillsJsonPath, JSON.stringify(skillsData, null, 2), 'utf8');
    console.log(`\n✅ 成功翻译 ${translatedCount} 个skills的描述`);
    console.log(`📁 已保存到: ${skillsJsonPath}`);
  } else {
    console.log('\n✅ 所有新skills已有中文翻译，无需更新');
  }
}

main().catch(error => {
  console.error('错误:', error);
  process.exit(1);
});
