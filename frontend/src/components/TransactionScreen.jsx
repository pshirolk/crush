
import { useState } from 'react'
import './TransactionScreen.css'
import { categories } from '../data/products'
import {
    productStockKey,
    modifierStockKey,
} from '../data/inventoryKeys'


const cupSizes = [
    { id: 'small', name: '8 oz', price: 0 },
    { id: 'medium', name: '12 oz', price: 0.50 },
    { id: 'large', name: '16 oz', price: 0.75 },
]

const styleOptions = [
    { id: 'hot', name: 'Hot', price: 0 },
    { id: 'iced', name: 'Iced', price: 0 },
]

const iceOptions = [
    { id: 'regular-ice', name: 'Regular Ice', price: 0 },
    { id: 'light-ice', name: 'Light Ice', price: 0 },
    { id: 'extra-ice', name: 'Extra Ice', price: 0 },
    { id: 'no-ice', name: 'No Ice', price: 0 },
]

const milkOptions = [
    { id: 'whole', name: 'Whole Milk', price: 0 },
    { id: 'skim', name: 'Skim Milk', price: 0 },
    { id: 'soy', name: 'Soy Milk', price: 0.75 },
    { id: 'oat', name: 'Oat Milk', price: 0.75 },
    { id: 'almond', name: 'Almond Milk', price: 0.75 },
]

const syrupOptions = [
    { id: 'vanilla', name: 'Vanilla Syrup', price: 0.50 },
    { id: 'caramel', name: 'Caramel Syrup', price: 0.50 },
    { id: 'hazelnut', name: 'Hazelnut Syrup', price: 0.50 },
    { id: 'chocolate', name: 'Chocolate Syrup', price: 0.50 },
    { id: 'peppermint', name: 'Peppermint Syrup', price: 0.50 },
    { id: 'lavender', name: 'Lavender Syrup', price: 0.50 },
    { id: 'honey', name: 'Honey', price: 0.50 }
]

const modifierConfig = {
    espresso: {
        addOns: [
            { id: 'decaf-shot', name: 'Decaf Shot', price: 0.50 },
        ],
        substitutions: [],
    },
    americano: {
        addOns: [],
        substitutions: [
            {
                id: 'size',
                name: 'Cup Size',
                options: cupSizes,
            },
            {
                id: 'style',
                name: 'Hot / Iced',
                options: styleOptions,
            },
            {
                id: 'ice',
                name: 'Ice Level',
                options: iceOptions,
            },
        ],
    },
    milkCoffee: {
        addOns: [
            { id: 'extra-shot', name: 'Extra Espresso Shot', price: 1.00 },
            ...syrupOptions,
            { id: 'cold-foam', name: 'Cold Foam', price: 1.00 },
        ],
        substitutions: [
            {
                id: 'size',
                name: 'Cup Size',
                options: cupSizes,
            },
            {
                id: 'style',
                name: 'Hot / Iced',
                options: styleOptions,
            },
            {
                id: 'ice',
                name: 'Ice Level',
                options: iceOptions,
            },
            {
                id: 'milk',
                name: 'Milk',
                options: milkOptions,
            },
        ],
    },
    chai: {
        addOns: [
            ...syrupOptions,
            { id: 'extra-chai', name: 'Extra Chai', price: 1.00 },
        ],
        substitutions: [
            {
                id: 'size',
                name: 'Cup Size',
                options: cupSizes,
            },
            {
                id: 'style',
                name: 'Hot / Iced',
                options: styleOptions,
            },
            {
                id: 'ice',
                name: 'Ice Level',
                options: iceOptions,
            },
            {
                id: 'milk',
                name: 'Milk',
                options: milkOptions,
            },
        ],
    },
    matcha: {
        addOns: [
            ...syrupOptions,
            { id: 'extra-matcha', name: 'Extra Matcha', price: 1.50 },
            { id: 'cold-foam', name: 'Cold Foam', price: 1.00 },
        ],
        substitutions: [
            {
                id: 'size',
                name: 'Cup Size',
                options: cupSizes,
            },
            {
                id: 'style',
                name: 'Hot / Iced',
                options: styleOptions,
            },
            {
                id: 'ice',
                name: 'Ice Level',
                options: iceOptions,
            },
            {
                id: 'milk',
                name: 'Milk',
                options: milkOptions,
            },
        ],
    },
}

const formatPrice = (price) => `$${price.toFixed(2)}`

function TransactionScreen({ onBack, inventory }) {
    const [selectedCategory, setSelectedCategory] = useState('Coffee & Tea')
    const [selectedProduct, setSelectedProduct] = useState(null)
    const [selectedAddOns, setSelectedAddOns] = useState([])
    const [selectedSubstitutions, setSelectedSubstitutions] = useState({})
    const [cart, setCart] = useState([])

    const iceStatus = inventory[modifierStockKey('ice')] || 'available'
    const iceSoldOut = iceStatus === 'soldout'

    const getModifierStatus = (id) => inventory?.[modifierStockKey(id)] || 'available'
    const getProductStatus = (id) => inventory?.[productStockKey(id)] || 'available'
    const isAvailable = (option) => getModifierStatus(option.id) !== 'soldout'

    const config = selectedProduct
        ? modifierConfig[selectedProduct.modifierType]
        : null

    const selectProduct = (product) => {
        if (getProductStatus(product.id) === 'soldout') return

        setSelectedProduct(product)
        setSelectedAddOns([])

        const defaults = {}

        const productConfig = modifierConfig[product.modifierType]

        productConfig?.substitutions.forEach((group) => {
            if (group.id !== 'ice') {
                const firstAvailable = group.options.find(isAvailable)
                if (firstAvailable) defaults[group.id] = firstAvailable
            }
        })

        if (defaults.style?.id === 'iced') {
            const firstIce = iceOptions.find(isAvailable)
            if (firstIce) defaults.ice = firstIce
        }
        setSelectedSubstitutions(defaults)

        if (!productConfig) {
            addToCart(product, [], {})
        }
    }

    const updateAddOnQuantity = (option, change) => {
        if (change > 0 && !isAvailable(option)) return
        setSelectedAddOns((current) => {
            const existing = current.find(
                (item) => item.id === option.id
            )

            if (!existing && change > 0) {
                return [
                    ...current,
                    { ...option, quantity: 1 }
                ]
            }

            if (!existing) return current

            const newQuantity = existing.quantity + change

            if (newQuantity <= 0) {
                return current.filter(
                    (item) => item.id !== option.id
                )
            }

            return current.map((item) =>
                item.id === option.id
                    ? { ...item, quantity: newQuantity }
                    : item
            )
        })
    }




    const selectSubstitution = (groupId, option) => {
        if (
            groupId === 'ice' &&
            iceSoldOut
        ) {
            return
        }

        setSelectedSubstitutions((current) => {
            const updated = {
                ...current,
                [groupId]: option,
            }

            if (groupId === 'style') {
                if (option.id === 'iced') {
                    if (!iceSoldOut) {
                        updated.ice = iceOptions[0]
                    } else {
                        delete updated.ice
                    }
                } else {
                    delete updated.ice
                }
            }

            return updated
        })
    }



    const calculatePrice = (product, addOns, substitutions) => {
        const addOnTotal = addOns.reduce(
            (total, item) => total + item.price * item.quantity,
            0
        )

        const substitutionTotal = Object.values(substitutions).reduce(
            (total, item) => total + item.price,
            0
        )

        return product.price + addOnTotal + substitutionTotal
    }

    const canAddToCart = (product, addOns, substitutions) => {
        if (getProductStatus(product.id) === 'soldout') return false
        if (addOns.some((option) => !isAvailable(option))) return false

        const productConfig = modifierConfig[product.modifierType]
        if (!productConfig) return true

        for (const group of productConfig.substitutions) {
            if (group.id === 'ice' && substitutions.style?.id !== 'iced') continue
            const chosen = substitutions[group.id]
            if (!chosen || !group.options.some((option) => option.id === chosen.id) || !isAvailable(chosen)) {
                return false
            }
        }
        return true
    }

    const addToCart = (product, addOns, substitutions) => {
        if (!canAddToCart(product, addOns, substitutions)) return

        const unitPrice = calculatePrice(product, addOns, substitutions)

        const modifierKey = JSON.stringify({
            productId: product.id,
            addOns: addOns
                .map((item) => [item.id, item.quantity])
                .sort(([a], [b]) => a.localeCompare(b)),
            substitutions: Object.entries(substitutions)
                .map(([group, option]) => [group, option.id])
                .sort(([a], [b]) => a.localeCompare(b)),
        })

        setCart((current) => {
            const existing = current.find(
                (item) => item.modifierKey === modifierKey
            )

            if (existing) {
                return current.map((item) =>
                    item.modifierKey === modifierKey
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                )
            }

            return [
                ...current,
                {
                    ...product,
                    modifierKey,
                    addOns: [...addOns],
                    substitutions: { ...substitutions },
                    unitPrice,
                    quantity: 1,
                },
            ]
        })

        setSelectedProduct(null)
        setSelectedAddOns([])
        setSelectedSubstitutions({})
    }

    const updateQuantity = (modifierKey, change) => {
        setCart((current) =>
            current
                .map((item) =>
                    item.modifierKey === modifierKey && (change < 0 || canAddToCart(item, item.addOns, item.substitutions))
                        ? { ...item, quantity: item.quantity + change }
                        : item
                )
                .filter((item) => item.quantity > 0)
        )
    }

    const subtotal = cart.reduce(
        (total, item) => total + item.unitPrice * item.quantity,
        0
    )

    const canAddSelected = selectedProduct
        ? canAddToCart(selectedProduct, selectedAddOns, selectedSubstitutions)
        : false

    const selectedPrice = selectedProduct
        ? calculatePrice(
            selectedProduct,
            selectedAddOns,
            selectedSubstitutions
        )
        : 0

    return (
        <div className="transaction-screen">
            <div className="transaction-heading">
                <button className="back-button" onClick={onBack}>
                    ← Home
                </button>
                <h1>New Order</h1>
            </div>

            <div className="transaction-layout">
                <section className="product-section">
                    <nav className="category-list" aria-label="Product categories">
                        {Object.keys(categories).map((category) => (
                            <button
                                key={category}
                                className={`category-button ${selectedCategory === category ? 'active' : ''
                                    }`}
                                onClick={() => {
                                    setSelectedCategory(category)
                                    setSelectedProduct(null)
                                }}
                            >
                                {category}
                            </button>
                        ))}
                    </nav>

                    {selectedProduct && config ? (
                        <div className="customization-panel">
                            <button
                                className="back-button"
                                onClick={() => setSelectedProduct(null)}
                            >
                                ← Products
                            </button>

                            <div className="customization-header">
                                <h2>{selectedProduct.name}</h2>
                                <strong>{formatPrice(selectedProduct.price)}</strong>
                            </div>

                            {config.addOns.length > 0 && (
                                <div className="modifier-section">
                                    <h3>Add-ons</h3>


                                    {config.addOns.map((option) => {

                                        const status =
                                            getModifierStatus(option.id)

                                        const soldOut = status === 'soldout'

                                        const quantity =
                                            selectedAddOns.find((item) => item.id === option.id)
                                                ?.quantity || 0

                                        const allowsMultiple =
                                            option.id === 'extra-shot' ||
                                            syrupOptions.some((syrup) => syrup.id === option.id)

                                        return (
                                            <div className={`modifier-option inventory-${status}`} key={option.id}>
                                                <span>{option.name}</span>

                                                <span>
                                                    {option.price > 0
                                                        ? `+${formatPrice(option.price)} each`
                                                        : 'Free'}
                                                    {status === 'low' && ' · Running Low'}
                                                    {soldOut && ' · Sold Out'}
                                                </span>

                                                {allowsMultiple ? (
                                                    <div className="modifier-quantity">
                                                        <button
                                                            onClick={() => updateAddOnQuantity(option, -1)}
                                                            disabled={quantity === 0}
                                                            aria-label={`Remove one ${option.name}`}
                                                        >
                                                            −
                                                        </button>

                                                        <span>{quantity}</span>

                                                        <button
                                                            onClick={() => updateAddOnQuantity(option, 1)}
                                                            disabled={soldOut}
                                                            aria-label={`Add one ${option.name}`}
                                                        >
                                                            +
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <input
                                                        type="checkbox"
                                                        checked={quantity > 0}
                                                        disabled={soldOut && quantity === 0}
                                                        onChange={(event) =>
                                                            updateAddOnQuantity(
                                                                option,
                                                                event.target.checked ? 1 : -1
                                                            )
                                                        }
                                                    />
                                                )}
                                            </div>
                                        )
                                    })}

                                </div>
                            )}

                            {config.substitutions
                                .filter((group) => {
                                    if (group.id === 'ice') {
                                        return (
                                            selectedSubstitutions.style?.id === 'iced' &&
                                            !iceSoldOut
                                        )
                                    }

                                    return true
                                })
                                .map((group) => (
                                    <div className="modifier-section" key={group.id}>
                                        <h3>{group.name}</h3>

                                        {group.options.map((option) => {
                                            const status =
                                                group.id === 'ice'
                                                    ? option.id === 'no-ice'
                                                        ? 'available'
                                                        : iceStatus
                                                    : inventory[modifierStockKey(option.id)] || 'available'

                                            const iceUnavailable =
                                                group.id === 'style' &&
                                                option.id === 'iced' &&
                                                iceSoldOut

                                            const soldOut = status === 'soldout' || iceUnavailable

                                            return (

                                                <label
                                                    className={`modifier-option inventory-${soldOut ? 'soldout' : status
                                                        }`}
                                                    key={option.id}
                                                >
                                                    <input
                                                        type="radio"
                                                        name={group.id}
                                                        disabled={soldOut}
                                                        checked={
                                                            selectedSubstitutions[group.id]?.id === option.id
                                                        }
                                                        onChange={() =>
                                                            selectSubstitution(group.id, option)
                                                        }
                                                    />

                                                    <span>{option.name}</span>

                                                    <span>
                                                        {soldOut
                                                            ? 'Sold Out'
                                                            : status === 'low'
                                                                ? 'Running Low'
                                                                : option.price > 0
                                                                    ? `+${formatPrice(option.price)}`
                                                                    : 'Included'}
                                                    </span>
                                                </label>

                                            )
                                        })}
                                    </div>
                                ))}

                            <button
                                className="add-to-order"
                                disabled={!canAddSelected}
                                onClick={() =>
                                    addToCart(
                                        selectedProduct,
                                        selectedAddOns,
                                        selectedSubstitutions
                                    )
                                }
                            >
                                Add to Order · {formatPrice(selectedPrice)}
                            </button>
                        </div>
                    ) : (
                        <>
                            <h2>{selectedCategory}</h2>

                            <div className="product-grid">
                                {categories[selectedCategory].map((product) => {
                                    const status = getProductStatus(product.id)

                                    return (
                                        <button
                                            key={product.id}
                                            className={`product-button inventory-${status}`}
                                            disabled={status === 'soldout'}
                                            onClick={() => selectProduct(product)}
                                        >
                                            <span>{product.name}</span>
                                            <strong>{formatPrice(product.price)}</strong>

                                            {status === 'low' && (
                                                <small className="stock-label">Running Low</small>
                                            )}

                                            {status === 'soldout' && (
                                                <small className="stock-label">Sold Out</small>
                                            )}
                                        </button>
                                    )
                                })}

                            </div>
                        </>
                    )}
                </section>

                <aside className="order-summary">
                    <h2>Current Order</h2>

                    <div className="cart-items">
                        {cart.length === 0 ? (
                            <p className="empty-cart">No items added</p>
                        ) : (
                            cart.map((item) => (
                                <div className="cart-item" key={item.modifierKey}>
                                    <div className="cart-item-info">
                                        <strong>
                                            {item.quantity} × {item.name}
                                        </strong>
                                        <span>
                                            {formatPrice(item.unitPrice * item.quantity)}
                                        </span>
                                    </div>

                                    <div className="cart-modifiers">
                                        {item.addOns.map((option) => (
                                            <span key={option.id}>
                                                {option.quantity} × {option.name}
                                            </span>
                                        ))}


                                        {Object.entries(item.substitutions)
                                            .filter(([groupId, option]) => {
                                                if (groupId === 'style' && option.id === 'iced') {
                                                    return false
                                                }

                                                return true
                                            })
                                            .map(([groupId, option]) => (
                                                <span key={groupId}>{option.name}</span>
                                            ))}

                                    </div>

                                    <div className="quantity-controls">
                                        <button
                                            onClick={() =>
                                                updateQuantity(item.modifierKey, -1)
                                            }
                                            aria-label={`Remove one ${item.name}`}
                                        >
                                            −
                                        </button>

                                        <span>{item.quantity}</span>

                                        <button
                                            onClick={() =>
                                                updateQuantity(item.modifierKey, 1)
                                            }
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
