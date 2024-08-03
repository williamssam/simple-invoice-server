import type { FilterQuery, QueryOptions, UpdateQuery } from 'mongoose'
import type { INVOICE_STATUS } from '../../utils/constant'
import InvoiceModel, { type InvoiceDocument } from './invoice.model'

type InvoiceInput = Pick<
	InvoiceDocument,
	| 'client'
	| 'invoice_number'
	| 'project_name'
	| 'issued_date'
	| 'due_date'
	| 'items'
	| 'user_id'
>

export const createInvoice = (input: InvoiceInput) => {
	return InvoiceModel.create(input)
}

export const findInvoiceById = (id: string) => {
	return InvoiceModel.findById(id)
}

export const findInvoice = (
	query: FilterQuery<InvoiceDocument>,
	options: QueryOptions = { lean: true }
) => {
	return InvoiceModel.findOne(query, {}, options)
}

export const findAndUpdateInvoice = (
	query: FilterQuery<InvoiceDocument>,
	update: UpdateQuery<InvoiceDocument>,
	options: QueryOptions = { lean: true }
) => {
	return InvoiceModel.findOneAndUpdate(query, update, options)
}

export const deleteInvoice = (query: FilterQuery<InvoiceDocument>) => {
	return InvoiceModel.deleteOne(query)
}

type GetAllInvoiceParam = {
	limit: number
	skip: number
	status: (typeof INVOICE_STATUS)[number]
	user_id: string
}

export const getAllInvoice = ({
	skip,
	limit,
	status,
	user_id,
}: GetAllInvoiceParam) => {
	let filter = { user_id: user_id }

	if (status !== 'all') {
		filter = {
			...filter,
			// @ts-expect-error
			status: { $eq: status },
		}
	}

	// should be able search
	return InvoiceModel.find(filter)
		.limit(limit)
		.skip(skip)
		.sort({ created_at: -1 })
		.populate('client', 'name email')
	// .select('client invoice_number issued_date due_date status')
}

export const findInvoiceMetric = (date: Date) => {
	return InvoiceModel.aggregate([
		{
			$match: {
				created_at: date,
			},
		},
	])
}

export const totalInvoice = () => {
	return InvoiceModel.estimatedDocumentCount()
}