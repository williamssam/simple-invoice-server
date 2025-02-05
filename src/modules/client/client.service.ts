import type {
	FilterQuery,
	ProjectionType,
	QueryOptions,
	UpdateQuery,
} from 'mongoose'
import { type INVOICE_STATUS, page_limit } from '../../utils/constant'
import InvoiceModel from '../invoice/invoice.model'
import ClientModel, { type ClientDocument } from './client.model'

type ClientInput = Pick<ClientDocument, 'name' | 'email' | 'phone' | 'user_id'>

export const createClient = (input: ClientInput) => {
	return ClientModel.create(input)
}

export const findClientById = (id: string) => {
	return ClientModel.findById(id)
}

export const findClient = (
	query: FilterQuery<ClientDocument>,
	projection: ProjectionType<ClientDocument> = {},
	options: QueryOptions = { lean: true }
) => {
	return ClientModel.findOne(query, projection, options)
}

export const findAndUpdateClient = (
	query: FilterQuery<ClientDocument>,
	update: UpdateQuery<ClientDocument>,
	options: QueryOptions = { lean: true }
) => {
	return ClientModel.findOneAndUpdate(query, update, options)
}

export const deleteClient = (query: FilterQuery<ClientDocument>) => {
	return ClientModel.deleteOne(query)
}

type GetClientsParams = {
	skip: number
	search?: string
	id: any
}
export const getAllClients = ({ skip, search, id }: GetClientsParams) => {
	let filter = {
		user_id: id,
	}

	if (search) {
		filter = {
			...filter,
			// @ts-expect-error property $text does not exist on filter
			$text: { $search: search },
		}
	}

	return ClientModel.find(filter)
		.limit(page_limit)
		.skip(skip)
		.sort({ createdAt: -1 })
		.select('-invoices')
}

export const totalClient = () => {
	return ClientModel.estimatedDocumentCount()
}

type ClientInvoiceParam = {
	skip: number
	status: (typeof INVOICE_STATUS)[number]
	client_id: string
	user_id: string
}

export const getAllClientInvoice = (params: ClientInvoiceParam) => {
	let filter = {
		$and: [{ user_id: params.user_id }, { client: params.client_id }],
	}

	if (params.status !== 'all') {
		filter = {
			...filter,
			// @ts-expect-error property $eq does not exist on filter
			status: { $eq: params.status },
		}
	}

	// should be able search
	return (
		InvoiceModel.find(filter)
			.limit(15)
			.skip(params.skip)
			// might be able to sort by asc/desc order
			.sort({ created_at: -1 })
			.populate('client', 'name email')
		// .select('client invoice_number issued_date due_date status')
	)
}

export const totalClientInvoice = (id: string) => {
	return InvoiceModel.estimatedDocumentCount({ client: id })
}
