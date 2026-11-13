
import express from 'express'
import pool from '../config/db.js'

const router = express.Router()

router.post('/', async (req, res) => {
    const client = await pool.connect()

    try {
        const {
            customerName,
            orderNote,
            items,
            paymentMethod,
            tip = 0
        } = req.body

        if (!Array.isArray(items) || items.length === 0) {
            return res.status(400).json({
                error: 'Order must contain at least one item.'
            })
        }

        if (!['cash', 'card'].includes(paymentMethod)) {
            return res.status(400).json({
                error: 'Invalid payment method.'
            })
        }

        // Temporary development values.
        // Product pricing and taxes must be validated server-side
        // before accepting real transactions.
        const subtotal = items.reduce(
            (sum, item) => sum + Number(item.unitPrice) * Number(item.quantity),
            0
        )

        const tax = 0
        const tipAmount = Number(tip)
        const total = subtotal + tax + tipAmount

        if (
            !Number.isFinite(subtotal) ||
            !Number.isFinite(tipAmount) ||
            tipAmount < 0 ||
            items.some(item =>
                !Number.isInteger(Number(item.quantity)) ||
                Number(item.quantity) <= 0 ||
                !Number.isFinite(Number(item.unitPrice)) ||
                Number(item.unitPrice) < 0
            )
        ) {
            return res.status(400).json({
                error: 'Invalid order amounts.'
            })
        }

        await client.query('BEGIN')

        const orderResult = await client.query(
            `INSERT INTO orders (
                customer_name,
                order_note,
                subtotal,
                tax,
                tip,
                total,
                payment_method,
                payment_status,
                status
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, 'unpaid', 'pending')
            RETURNING id, order_number, total, status`,
            [
                customerName?.trim() || null,
                orderNote?.trim() || null,
                subtotal.toFixed(2),
                tax.toFixed(2),
                tipAmount.toFixed(2),
                total.toFixed(2),
                paymentMethod
            ]
        )

        const order = orderResult.rows[0]

        for (const item of items) {
            await client.query(
                `INSERT INTO order_items (
                    order_id,
                    product_id,
                    product_name,
                    quantity,
                    unit_price,
                    line_total,
                    modifiers
                )
                VALUES ($1, $2, $3, $4, $5, $6, $7)`,
                [
                    order.id,
                    item.id,
                    item.name,
                    item.quantity,
                    item.unitPrice,
                    (item.unitPrice * item.quantity).toFixed(2),
                    JSON.stringify({
                        addOns: item.addOns || [],
                        substitutions: item.substitutions || {}
                    })
                ]
            )
        }

        await client.query('COMMIT')

        res.status(201).json({
            message: 'Order created successfully.',
            order: {
                ...order,
                displayNumber: `#${String(order.order_number).padStart(6, '0')}`
            }
        })
    } catch (error) {
        await client.query('ROLLBACK')
        console.error('Error creating order:', error)

        res.status(500).json({
            error: 'Failed to create order.'
        })
    } finally {
        client.release()
    }
})

export default router