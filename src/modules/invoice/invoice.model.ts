import mongoose from 'mongoose'
import { INVOICE_STATUS } from '../../utils/constant'
import { convertFromPennies, convertToPennies } from '../../utils/money'
import type { UserDocument } from '../auth/user.model'
import type { ClientDocument } from '../client/client.model'

function getCosts(value: number) {
	if (typeof value !== 'undefined') {
		// biome-ignore lint/style/useNumberNamespace: <explanation>
		return parseFloat(value.toString())
	}
	return value
}

export interface InvoiceDocument extends mongoose.Document {
		id: string
		client: ClientDocument['id']
		user_id: UserDocument['id']
		invoice_number: string
		project_name: string
		status: (typeof INVOICE_STATUS)[number]
		items: {
			description: string
			quantity: number
			price: number
		}[]
		vat: number
		currency: string
		issued_date: Date
		due_date: Date
		updated_at: Date
		created_at: Date
	}

const itemsSchema = new mongoose.Schema(
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
			get: convertFromPennies,
			set: convertToPennies,
		},
	},
	{
		toJSON: { getters: true },
		_id: false,
	}
)

// all amount are stored in Kobo (pennies) (100k = N1). Kobo is like the smallest unit of the nigerian currency.
const invoiceSchema = new mongoose.Schema(
	{
		user_id: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
		},
		// TODO: client can be on the client list or a new client
		client: {
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
		items: [itemsSchema],
		currency: {
			type: String,
			default: 'NGN',
		},
		vat: {
			type: Number,
			required: true,
			default: 0,
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
		toJSON: {
			// tell mongodb to use getters specified when converting to JSON
			getters: true,
			transform(doc, ret) {
				ret.user_id = undefined
				ret._id = undefined

				return ret
			},
		},
	}
)

const InvoiceModel = mongoose.model<InvoiceDocument>('Invoice', invoiceSchema)

export default InvoiceModel