const fs = require('fs/promises');
const path = require('path');
const { pool } = require('./pool');

async function init() {
  const schemaPath = path.join(__dirname, 'schema.sql');
  const sql = await fs.readFile(schemaPath, 'utf8');
  const statements = sql
    .split(';')
    .map((statement) => statement.trim())
    .filter(Boolean);

  for (const statement of statements) {
    await pool.query(statement);
  }
  await pool.end();
  process.stdout.write('Schema initialized successfully\n');
}

init().catch(async (error) => {
  process.stderr.write(`Failed to initialize schema: ${error.message}\n`);
  await pool.end();
  process.exit(1);
});
