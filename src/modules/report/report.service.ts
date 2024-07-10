import type { FilterQuery } from 'mongoose'
import type { InvoiceDocument } from '../invoice/invoice.model'
import InvoiceModel from '../invoice/invoice.model'

export const countInvoice = (query: FilterQuery<InvoiceDocument>) => {
	return InvoiceModel.countDocuments(query)
}

// // aggregate by status
// export const countInvoiceByStatus = (query: FilterQuery<InvoiceDocument>) => {
// 	return InvoiceModel.aggregate([
// 		{ $match: query },
// 		{ $group: { _id: '$status', count: { $sum: '$total' } } },
// 	])
// }

export const countClientInvoice = (query: FilterQuery<InvoiceDocument>) => {
	return InvoiceModel.countDocuments(query)
}