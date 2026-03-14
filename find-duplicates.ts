import { GAMES } from './src/data/games';

console.log(`Total games: ${GAMES.length}`);

const ids = GAMES.map((g, index) => {
  if (!g.id) {
    console.log(`Game at index ${index} has no ID! Title: ${g.title}`);
    return `MISSING-${index}`;
  }
  return g.id;
});

const idCounts: { [key: string]: number } = {};
ids.forEach(id => {
  idCounts[id] = (idCounts[id] || 0) + 1;
});

const duplicates = Object.entries(idCounts).filter(([id, count]) => count > 1);

if (duplicates.length > 0) {
  console.log('Duplicate IDs found:');
  duplicates.forEach(([id, count]) => {
    console.log(`${id}: ${count} occurrences`);
    const indices = ids.map((val, idx) => val === id ? idx : -1).filter(idx => idx !== -1);
    indices.forEach(idx => {
      console.log(`  - Index ${idx}: ${GAMES[idx].title}`);
    });
  });
} else {
  console.log('No duplicate IDs found.');
  // Print first 5 IDs to verify they are being read correctly
  console.log('First 5 IDs:', ids.slice(0, 5));
}
