
import { useEffect, useState } from 'react'
import './AdminShiftHistory.css'

const API_URL = 'http://localhost:5001/api/admin'
const TIME_ZONE = 'America/New_York'

function AdminShiftHistory() {
    const [shifts, setShifts] = useState([])
    const [employeeFilter, setEmployeeFilter] = useState('all')
    const [dateFilter, setDateFilter] = useState('')
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        let cancelled = false

        const fetchShifts = async () => {
            try {
                const response = await fetch(`${API_URL}/shifts`, {
                    credentials: 'include'
                })

                const data = await response.json()

                if (!response.ok) {
                    throw new Error(data.error || 'Unable to load shifts.')
                }

                if (!cancelled) {
                    setShifts(data.shifts)
                }
            } catch (err) {
                if (!cancelled) {
                    setError(err.message)
                }
            } finally {
                if (!cancelled) {
                    setLoading(false)
                }
            }
        }

        fetchShifts()

        return () => {
            cancelled = true
        }
    }, [])

    const formatTime = (timestamp) => {
        if (!timestamp) return '—'

        return new Intl.DateTimeFormat('en-US', {
            timeZone: TIME_ZONE,
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        }).format(new Date(timestamp))
    }

    const formatDate = (timestamp) => {
        if (!timestamp) return '—'

        const parts = new Intl.DateTimeFormat('en-US', {
            timeZone: TIME_ZONE,
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        }).formatToParts(new Date(timestamp))

        const get = (type) =>
            parts.find((part) => part.type === type)?.value

        return `${get('year')}-${get('month')}-${get('day')}`
    }

    const employees = Array.from(
        new Map(
            shifts.map((shift) => [
                shift.employee_id,
                {
                    id: shift.employee_id,
                    name: `${shift.first_name} ${shift.last_name}`,
                    number: shift.employee_number
                }
            ])
        ).values()
    ).sort((a, b) => a.name.localeCompare(b.name))

    const filteredShifts = shifts.filter((shift) => {
        const matchesEmployee =
            employeeFilter === 'all' ||
            String(shift.employee_id) === employeeFilter

        const matchesDate =
            !dateFilter || formatDate(shift.clock_in) === dateFilter

        return matchesEmployee && matchesDate
    })

    if (loading) {
        return <p>Loading employee shifts...</p>
    }

    if (error) {
        return (
            <p className="admin-shift-error" role="alert">
                {error}
            </p>
        )
    }

    return (
        <section className="admin-shift-history">
            <div className="admin-shift-header">
                <div>
                    <h2>Employee Shift History</h2>
                    <p>Review employee hours, breaks, and attendance.</p>
                </div>

                <span className="admin-shift-count">
                    {filteredShifts.length} shifts
                </span>
            </div>

            <div className="admin-shift-filters">
                <div className="admin-shift-filter">
                    <label htmlFor="shift-employee">
                        Employee
                    </label>

                    <select
                        id="shift-employee"
                        value={employeeFilter}
                        onChange={(e) => setEmployeeFilter(e.target.value)}
                    >
                        <option value="all">All Employees</option>

                        {employees.map((employee) => (
                            <option key={employee.id} value={employee.id}>
                                {employee.name} ({employee.number})
                            </option>
                        ))}
                    </select>
                </div>

                <div className="admin-shift-filter">
                    <label htmlFor="shift-date">
                        Date
                    </label>

                    <input
                        id="shift-date"
                        type="date"
                        value={dateFilter}
                        onChange={(e) => setDateFilter(e.target.value)}
                    />
                </div>

                <button
                    type="button"
                    className="admin-shift-clear"
                    onClick={() => {
                        setEmployeeFilter('all')
                        setDateFilter('')
                    }}
                >
                    Clear Filters
                </button>
            </div>

            <div className="admin-shift-table-container">
                <table className="admin-shift-table">
                    <thead>
                        <tr>
                            <th>Employee</th>
                            <th>Date</th>
                            <th>Clock In</th>
                            <th>Break Start</th>
                            <th>Break End</th>
                            <th>Clock Out</th>
                            <th>Hours</th>
                            <th>Status</th>
                        </tr>
                    </thead>

                    <tbody>
                        {filteredShifts.length === 0 ? (
                            <tr>
                                <td colSpan="8" className="admin-shift-empty">
                                    No shifts found.
                                </td>
                            </tr>
                        ) : (
                            filteredShifts.map((shift) => (
                                <tr key={shift.id}>
                                    <td>
                                        <strong>
                                            {shift.first_name} {shift.last_name}
                                        </strong>
                                        <span className="admin-shift-employee-number">
                                            #{shift.employee_number}
                                        </span>
                                    </td>

                                    <td>{formatDate(shift.clock_in)}</td>
                                    <td>{formatTime(shift.clock_in)}</td>
                                    <td>{formatTime(shift.break_start)}</td>
                                    <td>{formatTime(shift.break_end)}</td>
                                    <td>{formatTime(shift.clock_out)}</td>

                                    <td className="admin-shift-hours">
                                        {Number(shift.hours_worked).toFixed(2)}
                                    </td>

                                    <td>
                                        <span
                                            className={`admin-shift-status ${shift.clock_out
                                                    ? 'completed'
                                                    : shift.break_start && !shift.break_end
                                                        ? 'break'
                                                        : 'active'
                                                }`}
                                        >
                                            {shift.clock_out
                                                ? 'Completed'
                                                : shift.break_start && !shift.break_end
                                                    ? 'On Break'
                                                    : 'Active'}
                                        </span>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </section>
    )
}

export default AdminShiftHistory