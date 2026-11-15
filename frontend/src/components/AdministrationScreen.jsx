
import { useEffect, useState } from 'react'
import './AdministrationScreen.css'
import AdminShiftHistory from './AdminShiftHistory'

const API_URL = 'http://localhost:5001/api/admin'

function AdministrationScreen({ onBack }) {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [admin, setAdmin] = useState(null)
    const [checkingSession, setCheckingSession] = useState(true)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

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

    // Restore an existing admin session
    useEffect(() => {
        let cancelled = false

        const checkSession = async () => {
            try {
                const data = await apiRequest('/me')

                if (!cancelled) {
                    setAdmin(data.admin)
                }
            } catch (err) {
                if (!cancelled && err.message !== 'Admin login required.') {
                    console.error(err)
                }
            } finally {
                if (!cancelled) {
                    setCheckingSession(false)
                }
            }
        }

        checkSession()

        return () => {
            cancelled = true
        }
    }, [])

    const handleLogin = async (event) => {
        event.preventDefault()
        setLoading(true)
        setError('')

        try {
            const data = await apiRequest('/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            })

            setAdmin(data.admin)
            setPassword('')
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    const handleLogout = async () => {
        setLoading(true)
        setError('')

        try {
            await apiRequest('/logout', {
                method: 'POST',
            })

            setAdmin(null)
            setUsername('')
            setPassword('')
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    if (checkingSession) {
        return (
            <div className="administration-screen">
                <p>Checking administrator session...</p>
            </div>
        )
    }

    return (
        <div className="administration-screen">
            <button className="back-button" onClick={onBack}>
                ← Home
            </button>

            {!admin ? (
                <div className="administration-login">
                    <h1>Administration</h1>
                    <p>Manager access only</p>

                    <form onSubmit={handleLogin}>
                        <label htmlFor="admin-username">
                            Username
                        </label>

                        <input
                            id="admin-username"
                            type="text"
                            autoComplete="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Enter username"
                            required
                        />

                        <label htmlFor="admin-password">
                            Password
                        </label>

                        <input
                            id="admin-password"
                            type="password"
                            autoComplete="current-password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter password"
                            required
                        />

                        {error && (
                            <p className="administration-error" role="alert">
                                {error}
                            </p>
                        )}

                        <button
                            type="submit"
                            className="administration-primary-button"
                            disabled={loading}
                        >
                            {loading ? 'Logging in...' : 'Log In'}
                        </button>
                    </form>
                </div>
            ) : (
                <div className="administration-dashboard">
                    <div className="administration-heading">
                        <div>
                            <h1>Administration</h1>
                            <p>Logged in as {admin.username}</p>
                        </div>

                        <button
                            className="administration-logout-button"
                            onClick={handleLogout}
                            disabled={loading}
                        >
                            Log Out
                        </button>
                    </div>

                    <div className="administration-content">
                        <AdminShiftHistory />
                    </div>

                    {error && (
                        <p className="administration-error" role="alert">
                            {error}
                        </p>
                    )}
                </div>
            )}
        </div>
    )
}

export default AdministrationScreen