require('dotenv').config(); // Carrega o .env
const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASS,
  port: process.env.DB_PORT,
});

const query = async (text, params) => {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('✅ Query executada', { duration, rows: res.rowCount });
    return res;
  } catch (error) {
    console.error('❌ Erro na Query:', error);
    throw error;
  }
};

module.exports = { query };