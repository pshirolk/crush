
import { useState } from 'react'
import './TransactionScreen.css'

const categories = {
    'Coffee & Tea': [
        { id: 1, name: 'Espresso', price: 3.00, modifierType: 'espresso' },
        { id: 2, name: 'Americano', price: 3.50, modifierType: 'americano' },
        { id: 3, name: 'Latte', price: 4.75, modifierType: 'milkCoffee' },
        { id: 4, name: 'Cappuccino', price: 4.50, modifierType: 'milkCoffee' },
        { id: 5, name: 'Chai Latte', price: 4.75, modifierType: 'chai' },
        { id: 6, name: 'Matcha Latte', price: 5.25, modifierType: 'matcha' },
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
    'Merch': [
        { id: 13, name: 'Crush Tote Bag', price: 18.00 },
        { id: 14, name: 'Crush Mug', price: 15.00 },
    ],
}

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

function TransactionScreen({ onBack }) {
    const [selectedCategory, setSelectedCategory] = useState('Coffee & Tea')
    const [selectedProduct, setSelectedProduct] = useState(null)
    const [selectedAddOns, setSelectedAddOns] = useState([])
    const [selectedSubstitutions, setSelectedSubstitutions] = useState({})
    const [cart, setCart] = useState([])

    const config = selectedProduct
        ? modifierConfig[selectedProduct.modifierType]
        : null

    const selectProduct = (product) => {
        setSelectedProduct(product)
        setSelectedAddOns([])

        const defaults = {}

        const productConfig = modifierConfig[product.modifierType]

        productConfig?.substitutions.forEach((group) => {
            if (group.id !== 'ice') {
                defaults[group.id] = group.options[0]
            }
        })
        setSelectedSubstitutions(defaults)

        if (!productConfig) {
            addToCart(product, [], {})
        }
    }

    const updateAddOnQuantity = (option, change) => {
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
        setSelectedSubstitutions((current) => {
            const updated = {
                ...current,
                [groupId]: option,
            }

            if (groupId === 'style') {
                if (option.id === 'iced') {
                    updated.ice = iceOptions[0]
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

    const addToCart = (product, addOns, substitutions) => {
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
                    item.modifierKey === modifierKey
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
                                        const quantity =
                                            selectedAddOns.find((item) => item.id === option.id)
                                                ?.quantity || 0

                                        const allowsMultiple =
                                            option.id === 'extra-shot' ||
                                            ['vanilla', 'caramel', 'hazelnut'].includes(option.id)

                                        return (
                                            <div className="modifier-option" key={option.id}>
                                                <span>{option.name}</span>

                                                <span>
                                                    {option.price > 0
                                                        ? `+${formatPrice(option.price)} each`
                                                        : 'Free'}
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
                                                            aria-label={`Add one ${option.name}`}
                                                        >
                                                            +
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <input
                                                        type="checkbox"
                                                        checked={quantity > 0}
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
                                        return selectedSubstitutions.style?.id === 'iced'
                                    }

                                    return true
                                })
                                .map((group) => (
                                    <div className="modifier-section" key={group.id}>
                                        <h3>{group.name}</h3>

                                        {group.options.map((option) => (
                                            <label className="modifier-option" key={option.id}>
                                                <input
                                                    type="radio"
                                                    name={group.id}
                                                    checked={
                                                        selectedSubstitutions[group.id]?.id === option.id
                                                    }
                                                    onChange={() =>
                                                        selectSubstitution(group.id, option)
                                                    }
                                                />
                                                <span>{option.name}</span>
                                                <span>
                                                    {option.price > 0
                                                        ? `+${formatPrice(option.price)}`
                                                        : 'Included'}
                                                </span>
                                            </label>
                                        ))}
                                    </div>
                                ))}

                            <button
                                className="add-to-order"
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
                                {categories[selectedCategory].map((product) => (
                                    <button
                                        key={product.id}
                                        className="product-button"
                                        onClick={() => selectProduct(product)}
                                    >
                                        <span>{product.name}</span>
                                        <strong>{formatPrice(product.price)}</strong>
                                    </button>
                                ))}
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
