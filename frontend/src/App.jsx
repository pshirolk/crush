import { useEffect, useState } from 'react'
import TransactionScreen from './components/TransactionScreen'
import Screensaver from './components/Screensaver'
import InventoryScreen from './components/InventoryScreen'
import { products } from './data/products'
import './App.css'

function App() {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [currentScreen, setCurrentScreen] = useState('home')
  const [isInactive, setIsInactive] = useState(false)


  // Load saved inventory when the app starts
  const [inventory, setInventory] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('crush-inventory')) || {}
    } catch {
      return {}
    }
  })

  // Save inventory whenever its status changes
  useEffect(() => {
    localStorage.setItem('crush-inventory', JSON.stringify(inventory))
  }, [inventory])

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(interval)
  }, [])


  useEffect(() => {
    let inactivityTimer

    const resetTimer = () => {
      setIsInactive(false)

      clearTimeout(inactivityTimer)

      inactivityTimer = setTimeout(() => {
        setIsInactive(true)
      }, 30000)
    }

    const events = [
      'mousemove',
      'mousedown',
      'keydown',
      'touchstart',
      'pointerdown',
    ]

    events.forEach((event) => {
      window.addEventListener(event, resetTimer)
    })

    resetTimer()

    return () => {
      clearTimeout(inactivityTimer)

      events.forEach((event) => {
        window.removeEventListener(event, resetTimer)
      })
    }
  }, [])


  const time = currentTime.toLocaleTimeString([], {
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit'
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
              {['New Order', 'Transactions', 'Inventory', 'Tips', 'Reports', 'Employees'].map((item) => (
                <button
                  key={item}
                  className={`action-button ${item === 'New Order' ? 'primary' : 'secondary'}`}
                  onClick={() =>
                    setCurrentScreen(item === 'New Order' ? 'transaction' : item.toLowerCase())
                  }
                >
                  {item === 'New Order' && <span className="action-icon">＋</span>}
                  <span>{item}</span>
                </button>
              ))}
            </div>

          </>

        ) : currentScreen === 'transaction' ? (
          <TransactionScreen
            onBack={() => setCurrentScreen('home')}
            inventory={inventory}
          />
        ) : currentScreen === 'inventory' ? (
          <InventoryScreen
            products={products}
            inventory={inventory}
            setInventory={setInventory}
            onBack={() => setCurrentScreen('home')}
          />
        ) : (
          <div className="placeholder-screen">
            <button
              className="back-button"
              onClick={() => setCurrentScreen('home')}
            >
              ← Home
            </button>
            <h1>
              {currentScreen.charAt(0).toUpperCase() +
                currentScreen.slice(1)}
            </h1>
          </div>
        )}
      </main>

      <footer className="footer">
        <span>crush coffee 2026</span>
        <span className="clock">{time}</span>
      </footer>
      {isInactive && <Screensaver />}
    </div>
  )
}

export default App
