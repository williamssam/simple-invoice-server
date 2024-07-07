import mongoose from 'mongoose'
import type { InvoiceDocument } from '../invoices/invoice.model'

export interface ClientDocument extends mongoose.Document {
		id: string
		name: string
		email: string
		phone: string
		address: string
		invoices: InvoiceDocument['id'][]
		created_at: Date
		updated_at: Date
	}

const clientModel = new mongoose.Schema(
	{
		name: {
			type: String,
			required: true,
		},
		email: {
			type: String,
			unique: true,
			required: true,
		},
		phone: {
			type: String,
			required: true,
		},
		address: {
			type: String,
			required: true,
		},
		invoices: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: 'Invoice',
			},
		],
	},
	{
		timestamps: {
			createdAt: 'created_at',
			updatedAt: 'updated_at',
		},
	}
)

const ClientModel = mongoose.model('Client', clientModel)

export default ClientModel
