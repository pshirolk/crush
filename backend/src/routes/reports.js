
import express from 'express'
import pool from '../config/db.js'

const router = express.Router()

router.get('/summary', async (req, res) => {
  try {
    const period = req.query.period || 'today'

    if (!['today', 'week', 'month'].includes(period)) {
      return res.status(400).json({
        error: 'Invalid reporting period.'
      })
    }

    const result = await pool.query(
      `
      WITH report_window AS (
        SELECT
          CASE
            WHEN $1 = 'today' THEN
              DATE_TRUNC('day', NOW() AT TIME ZONE 'America/New_York')
            WHEN $1 = 'week' THEN
              DATE_TRUNC('week', NOW() AT TIME ZONE 'America/New_York')
            ELSE
              DATE_TRUNC('month', NOW() AT TIME ZONE 'America/New_York')
          END AS start_time,
          NOW() AT TIME ZONE 'America/New_York' AS end_time
      ),
      paid_orders AS (
        SELECT
          o.*,
          (o.created_at AT TIME ZONE 'America/New_York')::date AS sale_date
        FROM orders o
        CROSS JOIN report_window w
        WHERE o.payment_status = 'paid'
          AND o.status = 'completed'
          AND o.created_at >= (w.start_time AT TIME ZONE 'America/New_York')
          AND o.created_at <= (w.end_time AT TIME ZONE 'America/New_York')
      )
      SELECT
        COUNT(*)::integer AS total_orders,
        COALESCE(SUM(total), 0) AS total_collected,
        COALESCE(SUM(total - tip - tax), 0) AS total_sales,
        COALESCE(SUM(tip), 0) AS total_tips,
        COALESCE(AVG(total), 0) AS average_order
      FROM paid_orders
      `,
      [period]
    )

    const breakdown = await pool.query(
      `
      WITH report_window AS (
        SELECT
          CASE
            WHEN $1 = 'today' THEN
              DATE_TRUNC('day', NOW() AT TIME ZONE 'America/New_York')
            WHEN $1 = 'week' THEN
              DATE_TRUNC('week', NOW() AT TIME ZONE 'America/New_York')
            ELSE
              DATE_TRUNC('month', NOW() AT TIME ZONE 'America/New_York')
          END AS start_time,
          NOW() AT TIME ZONE 'America/New_York' AS end_time
      )
      SELECT
        TO_CHAR(
          o.created_at AT TIME ZONE 'America/New_York',
          'YYYY-MM-DD'
        ) AS date,
        COUNT(*)::integer AS orders,
        COALESCE(SUM(o.total - o.tip - o.tax), 0) AS sales,
        COALESCE(SUM(o.tip), 0) AS tips
      FROM orders o
      CROSS JOIN report_window w
      WHERE o.payment_status = 'paid'
        AND o.status = 'completed'
        AND o.created_at >= (w.start_time AT TIME ZONE 'America/New_York')
        AND o.created_at <= (w.end_time AT TIME ZONE 'America/New_York')
      GROUP BY 1
      ORDER BY 1 DESC
      `,
      [period]
    )

    res.json({
      period,
      summary: result.rows[0],
      breakdown: breakdown.rows
    })
  } catch (error) {
    console.error('Reports error:', error)

    res.status(500).json({
      error: 'Unable to generate sales report.'
    })
  }
})

export default router