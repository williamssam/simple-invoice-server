import type { InvoiceDocument } from '../modules/invoice/invoice.model'

export const convertToPennies = (value: number) => value * 100

// To display values to end users remember to call .toFixed(2)
export const convertFromPennies = (value: number) => (value / 100).toFixed(2)

export const calculate = {
	subtotal: (invoices: InvoiceDocument) =>
		invoices.items.reduce((total, item) => {
			return total + item.price * item.quantity
		}, 0),
	total: (invoices: InvoiceDocument) =>
		calculate.subtotal(invoices) + invoices.vat,
}



