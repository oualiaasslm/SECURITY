const mysql = require('mysql2/promise');

const db = mysql.createPool({
  host: 'localhost',
  user: 'ouali',
  password: '2004',
  database: 'donnescours'
 
});

module.exports = db;
