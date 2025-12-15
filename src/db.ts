import mysql from 'mysql2/promise'

const isCloudRun = process.env.DB_HOST?.startsWith('/cloudsql/')

const needsSSL = !isCloudRun && process.env.DB_HOST &&
  process.env.DB_HOST.match(/^\d+\.\d+\.\d+\.\d+$/)

const pool = mysql.createPool({
  ...(isCloudRun
    ? { socketPath: process.env.DB_HOST }
    : { host: process.env.DB_HOST || 'localhost', port: parseInt(process.env.DB_PORT || '3306') }
  ),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'itineraries_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  ...(needsSSL && { ssl: { rejectUnauthorized: false } }),
})

export default pool
