import pg from 'pg'
import 'dotenv/config'

const { Pool } = pg

const pool = new Pool({
    connectionString: process.env.DATABASE_URL
})

pool.on('connect', (client) => {
    client.query("SET TIME ZONE 'America/New_York'").catch((error) => {
      console.error('Failed to set database timezone:', error)
    })
  })

export default pool