import { config } from 'dotenv';
import { resolve } from 'path';
import { Client } from 'pg';
import { readFileSync } from 'fs';
import { join } from 'path';

// Load environment variables from .env.local
config({ path: resolve(process.cwd(), '.env.local') });

async function runMigration() {
  // Get database connection string from environment
  // Format: postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres
  // Or use individual components:
  const dbUrl = process.env.DATABASE_URL || 
    `postgresql://${process.env.DB_USER || 'postgres'}:${process.env.DB_PASSWORD}@${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || '5432'}/${process.env.DB_NAME || 'postgres'}`;

  if (!process.env.DB_PASSWORD && !process.env.DATABASE_URL) {
    console.error('❌ Error: Database connection required!');
    console.log('\nPlease set one of the following:');
    console.log('  - DATABASE_URL (full connection string)');
    console.log('  - DB_PASSWORD (with DB_HOST, DB_USER, DB_NAME)');
    console.log('\nYou can find your connection string in Supabase Dashboard:');
    console.log('  Settings → Database → Connection string → URI');
    console.log('\nExample:');
    console.log('  export DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"');
    process.exit(1);
  }

  const client = new Client({
    connectionString: dbUrl,
    ssl: process.env.DB_HOST?.includes('supabase.co') ? { rejectUnauthorized: false } : false,
  });

  try {
    console.log('🔌 Connecting to database...');
    await client.connect();
    console.log('✅ Connected!\n');

    // Read migration file - use command line argument or default to phase2
    const migrationFile = process.argv[2] || 'phase2-schema.sql';
    const migrationPath = join(process.cwd(), 'migrations', migrationFile);
    console.log(`📄 Reading migration file: ${migrationPath}`);
    const sql = readFileSync(migrationPath, 'utf-8');
    
    console.log('🚀 Running migration...\n');
    await client.query(sql);
    
    console.log('✅ Migration completed successfully!');
    console.log('\nAll tables, indexes, and policies have been created.');
  } catch (error) {
    console.error('❌ Migration failed:');
    console.error(error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

runMigration();

