
import { useEffect, useState } from 'react'
import './TransactionHistory.css'

function TransactionHistory({ onBack }) {
    const [transactions, setTransactions] = useState([])
    const [search, setSearch] = useState('')
    const [selectedTransaction, setSelectedTransaction] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        const controller = new AbortController()

        const loadTransactions = async () => {
            try {
                const response = await fetch(
                    'http://localhost:5001/api/orders',
                    { signal: controller.signal }
                )

                if (!response.ok) {
                    throw new Error('Failed to load transactions.')
                }

                const data = await response.json()
                setTransactions(data)
            } catch (err) {
                if (err.name !== 'AbortError') {
                    setError(err.message)
                }
            } finally {
                if (!controller.signal.aborted) {
                    setLoading(false)
                }
            }
        }

        loadTransactions()

        return () => controller.abort()
    }, [])

    const filteredTransactions = transactions.filter((transaction) =>
        (transaction.customer_name || '')
            .toLowerCase()
            .includes(search.trim().toLowerCase())
    )

    const formatMoney = (amount) =>
        `$${Number(amount).toFixed(2)}`

    const formatDate = (date) =>
        new Date(date).toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
        })

    return (
        <div className="transactions-screen">
            <button className="back-button" onClick={onBack}>
                ← Home
            </button>

            <div className="transactions-heading">
                <div>
                    <h1>Transactions</h1>
                    <p>View and search completed sales.</p>
                </div>
                <span className="transactions-count">
                    {filteredTransactions.length} transactions
                </span>
            </div>

            <div className="transactions-search">
                <span aria-hidden="true">⌕</span>
                <input
                    type="search"
                    placeholder="Search by customer name..."
                    aria-label="Search transactions by customer name"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                />
            </div>

            {loading ? (
                <p>Loading transactions...</p>
            ) : error ? (
                <p role="alert">{error}</p>
            ) : (
                <div className="transactions-table-wrapper">
                    <table className="transactions-table">
                        <thead>
                            <tr>
                                <th>Order #</th>
                                <th>Date & Time</th>
                                <th>Customer</th>
                                <th>Total</th>
                                <th>Payment</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredTransactions.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="transactions-empty">
                                        {search
                                            ? 'No transactions match that customer name.'
                                            : 'No completed transactions yet.'}
                                    </td>
                                </tr>
                            ) : (
                                filteredTransactions.map((transaction) => (
                                    <tr
                                        key={transaction.id}
                                        className="transactions-row"
                                        onClick={() => setSelectedTransaction(transaction)}
                                    >
                                        <td>{transaction.displayNumber}</td>
                                        <td>{formatDate(transaction.created_at)}</td>
                                        <td>{transaction.customer_name || 'Walk-in'}</td>
                                        <td>{formatMoney(transaction.total)}</td>
                                        <td className="transactions-capitalize">
                                            {transaction.payment_method}
                                        </td>
                                        <td>
                                            <span className="transactions-status">
                                                Completed
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {selectedTransaction && (
                <div
                    className="transaction-modal-overlay"
                    onClick={() => setSelectedTransaction(null)}
                >
                    <div
                        className="transaction-modal"
                        role="dialog"
                        aria-modal="true"
                        aria-label={`Transaction ${selectedTransaction.displayNumber}`}
                        onClick={(event) => event.stopPropagation()}
                    >
                        <div className="transaction-modal-header">
                            <div>
                                <h2>{selectedTransaction.displayNumber}</h2>
                                <p>{formatDate(selectedTransaction.created_at)}</p>
                            </div>
                            <button
                                className="transaction-modal-close"
                                onClick={() => setSelectedTransaction(null)}
                                aria-label="Close transaction details"
                            >
                                ×
                            </button>
                        </div>

                        <div className="transaction-modal-info">
                            <p>
                                <strong>Customer:</strong>{' '}
                                {selectedTransaction.customer_name || 'Walk-in'}
                            </p>
                            <p>
                                <strong>Payment:</strong>{' '}
                                {selectedTransaction.payment_method}
                            </p>
                            <p>
                                <strong>Status:</strong> Completed
                            </p>
                        </div>

                        <h3>Items</h3>

                        <div className="transaction-modal-items">
                            {selectedTransaction.items.map((item) => (
                                <div key={item.id} className="transaction-modal-item">
                                    <div>
                                        <strong>
                                            {item.quantity} × {item.name}
                                        </strong>

                                        {item.modifiers?.addOns?.length > 0 && (
                                            <p>
                                                Add-ons:{' '}
                                                {item.modifiers.addOns
                                                    .map((addon) =>
                                                        typeof addon === 'string'
                                                            ? addon
                                                            : addon.name || addon.label
                                                    )
                                                    .filter(Boolean)
                                                    .join(', ')}
                                            </p>
                                        )}

                                        {Object.entries(
                                            item.modifiers?.substitutions || {}
                                        ).map(([key, value]) => (
                                            <p key={key}>
                                                {key}: {typeof value === 'object'
                                                    ? value?.name || value?.label || JSON.stringify(value)
                                                    : String(value)}
                                            </p>
                                        ))}
                                    </div>

                                    <span>{formatMoney(item.lineTotal)}</span>
                                </div>
                            ))}
                        </div>

                        {selectedTransaction.order_note && (
                            <p className="transaction-modal-note">
                                <strong>Note:</strong> {selectedTransaction.order_note}
                            </p>
                        )}

                        <div className="transaction-modal-totals">
                            <div>
                                <span>Subtotal</span>
                                <span>{formatMoney(selectedTransaction.subtotal)}</span>
                            </div>
                            <div>
                                <span>Tax</span>
                                <span>{formatMoney(selectedTransaction.tax)}</span>
                            </div>
                            <div>
                                <span>Tip</span>
                                <span>{formatMoney(selectedTransaction.tip)}</span>
                            </div>
                            <div className="transaction-modal-total">
                                <strong>Total</strong>
                                <strong>{formatMoney(selectedTransaction.total)}</strong>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default TransactionHistory