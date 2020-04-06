const { Pool } = require('pg')

module.exports = new Pool({
  user: 'postgres',
  password: 'sua senhaqui',
  host: 'localhost',
  port: 5432,
  database: 'launchstoredb'
})