import { readFileSync } from 'node:fs';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);
const migration = readFileSync(new URL('./migration.sql', import.meta.url), 'utf8');

for (const stmt of migration
  .split(/;\s*(?:\n|$)/)
  .map((s) => s.trim())
  .filter((s) => s.length > 0)) {
  process.stdout.write(`> ${stmt.split('\n')[0].slice(0, 80)}...\n`);
  await sql.query(stmt);
}
console.log('Migration complete.');
