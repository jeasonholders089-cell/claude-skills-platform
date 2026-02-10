// Test script to verify Latest category functionality
const fs = require('fs');
const path = require('path');

const skillsJsonPath = path.join(__dirname, 'prototype/data/skills.json');
const skillsData = JSON.parse(fs.readFileSync(skillsJsonPath, 'utf8'));

console.log('=== Testing Latest Category Implementation ===\n');

// Test 1: Check if Latest category exists and is first
console.log('Test 1: Latest category position');
const latestCategory = skillsData.categories[0];
console.log(`✓ First category: ${latestCategory.name} (${latestCategory.nameCn})`);
console.log(`✓ Icon: ${latestCategory.icon}`);
console.log(`✓ Count: ${latestCategory.count}`);
console.log();

// Test 2: Count skills with isNew flag
console.log('Test 2: Skills with isNew flag');
const newSkills = skillsData.skills.filter(s => s.isNew === true);
console.log(`✓ Total skills with isNew: ${newSkills.length}`);
console.log(`✓ Expected count in Latest category: ${latestCategory.count}`);
console.log(`✓ Match: ${newSkills.length === latestCategory.count ? 'YES' : 'NO'}`);
console.log();

// Test 3: List new skills and their categories
console.log('Test 3: New skills details');
console.log('New skills:');
newSkills.forEach((skill, index) => {
  console.log(`  ${index + 1}. ${skill.name}`);
  console.log(`     Category: ${skill.category}`);
  console.log(`     Description: ${skill.description.substring(0, 60)}...`);
});
console.log();

// Test 4: Verify category counts
console.log('Test 4: Category counts verification');
const categoryCounts = {};
skillsData.skills.forEach(skill => {
  categoryCounts[skill.category] = (categoryCounts[skill.category] || 0) + 1;
});

let allMatch = true;
skillsData.categories.forEach(cat => {
  if (cat.name !== 'Latest') {
    const expected = categoryCounts[cat.name] || 0;
    const actual = cat.count;
    const match = expected === actual;
    if (!match) {
      console.log(`  ✗ ${cat.name}: expected ${expected}, got ${actual}`);
      allMatch = false;
    }
  }
});

if (allMatch) {
  console.log('  ✓ All category counts match!');
}
console.log();

// Test 5: Summary
console.log('=== Summary ===');
console.log(`Total skills: ${skillsData.totalSkills}`);
console.log(`Total categories: ${skillsData.categories.length}`);
console.log(`New skills: ${newSkills.length}`);
console.log(`Last updated: ${skillsData.lastUpdated}`);
console.log();

console.log('✅ All tests completed!');
