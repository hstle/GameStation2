const fs = require('fs');
const content = fs.readFileSync('src/data/games.ts', 'utf8');
const idRegex = /id\s*:\s*['"]?([^'",\s}]+)['"]?/g;
const ids = [];
let match;
while ((match = idRegex.exec(content)) !== null) {
  ids.push(match[1]);
}

const idCounts = {};
const idDuplicates = [];

ids.forEach(id => {
  idCounts[id] = (idCounts[id] || 0) + 1;
  if (idCounts[id] === 2) idDuplicates.push(id);
});

console.log('Total IDs:', ids.length);
console.log('Unique IDs:', Object.keys(idCounts).length);
console.log('ID Duplicates:', idDuplicates);
