import type { FilterQuery } from 'mongoose'
import type { InvoiceDocument } from '../invoice/invoice.model'
import InvoiceModel from '../invoice/invoice.model'

export const countInvoice = (query: FilterQuery<InvoiceDocument>) => {
	return InvoiceModel.countDocuments(query)
}

// aggregate by status
export const countInvoiceByStatus = (query: FilterQuery<InvoiceDocument>) => {
	return InvoiceModel.aggregate([
		{ $match: query },
		{ $group: { _id: '$status', count: { $sum: '$total' } } },
	])
}

// aggregate by month
// export const countInvoiceByMonth = (query: FilterQuery<InvoiceDocument>) => {
// 	return InvoiceModel.aggregate([
// 		{ $match: query },
// 		{ $group: { _id: { $month: '$created_at' }, count: { $sum: '$total' } } },
// 	])
// }
type CountInvoiceByMonth = {
	start_date: string
	end_date: string
}
export const countInvoiceByMonth = ({
	end_date,
	start_date,
}: CountInvoiceByMonth) => {
	return InvoiceModel.countDocuments({
		$and: [
			{
				issued_date: {
					$gte: new Date(start_date),
					$lte: new Date(end_date),
				},
			},
			{ status: 'draft' },
		],
	})
}

export const countClientInvoice = (query: FilterQuery<InvoiceDocument>) => {
	return InvoiceModel.countDocuments(query)
}