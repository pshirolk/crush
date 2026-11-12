
import { useState } from 'react'
import './InventoryScreen.css'
import { modifierInventory } from '../data/modifiers'
import {
  productStockKey,
  modifierStockKey,
} from '../data/inventoryKeys'

function InventoryScreen({
  products,
  inventory,
  updateInventoryStatus,
  onBack,
}) {
  const [savingKey, setSavingKey] = useState(null)
  const [saveError, setSaveError] = useState('')

  // Save inventory changes through the backend
  const updateStatus = async (key, status) => {
    if (savingKey !== null) return

    setSavingKey(key)
    setSaveError('')

    try {
      await updateInventoryStatus(key, status)
    } catch (error) {
      console.error('Error updating inventory:', error)
      setSaveError(
        'Unable to save inventory change. Please try again.'
      )
    } finally {
      setSavingKey(null)
    }
  }

  // Combine menu products and individual modifiers
  const inventoryItems = [
    ...products.map((product) => ({
      ...product,
      stockKey: productStockKey(product.id),
      group: 'Menu Items',
    })),
    ...Object.entries(modifierInventory).flatMap(
      ([group, options]) =>
        options.map((option) => ({
          ...option,
          stockKey: modifierStockKey(option.id),
          group,
        }))
    ),
  ]

  // Filter items by inventory status
  const soldOut = inventoryItems.filter(
    (item) => inventory[item.stockKey] === 'soldout'
  )

  const runningLow = inventoryItems.filter(
    (item) => inventory[item.stockKey] === 'low'
  )

  // Inventory status dropdown
  const statusSelect = (key, name) => (
    <select
      value={inventory[key] || 'available'}
      onChange={(event) =>
        updateStatus(key, event.target.value)
      }
      aria-label={`Inventory status for ${name}`}
      disabled={savingKey !== null}
    >
      <option value="available">Available</option>
      <option value="low">Running Low</option>
      <option value="soldout">Sold Out</option>
    </select>
  )

  // Reusable inventory row
  const inventoryRow = (item) => {
    const status = inventory[item.stockKey] || 'available'

    return (
      <div
        className={`inventory-item inventory-${status}`}
        key={item.stockKey}
      >
        <span>{item.name}</span>
        {statusSelect(item.stockKey, item.name)}
      </div>
    )
  }

  // Reusable alert row
  const alertRow = (item) => (
    <div
      className="inventory-alert"
      key={item.stockKey}
    >
      <span>{item.name}</span>

      <button
        onClick={() =>
          updateStatus(item.stockKey, 'available')
        }
        disabled={savingKey !== null}
      >
        {savingKey === item.stockKey
          ? 'Saving...'
          : 'Mark Available'}
      </button>
    </div>
  )

  return (
    <div className="inventory-screen">
      <button
        className="back-button"
        onClick={onBack}
      >
        ← Home
      </button>

      <h1>Inventory</h1>

      {saveError && (
        <p role="alert" className="inventory-error">
          {saveError}
        </p>
      )}

      {/* Inventory alerts */}
      <div className="inventory-alerts">
        <div className="inventory-group">
          <h2>Sold Out ({soldOut.length})</h2>

          {soldOut.length === 0 && (
            <p>No sold out items</p>
          )}

          {soldOut.map(alertRow)}
        </div>

        <div className="inventory-group">
          <h2>Running Low ({runningLow.length})</h2>

          {runningLow.length === 0 && (
            <p>No items running low</p>
          )}

          {runningLow.map(alertRow)}
        </div>
      </div>

      {/* Menu product inventory */}
      <h2>Beverages and Items</h2>

      <div className="inventory-list">
        {products.map((product) =>
          inventoryRow({
            ...product,
            stockKey: productStockKey(product.id),
          })
        )}
      </div>

      {/* Individual modifier inventory */}
      <h2>Individual Products</h2>

      {Object.entries(modifierInventory).map(
        ([group, options]) => (
          <div
            className="inventory-group"
            key={group}
          >
            <h3>{group}</h3>

            {options.map((option) =>
              inventoryRow({
                ...option,
                stockKey: modifierStockKey(option.id),
              })
            )}
          </div>
        )
      )}
    </div>
  )
}

export default InventoryScreen
