import type { NextFunction, Request, Response } from 'express'
import { ApiError } from '../../exceptions/api-error'
import { HttpStatusCode } from '../../types'
import type { GetClientInput } from '../client/client.schema'
import { findClientById } from '../client/client.service'
import type { MonthlyInvoiceReportInput } from './report.schema'
import { countInvoice, countInvoiceByMonth } from './report.service'

export const getInvoiceMetricHandler = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {

	const user_id = res.locals.user._id

	const total = await countInvoice({}, user_id)
	const total_draft = await countInvoice({ status: 'draft' }, user_id)
	const total_overdue = await countInvoice({ status: 'overdue' }, user_id)
	const total_paid = await countInvoice({ status: 'paid' }, user_id)
	const total_cancelled = await countInvoice({ status: 'cancelled' }, user_id)
	const total_unpaid = await countInvoice({ status: 'unpaid' }, user_id)

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

export const getClientInvoiceReportHandler = async (
	req: Request<GetClientInput>,
	res: Response,
	next: NextFunction
) => {
	try {
		const { id } = req.params
		const user_id = res.locals.user._id

		const client = await findClientById(id)
		if (!client) {
			throw new ApiError('Client not found!', HttpStatusCode.NOT_FOUND)
		}

		const total = await countInvoice({ client: id }, user_id)
		const total_draft = await countInvoice(
			{ status: 'draft', client: id },
			user_id
		)
		const total_overdue = await countInvoice(
			{ status: 'overdue', client: id },
			user_id
		)
		const total_paid = await countInvoice(
			{ status: 'paid', client: id },
			user_id
		)
		const total_unpaid = await countInvoice(
			{ status: 'unpaid', client: id },
			user_id
		)
		const total_cancelled = await countInvoice(
			{ status: 'cancelled', client: id },
			user_id
		)

		return res.status(HttpStatusCode.OK).json({
			success: true,
			message: 'Client invoice report fetched successfully!',
			data: {
				total,
				total_draft,
				total_cancelled,
				total_overdue,
				total_paid,
				total_unpaid,
			},
		})
	} catch (error) {
		next(error)
	}
}