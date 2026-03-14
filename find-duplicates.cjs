const fs = require('fs');
const content = fs.readFileSync('src/data/games.ts', 'utf8');

const ids = [];
const idRegex = /id:\s*['"]([^'"]*)['"]/g;
let match;
while ((match = idRegex.exec(content)) !== null) {
  ids.push(match[1]);
}

console.log('Total IDs found:', ids.length);
const counts = {};
ids.forEach(id => {
  counts[id] = (counts[id] || 0) + 1;
});

const duplicates = Object.keys(counts).filter(id => counts[id] > 1);
if (duplicates.length > 0) {
  console.log('Duplicates found:');
  duplicates.forEach(id => {
    console.log(`${id}: ${counts[id]}`);
  });
} else {
  console.log('No duplicates found.');
}
