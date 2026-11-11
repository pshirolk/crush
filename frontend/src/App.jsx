import { useEffect, useState } from 'react'
import './App.css'

function App() {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [currentScreen, setCurrentScreen] = useState('home')
  
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  const time = currentTime.toLocaleTimeString([], {
    hour: 'numeric',
    minute: '2-digit',
  })

  const date = currentTime.toLocaleDateString([], {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  })

  return (
    <div className="app">
      <header className="header">
        <div className="logo" onClick={() => setCurrentScreen('home')}>
          crush<span>.</span>
        </div>
        <div className="header-label">POINT OF SALE</div>
      </header>

      <main className="main">
        {currentScreen === 'home' ? (
          <>
            <div className="welcome">
              <p>{date}</p>
              <h1>Welcome to crush.</h1>
              <p>What would you like to do?</p>
            </div>

            <div className="home-actions">
              <button
                className="action-button primary"
                onClick={() => setCurrentScreen('transaction')}
              >
                <span className="action-icon">＋</span>
                <span>New Transaction</span>
              </button>

              <div className="secondary-actions">
                {['Transactions', 'Menu', 'Reports', 'Settings'].map((item) => (
                  <button
                    key={item}
                    className="action-button secondary"
                    onClick={() => setCurrentScreen(item.toLowerCase())}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          </>
        ) : (
          <div className="placeholder-screen">
            <button
              className="back-button"
              onClick={() => setCurrentScreen('home')}
            >
              ← Back to Home
            </button>
            <h1>
              {currentScreen === 'transaction'
                ? 'New Transaction'
                : currentScreen.charAt(0).toUpperCase() +
                  currentScreen.slice(1)}
            </h1>
            <p>blank</p>
          </div>
        )}
      </main>

      <footer className="footer">
        <span>crush POS</span>
        <span className="clock">{time}</span>
      </footer>
    </div>
  )
}

export default App
