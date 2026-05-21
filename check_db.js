const fs = require('fs');
const path = require('path');

const sqlPath = path.join(__dirname, 'supabase', 'migracion_completa.sql');
const content = fs.readFileSync(sqlPath, 'utf8');

function findTable(tableName) {
  const regex = new RegExp(`CREATE TABLE ${tableName}[\\s\\S]*?\\);`, 'i');
  const match = content.match(regex);
  if (match) {
    console.log(`--- TABLE: ${tableName} ---`);
    console.log(match[0]);
  } else {
    console.log(`Table ${tableName} not found`);
  }
}

findTable('competiciones');
findTable('partidos');
findTable('tabla_posiciones');
