import type { NextFunction, Request, Response } from 'express'
import { ApiError } from '../../exceptions/api-error'
import { HttpStatusCode } from '../../types'
import { INVOICE_STATUS } from '../../utils/constant'
import type {
	CreateInvoiceInput,
	GetAllInvoicesInput,
	UpdateInvoiceInput,
	UpdateInvoiceStatusInput,
} from './invoice.schema'
import {
	countInvoice,
	createInvoice,
	deleteInvoice,
	findAndUpdateInvoice,
	findInvoice,
	findInvoiceById,
	getAllInvoice,
	totalInvoice,
} from './invoice.service'

export const getAllInvoicesHandler = async (
	req: Request<unknown, unknown, unknown, GetAllInvoicesInput>,
	res: Response,
	next: NextFunction
) => {
	try {
		const { page: requestedPage, status: requestedStatus } = req.query
		const page = Number(requestedPage) || 1
		const status = requestedStatus ?? 'all'

		const limit = 15
		const skip = (page - 1) * limit

		const invoices = await getAllInvoice({ skip, limit, status })
		const total = await totalInvoice()

		return res.status(HttpStatusCode.OK).json({
			success: true,
			message: 'Invoices fetched successfully!',
			data: invoices,
			params: { status },
			meta: {
				total,
				current_page: page,
				per_page: limit,
				total_pages: Math.ceil(total / limit) || 1,
				has_next_page: page < Math.ceil(total / limit),
				has_prev_page: page > 1,
				next_page: page + 1,
				prev_page: page - 1 || 1,
			},
		})
	} catch (error) {
		next(error)
	}
}

export const createInvoiceHandler = async (
	req: Request<unknown, unknown, CreateInvoiceInput>,
	res: Response,
	next: NextFunction
) => {
	try {
		const { invoice_number } = req.body

		const invoiceWithSameNumberExists = await findInvoice({ invoice_number })
		if (invoiceWithSameNumberExists) {
			throw new ApiError(
				'Invoice with same number already exists!',
				HttpStatusCode.BAD_REQUEST
			)
		}

		const invoice = await createInvoice(req.body)

		invoice.$set({
			status: 'draft',
		})

		// send email

		return res.status(HttpStatusCode.CREATED).json({
			success: true,
			message: 'Invoice created successfully!',
			data: invoice,
		})
	} catch (error) {
		next(error)
	}
}

export const updateInvoiceHandler = async (
	req: Request<
		UpdateInvoiceInput['params'],
		unknown,
		UpdateInvoiceInput['body']
	>,
	res: Response,
	next: NextFunction
) => {
	try {
		const { id } = req.params
		const invoiceExists = await findInvoice({ _id: id })

		if (!invoiceExists) {
			throw new ApiError('Invoice not found!', HttpStatusCode.NOT_FOUND)
		}

		const invoice = await findAndUpdateInvoice(
			{ _id: id },
			{ ...req.body },
			{ new: true }
		)

		return res.status(HttpStatusCode.OK).json({
			success: true,
			message: 'Invoice updated successfully!',
			data: invoice,
		})
	} catch (error) {
		next(error)
	}
}

export const updateInvoiceStatusHandler = async (
	req: Request<UpdateInvoiceStatusInput>,
	res: Response,
	next: NextFunction
) => {
	try {
		const { id, status } = req.params

		const invoiceExists = await findInvoice({ _id: id })
		if (!invoiceExists) {
			throw new ApiError('Invoice not found!', HttpStatusCode.NOT_FOUND)
		}

		if (!INVOICE_STATUS.includes(status)) {
			throw new ApiError(
				`Invalid status! Allowed status is: ${INVOICE_STATUS.join(', ')}`,
				HttpStatusCode.BAD_REQUEST
			)
		}

		const invoice = await findAndUpdateInvoice(
			{ _id: id },
			{ status },
			{ new: true }
		)

		return res.status(HttpStatusCode.OK).json({
			success: true,
			message: 'Invoice updated successfully!',
			data: invoice,
		})
	} catch (error) {
		next(error)
	}
}

export const deleteInvoiceHandler = async (
	req: Request<UpdateInvoiceInput['params']>,
	res: Response,
	next: NextFunction
) => {
	try {
		const { id } = req.params
		const invoiceExists = await findInvoice({ _id: id })

		if (!invoiceExists) {
			throw new ApiError('Invoice not found!', HttpStatusCode.NOT_FOUND)
		}

		await deleteInvoice({ _id: id })
		return res.status(HttpStatusCode.OK).json({
			success: true,
			message: 'Invoice deleted successfully!',
		})
	} catch (error) {
		next(error)
	}
}

export const getInvoiceHandler = async (
	req: Request<UpdateInvoiceInput['params']>,
	res: Response,
	next: NextFunction
) => {
	try {
		const { id } = req.params
		const invoiceExists = await findInvoiceById(id)

		if (!invoiceExists) {
			throw new ApiError('Invoice not found!', HttpStatusCode.NOT_FOUND)
		}

		const invoice = await findInvoice(
			{ _id: id },
			{ populate: { path: 'recipient', select: 'name email phone address' } }
		)

		return res.status(HttpStatusCode.OK).json({
			success: true,
			message: 'Invoice fetched successfully!',
			data: invoice,
		})
	} catch (error) {
		next(error)
	}
}

// TODO: might add this to another controller
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

	// add total amount received
	// add total sent

	return res.status(HttpStatusCode.OK).json({
		success: true,
		message: 'Invoice metric fetched successfully!',
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

export const monthlyInvoiceMetricHandler = async () => {}

export const invoicePaymentHandler = () => {}

export const sendInvoiceViaMailHandler = () => {}
