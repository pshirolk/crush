import { useEffect, useState } from 'react'
import TransactionScreen from './components/TransactionScreen'
import Screensaver from './components/Screensaver'
import InventoryScreen from './components/InventoryScreen'
import { products } from './data/products'
import TransactionHistory from './components/TransactionHistory'
import EmployeeScreen from './components/EmployeeScreen'
import AdministrationScreen from './components/AdministrationScreen'
import ReportsScreen from './components/ReportsScreen'
import './App.css'

function App() {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [currentScreen, setCurrentScreen] = useState('home')
  const [isInactive, setIsInactive] = useState(false)
  const [inventory, setInventory] = useState({})
  const [inventoryLoading, setInventoryLoading] = useState(true)
  const [inventoryError, setInventoryError] = useState('')

  useEffect(() => {
    const updateClock = () => {
      setCurrentTime(new Date())
    }

    updateClock()

    const clockInterval = setInterval(updateClock, 1000)

    return () => clearInterval(clockInterval)
  }, [])

  useEffect(() => {
    let cancelled = false

    const loadInventory = async () => {
      try {
        const response = await fetch(
          'http://localhost:5001/api/inventory'
        )

        if (!response.ok) {
          throw new Error('Failed to load inventory')
        }

        const data = await response.json()

        if (!cancelled) {
          setInventory(data)
          setInventoryError('')
        }
      } catch (error) {
        console.error(error)

        if (!cancelled) {
          setInventoryError('Unable to load inventory')
        }
      } finally {
        if (!cancelled) {
          setInventoryLoading(false)
        }
      }
    }

    loadInventory()

    return () => {
      cancelled = true
    }
  }, [])

  const updateInventoryStatus = async (key, status) => {
    const response = await fetch(
      `http://localhost:5001/api/inventory/${encodeURIComponent(key)}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      }
    )

    if (!response.ok) {
      throw new Error('Failed to update inventory')
    }

    const updated = await response.json()

    setInventory((current) => ({
      ...current,
      [updated.item_key]: updated.status,
    }))
  }

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
          <img src="/ccLogo.png" alt="Crush Logo" />
        </div>
        <div className="header-label">REGISTER 1</div>
      </header>

      <main className={`main ${currentScreen === 'home' ? 'home-main' : 'workspace-main'
        }`}>
        {currentScreen === 'home' ? (
          <>
            <div className="welcome">
              <h1>{date}</h1>
              <p>What would you like to do?</p>
            </div>


            <div className="home-actions">
              {['New Order', 'Transactions', 'Inventory', 'Administration', 'Reports', 'Employees'].map((item) => (
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


        ) : currentScreen === 'transactions' ? (
          <TransactionHistory
            onBack={() => setCurrentScreen('home')}
          />

        ) : currentScreen === 'transaction' ? (
          inventoryLoading ? (
            <p>Loading inventory...</p>
          ) : inventoryError ? (
            <p>{inventoryError}</p>
          ) : (
            <TransactionScreen
              onBack={() => setCurrentScreen('home')}
              inventory={inventory}
            />
          )

        ) : currentScreen === 'inventory' ? (
          <InventoryScreen
            products={products}
            inventory={inventory}
            updateInventoryStatus={updateInventoryStatus}
            onBack={() => setCurrentScreen('home')}
          />
        ) : currentScreen === 'employees' ? (
          <EmployeeScreen onBack={() => setCurrentScreen('home')} />

        ) : currentScreen === 'administration' ? (
          <AdministrationScreen
            onBack={() => setCurrentScreen('home')}
          />
        ) : currentScreen === 'reports' ? (
          <ReportsScreen onBack={() => setCurrentScreen('home')} />

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
