const fs = require('fs');
const path = require('path');

// Configuration
const KIMI_API_URL = 'https://api.moonshot.cn/v1/chat/completions';
const KIMI_MODEL = 'kimi-k2.5';
const BATCH_SIZE = 50;
const RETRY_MAX = 3;
const RETRY_DELAY_MS = 2000;
const RATE_LIMIT_DELAY_MS = 1000;

const SKILLS_PATH = path.join(__dirname, '..', 'prototype', 'data', 'skills.json');
const PROGRESS_PATH = path.join(__dirname, '..', 'prototype', 'data', 'translation-progress.json');
const ENV_PATH = path.join(__dirname, '..', '.env');

// --- Utility functions ---

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function loadEnv() {
  const content = fs.readFileSync(ENV_PATH, 'utf-8');
  const match = content.match(/Kimi_API_Key\s*=\s*(.+)/);
  if (!match) {
    throw new Error('Kimi_API_Key not found in .env');
  }
  return match[1].trim();
}

function loadSkillsData() {
  return JSON.parse(fs.readFileSync(SKILLS_PATH, 'utf-8'));
}

function loadProgress() {
  if (fs.existsSync(PROGRESS_PATH)) {
    return JSON.parse(fs.readFileSync(PROGRESS_PATH, 'utf-8'));
  }
  return { translations: {} };
}

function saveProgress(progress) {
  progress.lastUpdated = new Date().toISOString();
  fs.writeFileSync(PROGRESS_PATH, JSON.stringify(progress, null, 2), 'utf-8');
}

function createBatches(items, size) {
  const batches = [];
  for (let i = 0; i < items.length; i += size) {
    batches.push(items.slice(i, i + size));
  }
  return batches;
}

// --- API functions ---

const SYSTEM_PROMPT = `你是一个专业的技术文档翻译专家。你的任务是将英文软件工具描述翻译成简洁、自然的简体中文。

翻译规则：
1. 保留所有专有名词不翻译（如：GitHub, Docker, Kubernetes, OAuth, REST API, Node.js, React, ComfyUI, Discord, Slack, Notion, Claude, Figma, FFmpeg 等）
2. 保留所有技术缩写不翻译（如：API, CLI, SDK, URL, HTML, CSS, SQL, JWT, SSH, MCP, AI, LLM 等）
3. 翻译要简洁自然，符合中文技术文档的表达习惯
4. 不要添加原文没有的信息
5. 如果原文非常短或只包含专有名词，可以保持原样

你将收到一组编号的英文描述，请返回一个JSON数组，每个元素是对应编号描述的中文翻译。
只返回JSON数组，不要返回其他内容。格式：["翻译1", "翻译2", "翻译3"]`;

async function callKimiAPI(messages, apiKey, retryCount = 0) {
  try {
    const response = await fetch(KIMI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: KIMI_MODEL,
        messages: messages,
        thinking: { type: 'disabled' },
        max_tokens: 8192
      })
    });

    if (response.status === 429) {
      const waitTime = RETRY_DELAY_MS * Math.pow(2, retryCount);
      console.log(`  Rate limited. Waiting ${waitTime / 1000}s...`);
      await delay(waitTime);
      if (retryCount < RETRY_MAX) {
        return callKimiAPI(messages, apiKey, retryCount + 1);
      }
      throw new Error('Rate limit exceeded after max retries');
    }

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`API error ${response.status}: ${errorBody}`);
    }

    const data = await response.json();
    let content = data.choices[0].message.content.trim();

    // Strip markdown code block if present
    if (content.startsWith('```')) {
      content = content.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
    }

    return content;
  } catch (err) {
    if (retryCount < RETRY_MAX && !err.message.includes('Rate limit exceeded')) {
      console.log(`  Retry ${retryCount + 1}/${RETRY_MAX}: ${err.message}`);
      await delay(RETRY_DELAY_MS * Math.pow(2, retryCount));
      return callKimiAPI(messages, apiKey, retryCount + 1);
    }
    throw err;
  }
}

async function translateBatch(skillBatch, apiKey) {
  const descList = skillBatch.map((s, i) => `${i + 1}. ${s.description}`).join('\n');

  const messages = [
    { role: 'system', content: SYSTEM_PROMPT },
    { role: 'user', content: `请翻译以下${skillBatch.length}条工具描述：\n\n${descList}` }
  ];

  const responseText = await callKimiAPI(messages, apiKey);
  const translations = JSON.parse(responseText);

  if (!Array.isArray(translations) || translations.length !== skillBatch.length) {
    throw new Error(`Expected ${skillBatch.length} translations, got ${Array.isArray(translations) ? translations.length : 'non-array'}`);
  }

  return translations;
}

// --- Main ---

async function main() {
  console.log('=== Kimi K2.5 Skill Description Translator ===\n');

  const apiKey = loadEnv();
  console.log('Loaded API key from .env');

  const skillsData = loadSkillsData();
  console.log(`Loaded ${skillsData.skills.length} skills from skills.json`);

  const progress = loadProgress();
  const existingCount = Object.keys(progress.translations).length;

  if (existingCount > 0) {
    console.log(`Found previous progress: ${existingCount} already translated`);
  } else {
    console.log('No previous progress found. Starting fresh.');
  }

  // Filter untranslated skills (check progress file AND existing descriptionCn quality)
  const untranslated = skillsData.skills.filter(s => {
    // Already in progress file = good translation
    if (progress.translations[s.id]) return false;
    // Check if existing descriptionCn is a proper Chinese translation
    const cn = s.descriptionCn;
    if (!cn || cn === s.description) return true;
    // Count Chinese characters vs total length
    const chineseChars = (cn.match(/[\u4e00-\u9fff]/g) || []).length;
    // If less than 15% Chinese characters, it's likely a bad keyword-based translation
    return cn.length > 10 && chineseChars / cn.length < 0.15;
  });
  console.log(`Remaining to translate: ${untranslated.length}\n`);

  if (untranslated.length === 0) {
    console.log('All skills already translated. Applying to skills.json...');
  } else {
    const batches = createBatches(untranslated, BATCH_SIZE);

    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i];
      console.log(`Translating batch ${i + 1}/${batches.length} (${batch.length} skills)...`);

      try {
        const translations = await translateBatch(batch, apiKey);
        batch.forEach((skill, idx) => {
          if (translations[idx]) {
            progress.translations[skill.id] = translations[idx];
          }
        });
        saveProgress(progress);
        console.log(`  Done. Total translated: ${Object.keys(progress.translations).length}`);
      } catch (err) {
        console.error(`  Batch failed: ${err.message}`);
        // Fallback: split into smaller batches of 10
        console.log(`  Retrying in smaller batches of 10...`);
        const subBatches = createBatches(batch, 10);
        for (let j = 0; j < subBatches.length; j++) {
          try {
            await delay(RATE_LIMIT_DELAY_MS);
            const subTranslations = await translateBatch(subBatches[j], apiKey);
            subBatches[j].forEach((skill, idx) => {
              if (subTranslations[idx]) {
                progress.translations[skill.id] = subTranslations[idx];
              }
            });
            saveProgress(progress);
            console.log(`    Sub-batch ${j + 1}/${subBatches.length} done.`);
          } catch (subErr) {
            console.error(`    Sub-batch ${j + 1} failed: ${subErr.message}`);
          }
        }
        console.log(`  Total translated: ${Object.keys(progress.translations).length}`);
      }

      // Rate limit delay between batches
      if (i < batches.length - 1) {
        await delay(RATE_LIMIT_DELAY_MS);
      }
    }
  }

  // Apply translations to skills data
  let applied = 0;
  for (const skill of skillsData.skills) {
    if (progress.translations[skill.id]) {
      skill.descriptionCn = progress.translations[skill.id];
      applied++;
    }
  }

  // Update version
  skillsData.version = '3.0';
  skillsData.lastUpdated = new Date().toISOString().split('T')[0];

  // Write final skills.json
  fs.writeFileSync(SKILLS_PATH, JSON.stringify(skillsData, null, 2), 'utf-8');
  console.log(`\nUpdated skills.json with ${applied} Chinese translations.`);

  // Cleanup progress file
  if (fs.existsSync(PROGRESS_PATH)) {
    fs.unlinkSync(PROGRESS_PATH);
    console.log('Progress file cleaned up.');
  }

  console.log('\nDone!');
}

main().catch(err => {
  console.error('Fatal error:', err.message);
  process.exit(1);
});
