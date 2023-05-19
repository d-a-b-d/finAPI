require('dotenv').config();

const Pool = require('pg').Pool;

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

(async () => {
    try {
      const client = await pool.connect();
  
      const result = await client.query('SELECT NOW()');

      console.log('Connected to the database:', result.rows[0].now);
  
      client.release();
    } catch (error) {
      console.error('Failed to connect to the database:', error);
    } finally {
      pool.end();
    }
  })();

  module.exports = pool;