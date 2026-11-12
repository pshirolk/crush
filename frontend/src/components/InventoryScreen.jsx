import './InventoryScreen.css'
import { modifierInventory } from '../data/modifiers'
import {
  productStockKey,
  modifierStockKey,
} from '../data/inventoryKeys'

function InventoryScreen({ products, inventory, setInventory, onBack }) {
  const updateStatus = (key, status) => {
    setInventory((current) => ({
      ...current,
      [key]: status,
    }))
  }

  const inventoryItems = [
    ...products.map((product) => ({
      ...product,
      stockKey: productStockKey(product.id),
      group: 'Menu Items',
    })),
    ...Object.entries(modifierInventory).flatMap(([group, options]) =>
      options.map((option) => ({
        ...option,
        stockKey: modifierStockKey(option.id),
        group,
      }))
    ),
  ]

  const soldOut = inventoryItems.filter(
    (item) => inventory[item.stockKey] === 'soldout'
  )

  const runningLow = inventoryItems.filter(
    (item) => inventory[item.stockKey] === 'low'
  )

  const statusSelect = (key) => (
    <select
      value={inventory[key] || 'available'}
      onChange={(event) => updateStatus(key, event.target.value)}
      aria-label="Inventory status"
    >
      <option value="available">Available</option>
      <option value="low">Running Low</option>
      <option value="soldout">Sold Out</option>
    </select>
  )

  const inventoryRow = (item) => {
    const status = inventory[item.stockKey] || 'available'

    return (
      <div
        className={`inventory-item inventory-${status}`}
        key={item.stockKey}
      >
        <span>{item.name}</span>
        {statusSelect(item.stockKey)}
      </div>
    )
  }

  return (
    <div className="inventory-screen">
      <button className="back-button" onClick={onBack}>
        ← Home
      </button>

      <h1>Inventory</h1>

      <div className="inventory-alerts">
        <div className="inventory-group">
          <h2>Sold Out ({soldOut.length})</h2>

          {soldOut.length === 0 && <p>No sold-out items</p>}

          {soldOut.map((item) => (
            <div className="inventory-alert" key={item.stockKey}>
              <span>{item.name}</span>
              <button
                onClick={() => updateStatus(item.stockKey, 'available')}
              >
                Mark Available
              </button>
            </div>
          ))}
        </div>

        <div className="inventory-group">
          <h2>Running Low ({runningLow.length})</h2>

          {runningLow.length === 0 && <p>No items running low</p>}

          {runningLow.map((item) => (
            <div className="inventory-alert" key={item.stockKey}>
              <span>{item.name}</span>
              <button
                onClick={() => updateStatus(item.stockKey, 'available')}
              >
                Mark Available
              </button>
            </div>
          ))}
        </div>
      </div>

      <h2>Beverages and Items</h2>
      <div className="inventory-list">
        {products.map((product) =>
          inventoryRow({ ...product, stockKey: productStockKey(product.id) })
        )}
      </div>

      <h2>Individual Products</h2>
      {Object.entries(modifierInventory).map(([group, options]) => (
        <div className="inventory-group" key={group}>
          <h3>{group}</h3>
          {options.map((option) =>
            inventoryRow({ ...option, stockKey: modifierStockKey(option.id) })
          )}
        </div>
      ))}
    </div>
  )
}

export default InventoryScreen