const { Pool } = require('pg');
const dotenv   = require('dotenv');

dotenv.config();

// ── PostgreSQL Connection Pool ──
const pool = new Pool({
  host:     process.env.DB_HOST     || 'localhost',
  port:     parseInt(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME     || 'medihub',
  user:     process.env.DB_USER     || 'postgres',
  password: process.env.DB_PASSWORD,
  max:              10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// ── Test connection on startup ──
const testConnection = async () => {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW() as time, current_database() as db');
    console.log('✅ PostgreSQL connected');
    console.log(`   Database : ${result.rows[0].db}`);
    console.log(`   Time     : ${result.rows[0].time}`);
    client.release();
  } catch (err) {
    console.error('❌ PostgreSQL connection failed');
    console.error(`   Error: ${err.message}`);
    console.error('');
    console.error('   Check your .env file:');
    console.error('   DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD');
    process.exit(1);
  }
};

// ── Run a query ──
const query = async (text, params) => {
  const start = Date.now();
  try {
    const result = await pool.query(text, params);
    const duration = Date.now() - start;
    if (process.env.NODE_ENV === 'development') {
      console.log(`  SQL [${duration}ms]: ${text.substring(0, 80)}`);
    }
    return result;
  } catch (err) {
    console.error('SQL Error:', err.message);
    throw err;
  }
};

// ── Get a client for transactions ──
const getClient = () => pool.connect();

module.exports = { pool, query, getClient, testConnection };
