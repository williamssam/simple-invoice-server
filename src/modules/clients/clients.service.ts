import type { FilterQuery, QueryOptions, UpdateQuery } from 'mongoose'
import ClientModel, { type ClientDocument } from './clients.model'

type ClientInput = Pick<ClientDocument, 'name' | 'address' | 'email' | 'phone'>

export const createClient = (input: ClientInput) => {
	return ClientModel.create(input)
}

export const findClientById = (id: string) => {
	return ClientModel.findById(id)
}

export const findClient = (
	query: FilterQuery<ClientDocument>,
	options: QueryOptions = { lean: true }
) => {
	return ClientModel.findOne(query, {}, options)
	// .populate(
	// 	'invoices',
	// 	'id url resource_type'
	// )
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

export const getAllClients = ({
	skip,
	limit,
}: {
	skip: number
	limit: number
}) => {
	return ClientModel.find({}).limit(limit).skip(skip)
	// .populate('asset', 'id url resource_type')
}

export const totalClient = () => {
	return ClientModel.estimatedDocumentCount()
}

