
import { useEffect, useState } from 'react'
import './EmployeeScreen.css'

const API_URL = 'http://localhost:5001/api/employees'

function EmployeeScreen({ onBack }) {
    const [employeeNumber, setEmployeeNumber] = useState('')
    const [password, setPassword] = useState('')
    const [employee, setEmployee] = useState(null)
    const [shift, setShift] = useState(null)
    const [loading, setLoading] = useState(false)
    const [checkingSession, setCheckingSession] = useState(true)
    const [error, setError] = useState('')
    const [message, setMessage] = useState('')
    const [now, setNow] = useState(Date.now())

    const apiRequest = async (endpoint, options = {}) => {
        const response = await fetch(`${API_URL}${endpoint}`, {
            ...options,
            credentials: 'include',
        })

        const data = await response.json()

        if (!response.ok) {
            throw new Error(data.error || 'Something went wrong.')
        }

        return data
    }

    // Restore login and shift status after refreshing the page
    useEffect(() => {
        let cancelled = false

        const restoreSession = async () => {
            try {
                const session = await apiRequest('/me')
                const active = await apiRequest('/active-shift')

                if (!cancelled) {
                    setEmployee(session.employee)
                    setShift(active.shift)
                }
            } catch (err) {
                if (!cancelled && err.message !== 'Not logged in.') {
                    console.error('Session restoration:', err)
                }
            } finally {
                if (!cancelled) {
                    setCheckingSession(false)
                }
            }
        }

        restoreSession()

        return () => {
            cancelled = true
        }
    }, [])

    useEffect(() => {
        const interval = setInterval(() => {
            setNow(Date.now())
        }, 1000)

        return () => clearInterval(interval)
    }, [])

    const handleLogin = async (event) => {
        event.preventDefault()
        setLoading(true)
        setError('')
        setMessage('')

        try {
            const data = await apiRequest('/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    employeeNumber,
                    password,
                }),
            })

            const active = await apiRequest('/active-shift')

            setEmployee(data.employee)
            setShift(active.shift)
            setPassword('')
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    const handleAction = async (endpoint) => {
        setLoading(true)
        setError('')
        setMessage('')

        try {
            const data = await apiRequest(endpoint, {
                method: 'POST',
            })

            setShift(
                data.shift.clock_out ? null : data.shift
            )
            setMessage(data.message)
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    const handleLogout = async () => {
        setLoading(true)
        setError('')
        setMessage('')

        try {
            await apiRequest('/logout', {
                method: 'POST',
            })

            setEmployee(null)
            setShift(null)
            setEmployeeNumber('')
            setPassword('')
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    const formatTime = (timestamp) => {
        if (!timestamp) return 'Not recorded'

        return new Date(timestamp).toLocaleTimeString([], {
            hour: 'numeric',
            minute: '2-digit',
        })
    }

    const status = !shift
        ? 'Clocked Out'
        : shift.break_start && !shift.break_end
            ? 'On Break'
            : 'Working'


    const formatDuration = (milliseconds) => {
        const totalSeconds = Math.floor(
            Math.max(0, milliseconds) / 1000
        )

        const hours = Math.floor(totalSeconds / 3600)
        const minutes = Math.floor((totalSeconds % 3600) / 60)
        const seconds = totalSeconds % 60

        return [hours, minutes, seconds]
            .map((value) => String(value).padStart(2, '0'))
            .join(':')
    }

    const calculateShiftTime = () => {
        if (!shift) {
            return {
                elapsed: '00:00:00',
                breakTime: '00:00:00',
                worked: '00:00:00',
            }
        }

        const clockIn = new Date(shift.clock_in).getTime()
        const clockOut = shift.clock_out
            ? new Date(shift.clock_out).getTime()
            : now

        const elapsedMs = Math.max(0, clockOut - clockIn)

        let breakMs = 0

        if (shift.break_start) {
            const breakStart = new Date(shift.break_start).getTime()
            const breakEnd = shift.break_end
                ? new Date(shift.break_end).getTime()
                : clockOut

            breakMs = Math.max(0, breakEnd - breakStart)
        }

        const workedMs = Math.max(0, elapsedMs - breakMs)

        return {
            elapsed: formatDuration(elapsedMs),
            breakTime: formatDuration(breakMs),
            worked: formatDuration(workedMs),
        }
    }

    const shiftTime = calculateShiftTime()

    if (checkingSession) {
        return (
            <div className="employee-screen">
                <p>Loading employee session...</p>
            </div>
        )
    }

    return (
        <div className="employee-screen">
            <button className="back-button" onClick={onBack}>
                ← Home
            </button>

            {!employee ? (
                <div className="employee-login">
                    <h1>Employee Login</h1>
                    <p>Sign in to access your time clock.</p>

                    <form onSubmit={handleLogin}>
                        <label htmlFor="employee-number">
                            Employee Number
                        </label>
                        <input
                            id="employee-number"
                            type="text"
                            inputMode="numeric"
                            autoComplete="username"
                            value={employeeNumber}
                            onChange={(e) => setEmployeeNumber(e.target.value)}
                            placeholder="Enter employee number"
                            required
                        />

                        <label htmlFor="employee-password">
                            Password
                        </label>
                        <input
                            id="employee-password"
                            type="password"
                            autoComplete="current-password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter password"
                            required
                        />

                        {error && <p className="employee-error" role="alert">{error}</p>}

                        <button
                            type="submit"
                            className="employee-primary-button"
                            disabled={loading}
                        >
                            {loading ? 'Logging in...' : 'Log In'}
                        </button>
                    </form>
                </div>
            ) : (
                <div className="employee-dashboard">
                    <h1>Welcome, {employee.firstName}!</h1>
                    <p>Employee #{employee.employeeNumber}</p>

                    <div className="employee-status">
                        <h2>Time Clock</h2>
                        <p className="employee-status-label">
                            Status: <strong>{status}</strong>
                        </p>
                    </div>

                    {shift && (
                        <div className="employee-timer">
                            <p className="employee-timer-label">
                                Hours Worked
                            </p>

                            <h2 className="employee-timer-value">
                                {shiftTime.worked}
                            </h2>

                            <div className="employee-timer-details">
                                <div>
                                    <span>Shift Duration</span>
                                    <strong>{shiftTime.elapsed}</strong>
                                </div>

                                <div>
                                    <span>Break Duration</span>
                                    <strong>{shiftTime.breakTime}</strong>
                                </div>
                            </div>
                        </div>
                    )}

                    {shift && (
                        <div className="employee-shift-details">
                            <h3>Current Shift</h3>
                            <p>Clock In: {formatTime(shift.clock_in)}</p>
                            <p>Break Start: {formatTime(shift.break_start)}</p>
                            <p>Break End: {formatTime(shift.break_end)}</p>
                        </div>
                    )}

                    <div className="employee-actions">
                        {!shift && (
                            <button
                                className="employee-primary-button"
                                onClick={() => handleAction('/clock-in')}
                                disabled={loading}
                            >
                                Clock In
                            </button>
                        )}

                        {shift && !shift.break_start && (
                            <>
                                <button
                                    className="employee-primary-button"
                                    onClick={() => handleAction('/break-start')}
                                    disabled={loading}
                                >
                                    Start Break
                                </button>

                                <button
                                    className="employee-primary-button"
                                    onClick={() => handleAction('/clock-out')}
                                    disabled={loading}
                                >
                                    Clock Out
                                </button>
                            </>
                        )}

                        {shift && shift.break_start && !shift.break_end && (
                            <button
                                className="employee-primary-button"
                                onClick={() => handleAction('/break-end')}
                                disabled={loading}
                            >
                                End Break
                            </button>
                        )}

                        {shift && shift.break_end && (
                            <button
                                className="employee-primary-button"
                                onClick={() => handleAction('/clock-out')}
                                disabled={loading}
                            >
                                Clock Out
                            </button>
                        )}
                    </div>

                    {error && <p className="employee-error" role="alert">{error}</p>}
                    {message && <p className="employee-success">{message}</p>}

                    <button
                        className="employee-logout-button"
                        onClick={handleLogout}
                        disabled={loading}
                    >
                        Log Out
                    </button>
                </div>
            )}
        </div>
    )
}

export default EmployeeScreen