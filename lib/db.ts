import mysql from "mysql2/promise"

const connection = mysql.createPool({
  host: process.env.DATABASE_HOST || "localhost",
  user: process.env.DATABASE_USER || "root",
  password: process.env.DATABASE_PASSWORD || "",
  database: process.env.DATABASE_NAME || "rss_reader",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
})

export default connection
