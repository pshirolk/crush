
import { useEffect, useState } from 'react'
import './ReportsScreen.css'

const API_URL = 'http://localhost:5001/api/reports'

function ReportsScreen({ onBack }) {
  const [period, setPeriod] = useState('today')
  const [summary, setSummary] = useState(null)
  const [breakdown, setBreakdown] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const controller = new AbortController()

    const fetchReports = async () => {
      setLoading(true)
      setError('')
      setSummary(null)
      setBreakdown([])

      try {
        const response = await fetch(
          `${API_URL}/summary?period=${period}`,
          { signal: controller.signal }
        )

        if (!response.ok) {
          throw new Error('Unable to load reports.')
        }

        const data = await response.json()

        if (!controller.signal.aborted) {
          setSummary(data.summary)
          setBreakdown(data.breakdown)
        }
      } catch (err) {
        if (!controller.signal.aborted) {
          setError(err.message)
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false)
        }
      }
    }

    fetchReports()

    return () => controller.abort()
  }, [period])

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(Number(value || 0))
  }

  const formatDate = (date) => {
    const [year, month, day] = date.split('-').map(Number)

    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(new Date(year, month - 1, day))
  }

  return (
    <div className="reports-screen">
      <button className="back-button" onClick={onBack}>
        ← Home
      </button>

      <div className="reports-header">
        <div>
          <h1>Sales Reports</h1>
          <p>View sales and transaction summaries.</p>
        </div>

        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
        >
          <option value="today">Today</option>
          <option value="week">This Week</option>
          <option value="month">This Month</option>
        </select>
      </div>

      {error && (
        <p className="reports-error" role="alert">
          {error}
        </p>
      )}

      <div className="reports-summary">
        <div className="report-card">
          <span>Total Sales</span>
          <h2>
            {loading || !summary
              ? '--'
              : formatCurrency(summary.total_sales)}
          </h2>
        </div>

        <div className="report-card">
          <span>Total Orders</span>
          <h2>
            {loading || !summary
              ? '--'
              : summary.total_orders}
          </h2>
        </div>

        <div className="report-card">
          <span>Average Order</span>
          <h2>
            {loading || !summary
              ? '--'
              : formatCurrency(summary.average_order)}
          </h2>
        </div>

        <div className="report-card">
          <span>Total Tips</span>
          <h2>
            {loading || !summary
              ? '--'
              : formatCurrency(summary.total_tips)}
          </h2>
        </div>
      </div>

      <div className="reports-table-section">
        <h2>Sales Breakdown</h2>

        <table className="reports-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Orders</th>
              <th>Sales</th>
              <th>Tips</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan="4" className="reports-empty">
                  Loading sales data...
                </td>
              </tr>
            ) : breakdown.length === 0 ? (
              <tr>
                <td colSpan="4" className="reports-empty">
                  No completed sales for this period.
                </td>
              </tr>
            ) : (
              breakdown.map((day) => (
                <tr key={day.date}>
                  <td>{formatDate(day.date)}</td>
                  <td>{day.orders}</td>
                  <td>{formatCurrency(day.sales)}</td>
                  <td>{formatCurrency(day.tips)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default ReportsScreen
