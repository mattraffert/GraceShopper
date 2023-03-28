const { Pool } = require('pg');
require("dotenv").config()
const connectionString = process.env.DATABASE_URL || 'postgres://postgres:password@localhost:6543/fitnessdev';

const client = new Pool({
  connectionString,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined,
});

module.exports = client;
