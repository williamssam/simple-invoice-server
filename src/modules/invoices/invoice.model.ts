import mongoose from 'mongoose'
import { INVOICE_STATUS } from '../../utils/constant'
import type { ClientDocument } from '../clients/clients.model'

export interface InvoiceDocument extends mongoose.Document {
	id: string
	recipient: ClientDocument['id']
	invoice_number: string
	project_name: string
	status: (typeof INVOICE_STATUS)[number]
	items: {
		description: string
		quantity: number
		price: number
	}[]
	tax: number
	items_total: number
	total_amount: number
	issued_date: Date
	due_date: Date
	updated_at: Date
	created_at: Date
}

const invoiceSchema = new mongoose.Schema(
	{
		// TODO: recipient can be on the client list or a new client
		recipient: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Client',
			required: true,
		},
		invoice_number: {
			type: String,
			required: true,
		},
		project_name: {
			type: String,
			required: true,
		},
		status: {
			type: String,
			enum: INVOICE_STATUS,
			default: 'draft',
		},
		items: [
			{
				description: {
					type: String,
					required: true,
				},
				quantity: {
					type: Number,
					required: true,
				},
				price: {
					type: Number,
					required: true,
				},
			},
		],
		tax: {
			type: Number,
			required: true,
			default: 0,
		},
		items_total: {
			type: Number,
			required: true,
		},
		total_amount: {
			type: Number,
			required: true,
		},
		issued_date: {
			type: Date,
			required: true,
			default: Date.now,
		},
		due_date: {
			type: Date,
			required: true,
		},
	},
	{
		timestamps: {
			createdAt: 'created_at',
			updatedAt: 'updated_at',
		},
	}
)

const InvoiceModel = mongoose.model<InvoiceDocument>('Invoice', invoiceSchema)

export default InvoiceModel