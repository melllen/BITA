import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import pool from '../config/db.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const schema = readFileSync(join(__dirname, 'schema.sql'), 'utf8');

export async function migrate() {
  const client = await pool.connect();
  try {
    await client.query(schema);
    console.log('Migration complete.');
  } finally {
    client.release();
  }
}

// Allow running standalone: node migrate.js
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  migrate()
    .then(() => pool.end())
    .catch(err => {
      console.error('Migration failed:', err);
      process.exit(1);
    });
}
