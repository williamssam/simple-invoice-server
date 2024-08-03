import mongoose from 'mongoose'
import type { UserDocument } from '../auth/user.model'
import type { InvoiceDocument } from '../invoice/invoice.model'

export interface ClientDocument extends mongoose.Document {
		id: string
		name: string
		email: string
		phone: string
		invoices: InvoiceDocument['id'][]
		user_id: UserDocument['id']
		created_at: Date
		updated_at: Date
	}

const clientModel = new mongoose.Schema(
	{
		name: {
			type: String,
			required: true,
		},
		user_id: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
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
		toJSON: {
			virtuals: true,
			transform(doc, ret) {
				ret.invoices = undefined
				ret.user_id = undefined
				ret._id = undefined

				return ret
			},
		},
	}
)
// You can only search by name or email. I might add "phone" later
clientModel.index({ email: 'text', name: 'text' })

const ClientModel = mongoose.model('Client', clientModel)

export default ClientModel
