import type { FilterQuery, QueryOptions, UpdateQuery } from 'mongoose'
import type { INVOICE_STATUS } from '../../utils/constant'
import InvoiceModel, { type InvoiceDocument } from './invoice.model'

type InvoiceInput = Pick<
	InvoiceDocument,
	| 'recipient'
	| 'invoice_number'
	| 'project_name'
	| 'issued_date'
	| 'due_date'
	| 'items'
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

type getAllInvoiceParams = {
	limit: number
	skip: number
	status: (typeof INVOICE_STATUS)[number]
}

export const getAllInvoice = ({ skip, limit, status }: getAllInvoiceParams) => {
	let filter = {}

	if (status !== 'all') {
		filter = { status: { $eq: status } }
	}

	// should be able search
	return (
		InvoiceModel.find(filter)
			.limit(limit)
			.skip(skip)
			// might be able to sort by asc/desc order
			.sort({ created_at: -1 })
			.populate('recipient', 'name email phone address')
			.setOptions({ sanitizeFilter: true })
	)
}

export const totalInvoice = () => {
	return InvoiceModel.estimatedDocumentCount()
}

export const countInvoice = (query: FilterQuery<InvoiceDocument>) => {
	return InvoiceModel.countDocuments(query)
}
