import mongoose from 'mongoose'

export interface ClientDocument extends mongoose.Document {
	id: string
	name: string
	email: string
	phone: string
	address: string
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
			unique: true,
			required: true,
		},
		address: {
			type: String,
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

const ClientModel = mongoose.model('Client', clientModel)

export default ClientModel