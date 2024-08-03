import InvoiceModel from '../modules/invoice/invoice.model'
import { sendMail } from '../utils/mailer'
import { calculate } from '../utils/money'

/**
 * Sends a reminder email for unpaid invoices that are due within the next three days.
 *
 */
export const sendReminderEmail = async () => {
	const invoices = await InvoiceModel.find({ status: 'unpaid' })
	if (!invoices.length) return

	// send invoice reminder email with cron job with three days left
	const now = new Date()

	for (const invoice of invoices) {
		const due_date = new Date(invoice.due_date)
		const diff = due_date.getTime() - now.getTime()
		const days = Math.ceil(diff / (1000 * 60 * 60 * 24))

		if (days <= 3) {
			console.log('Sending invoice reminder email....')
			await sendMail({
				to: invoice.client,
				subject: `Reminder: Invoice for ${invoice.project_name}`,
				// Might change to `html` later
				// and also attach the invoice and include payment link
				text: `Hello, ${invoice.client}! This is a reminder that your invoice with ${invoice.invoice_number} for ${invoice.project_name} with total amount of ${calculate.total(invoice)} is due in ${days} days. Please pay it as soon as possible. Thank you!`,
			})
		}
	}
}
