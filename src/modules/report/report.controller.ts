import type { NextFunction, Request, Response } from 'express'
import { HttpStatusCode } from '../../types'
import { totalInvoice } from '../invoice/invoice.service'
import type { MonthlyInvoiceReportInput } from './report.schema'
import { countInvoice, countInvoiceByMonth } from './report.service'

export const getInvoiceMetricHandler = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	const total = await totalInvoice()
	const total_draft = await countInvoice({ status: 'draft' })
	const total_overdue = await countInvoice({ status: 'overdue' })
	const total_paid = await countInvoice({ status: 'paid' })
	const total_cancelled = await countInvoice({ status: 'cancelled' })
	const total_unpaid = await countInvoice({ status: 'unpaid' })

	// might add total $status amount

	// add total amount received
	// add total sent

	return res.status(HttpStatusCode.OK).json({
		success: true,
		message: 'Invoice report fetched successfully!',
		data: {
			total_invoice: total,
			total_draft,
			total_overdue,
			total_paid,
			total_cancelled,
			total_unpaid,
		},
	})
}

export const getInvoiceMonthlyReportHandler = async (
	req: Request<MonthlyInvoiceReportInput>,
	res: Response,
	next: NextFunction
) => {
	try {
		const { start_date, end_date } = req.params
		const data = await countInvoiceByMonth(req.params)

		// console.log('Welcome to the monthly report controller!')

		return res.status(HttpStatusCode.OK).json({
			success: true,
			message: 'Invoice monthly report fetched successfully!',
			data,
		})
	} catch (error) {
		next(error)
	}
}