
import { useState } from 'react'
import './TransactionScreen.css'

const categories = {
    'Coffee & Tea': [
        { id: 1, name: 'Espresso', price: 3.00 },
        { id: 2, name: 'Americano', price: 3.50 },
        { id: 3, name: 'Latte', price: 4.75 },
        { id: 4, name: 'Cappuccino', price: 4.50 },
        { id: 5, name: 'Chai Latte', price: 4.75 },
        { id: 6, name: 'Matcha Latte', price: 5.25 },
    ],
    'Baked Goods': [
        { id: 7, name: 'Croissant', price: 3.75 },
        { id: 8, name: 'Blueberry Muffin', price: 3.50 },
        { id: 9, name: 'Chocolate Chip Cookie', price: 2.75 },
    ],
    'Bottled Beverages & Chips': [
        { id: 10, name: 'Bottled Water', price: 2.00 },
        { id: 11, name: 'Sparkling Water', price: 2.75 },
        { id: 12, name: 'Potato Chips', price: 2.50 },
    ],
    Merch: [
        { id: 13, name: 'Crush Tote Bag', price: 18.00 },
        { id: 14, name: 'Crush Mug', price: 15.00 },
    ],
}

function TransactionScreen({ onBack }) {
    const [selectedCategory, setSelectedCategory] = useState('Coffee & Tea')
    const [cart, setCart] = useState([])

    const formatPrice = (price) => `$${price.toFixed(2)}`

    const addToCart = (product) => {
        setCart((currentCart) => {
            const existing = currentCart.find((item) => item.id === product.id)

            if (existing) {
                return currentCart.map((item) =>
                    item.id === product.id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                )
            }

            return [...currentCart, { ...product, quantity: 1 }]
        })
    }

    const updateQuantity = (id, change) => {
        setCart((currentCart) =>
            currentCart
                .map((item) =>
                    item.id === id
                        ? { ...item, quantity: item.quantity + change }
                        : item
                )
                .filter((item) => item.quantity > 0)
        )
    }

    const subtotal = cart.reduce(
        (total, item) => total + item.price * item.quantity,
        0
    )

    return (
        <div className="transaction-screen">
            <div className="transaction-heading">
                <button className="back-button" onClick={onBack}>
                    ← Home
                </button>
                <h1>New Transaction</h1>
            </div>

            <div className="transaction-layout">
                <section className="product-section">
                    <nav className="category-list" aria-label="Product categories">
                        {Object.keys(categories).map((category) => (
                            <button
                                key={category}
                                className={`category-button ${selectedCategory === category ? 'active' : ''
                                    }`}
                                onClick={() => setSelectedCategory(category)}
                            >
                                {category}
                            </button>
                        ))}
                    </nav>

                    <h2>{selectedCategory}</h2>

                    <div className="product-grid">
                        {categories[selectedCategory].map((product) => (
                            <button
                                key={product.id}
                                className="product-button"
                                onClick={() => addToCart(product)}
                            >
                                <span>{product.name}</span>
                                <strong>{formatPrice(product.price)}</strong>
                            </button>
                        ))}
                    </div>
                </section>

                <aside className="order-summary">
                    <h2>Current Order</h2>

                    <div className="cart-items">
                        {cart.length === 0 ? (
                            <p className="empty-cart">No items added</p>
                        ) : (
                            cart.map((item) => (
                                <div className="cart-item" key={item.id}>
                                    <div className="cart-item-info">
                                        <strong>{item.name}</strong>
                                        <span>{formatPrice(item.price * item.quantity)}</span>
                                    </div>

                                    <div className="quantity-controls">
                                        <button
                                            onClick={() => updateQuantity(item.id, -1)}
                                            aria-label={`Remove one ${item.name}`}
                                        >
                                            −
                                        </button>
                                        <span>{item.quantity}</span>
                                        <button
                                            onClick={() => updateQuantity(item.id, 1)}
                                            aria-label={`Add one ${item.name}`}
                                        >
                                            +
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    <div className="order-bottom">
                        <div className="subtotal">
                            <span>Subtotal</span>
                            <strong>{formatPrice(subtotal)}</strong>
                        </div>

                        <button
                            className="clear-order"
                            onClick={() => setCart([])}
                            disabled={cart.length === 0}
                        >
                            Clear Order
                        </button>
                    </div>
                </aside>
            </div>
        </div>
    )
}

export default TransactionScreen