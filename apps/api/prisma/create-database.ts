import 'dotenv/config';
import { Client } from 'pg';

function parseDatabaseConfig(databaseUrl: string) {
  const url = new URL(databaseUrl);
  const databaseName = url.pathname.replace(/^\//, '');

  if (!databaseName) {
    throw new Error('POSTGRES_DATABASE_URL must include a database name');
  }

  if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(databaseName)) {
    throw new Error(`Invalid database name: ${databaseName}`);
  }

  url.pathname = '/postgres';

  return { maintenanceUrl: url.toString(), databaseName };
}

async function createDatabase() {
  const databaseUrl = process.env.POSTGRES_DATABASE_URL;

  if (!databaseUrl) {
    throw new Error('POSTGRES_DATABASE_URL is not set');
  }

  const { maintenanceUrl, databaseName } = parseDatabaseConfig(databaseUrl);
  const client = new Client({ connectionString: maintenanceUrl });

  try {
    await client.connect();

    const exists = await client.query('SELECT 1 FROM pg_database WHERE datname = $1', [
      databaseName,
    ]);

    if (exists.rowCount && exists.rowCount > 0) {
      console.log(`Database "${databaseName}" already exists.`);
      return;
    }

    await client.query(`CREATE DATABASE "${databaseName}"`);
    console.log(`Database "${databaseName}" created successfully.`);
  } finally {
    await client.end();
  }
}

createDatabase().catch(error => {
  console.error('Failed to create database:', error);
  process.exit(1);
});
