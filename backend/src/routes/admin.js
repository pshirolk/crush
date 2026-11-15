
import express from 'express'
import bcrypt from 'bcrypt'
import pool from '../config/db.js'

const router = express.Router()

// Admin login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body

    if (
      typeof username !== 'string' ||
      typeof password !== 'string' ||
      !username.trim() ||
      !password
    ) {
      return res.status(400).json({
        error: 'Username and password are required.'
      })
    }

    const result = await pool.query(
      `
      SELECT id, username, password_hash
      FROM admins
      WHERE username = $1
      `,
      [username.trim()]
    )

    const admin = result.rows[0]

    if (!admin) {
      return res.status(401).json({
        error: 'Invalid username or password.'
      })
    }

    const validPassword = await bcrypt.compare(
      password,
      admin.password_hash
    )

    if (!validPassword) {
      return res.status(401).json({
        error: 'Invalid username or password.'
      })
    }

    req.session.regenerate((error) => {
      if (error) {
        console.error('Admin session error:', error)
        return res.status(500).json({
          error: 'Unable to log in.'
        })
      }

      req.session.adminId = admin.id

      req.session.save((saveError) => {
        if (saveError) {
          return res.status(500).json({
            error: 'Unable to save login session.'
          })
        }

        res.json({
          message: 'Admin login successful.',
          admin: {
            id: admin.id,
            username: admin.username
          }
        })
      })
    })
  } catch (error) {
    console.error('Admin login error:', error)

    res.status(500).json({
      error: 'Unable to log in.'
    })
  }
})

// Check current admin session
router.get('/me', async (req, res) => {
  if (!req.session.adminId) {
    return res.status(401).json({
      error: 'Admin login required.'
    })
  }

  try {
    const result = await pool.query(
      `
      SELECT id, username
      FROM admins
      WHERE id = $1
      `,
      [req.session.adminId]
    )

    if (result.rows.length === 0) {
      return res.status(401).json({
        error: 'Admin account not found.'
      })
    }

    res.json({
      admin: result.rows[0]
    })
  } catch (error) {
    console.error('Admin session error:', error)

    res.status(500).json({
      error: 'Unable to retrieve admin.'
    })
  }
})

// Admin logout
router.post('/logout', (req, res) => {
  if (!req.session.adminId) {
    return res.status(401).json({
      error: 'Admin login required.'
    })
  }

  req.session.destroy((error) => {
    if (error) {
      return res.status(500).json({
        error: 'Unable to log out.'
      })
    }

    res.clearCookie('crush.employee.sid')

    res.json({
      message: 'Admin logged out successfully.'
    })
  })
})


 // Get all employee shifts (admin only)
 router.get('/shifts', async (req, res) => {
  try {
    // Only authenticated admins can access shift history
    if (!req.session.adminId) {
      return res.status(401).json({
        error: 'Administrator login required.'
      })
    }

    // Verify the admin account still exists
    const adminResult = await pool.query(
      'SELECT id FROM admins WHERE id = $1',
      [req.session.adminId]
    )

    if (adminResult.rows.length === 0) {
      return res.status(403).json({
        error: 'Administrator access denied.'
      })
    }

    const result = await pool.query(
      `
      SELECT
        s.id,
        s.employee_id,
        e.employee_number,
        e.first_name,
        e.last_name,
        s.clock_in,
        s.break_start,
        s.break_end,
        s.clock_out,
        ROUND(
          (
            EXTRACT(EPOCH FROM (
              COALESCE(s.clock_out, NOW()) - s.clock_in
            ))
            -
            CASE
              WHEN s.break_start IS NOT NULL THEN
                EXTRACT(EPOCH FROM (
                  COALESCE(s.break_end, NOW()) - s.break_start
                ))
              ELSE 0
            END
          ) / 3600,
          2
        ) AS hours_worked
      FROM employee_shifts s
      JOIN employees e ON e.id = s.employee_id
      ORDER BY s.clock_in DESC
      `,
    )

    res.json({
      shifts: result.rows
    })

  } catch (error) {
    console.error('Admin shift history error:', error)

    res.status(500).json({
      error: 'Unable to retrieve employee shifts.'
    })
  }
})

export default router