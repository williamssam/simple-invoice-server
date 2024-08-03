import type { NextFunction, Request, Response } from 'express'
import { ApiError } from '../../exceptions/api-error'
import { HttpStatusCode } from '../../types'
import { INVOICE_STATUS } from '../../utils/constant'
import { sendMail } from '../../utils/mailer'
import { calculate } from '../../utils/money'
import { findClient } from '../client/client.service'
import { countInvoice } from '../report/report.service'
import type {
	CreateInvoiceInput,
	GetAllInvoicesInput,
	GetInvoiceInput,
	UpdateInvoiceInput,
	UpdateInvoiceStatusInput,
} from './invoice.schema'
import {
	createInvoice,
	deleteInvoice,
	findAndUpdateInvoice,
	findInvoice,
	findInvoiceById,
	getAllInvoice,
} from './invoice.service'

export const getAllInvoiceHandler = async (
	req: Request<unknown, unknown, unknown, GetAllInvoicesInput>,
	res: Response,
	next: NextFunction
) => {
	try {
		const { page: requestedPage, status: requestedStatus } = req.query
		const user_id = res.locals.user._id

		const page = Number(requestedPage) || 1
		const status = requestedStatus ?? 'all'
		const limit = 15
		const skip = (page - 1) * limit

		const data = await getAllInvoice({ skip, limit, status, user_id })
		const total = await countInvoice({}, user_id)

		const invoices = data.map(invoice => ({
			...invoice.toJSON(),
			total: calculate.total(invoice),
			subtotal: calculate.subtotal(invoice),
		}))

		return res.status(HttpStatusCode.OK).json({
			success: true,
			message: 'Invoices fetched successfully!',
			data: invoices,
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
		const { invoice_number, client } = req.body
		const user_id = res.locals.user._id

		const clientExists = await findClient({
			$and: [{ user_id }, { _id: client }],
		})
		if (!clientExists) {
			throw new ApiError('Client not found!', HttpStatusCode.NOT_FOUND)
		}

		const invoiceWithSameNumberExists = await findInvoice({
			$and: [{ user_id }, { invoice_number }],
		})
		if (invoiceWithSameNumberExists) {
			throw new ApiError(
				'Invoice with same number already exists!',
				HttpStatusCode.BAD_REQUEST
			)
		}

		const invoice = await createInvoice({
			...req.body,
			user_id,
		})

		invoice.$set({
			status: 'draft',
		})

		const subtotal = calculate.subtotal(invoice)
		const total = calculate.total(invoice)

		return res.status(HttpStatusCode.CREATED).json({
			success: true,
			message: 'Invoice created successfully!',
			data: {
				...invoice.toJSON(),
				subtotal,
				total,
			},
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

		const invoice = await findInvoiceById(id)
		if (!invoice) {
			throw new ApiError('Invoice not found!', HttpStatusCode.NOT_FOUND)
		}

		const user_id = res.locals.user._id
		if (invoice.user_id !== user_id) {
			throw new ApiError(
				'You are not authorized to update this invoice!',
				HttpStatusCode.UNAUTHORIZED
			)
		}

		const updatedInvoice = await findAndUpdateInvoice(
			{ _id: id },
			{ ...req.body },
			{ new: true }
		)

		// @ts-expect-error
		const subtotal = calculate.subtotal(updatedInvoice)
		// @ts-expect-error
		const total = calculate.total(updatedInvoice)

		return res.status(HttpStatusCode.OK).json({
			success: true,
			message: 'Invoice updated successfully!',
			data: {
				...updatedInvoice?.toJSON(),
				subtotal,
				total,
			},
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

		const invoice = await findInvoiceById(id)
		if (!invoice) {
			throw new ApiError('Invoice not found!', HttpStatusCode.NOT_FOUND)
		}

		const user_id = res.locals.user._id
		if (invoice.user_id !== user_id) {
			throw new ApiError(
				'You are not authorized to update this invoice!',
				HttpStatusCode.UNAUTHORIZED
			)
		}

		if (!INVOICE_STATUS.includes(status)) {
			throw new ApiError(
				`Invalid status! Allowed status include: ${INVOICE_STATUS.join(', ')}`,
				HttpStatusCode.BAD_REQUEST
			)
		}

		const updatedInvoice = await findAndUpdateInvoice(
			{ _id: id },
			{ status },
			{ new: true }
		)

		// @ts-expect-error
		const subtotal = calculate.subtotal(updatedInvoice)
		// @ts-expect-error
		const total = calculate.total(updatedInvoice)

		return res.status(HttpStatusCode.OK).json({
			success: true,
			message: 'Invoice status updated successfully!',
			data: {
				...updatedInvoice?.toJSON(),
				subtotal,
				total,
			},
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

		const invoice = await findInvoiceById(id)
		if (!invoice) {
			throw new ApiError('Invoice not found!', HttpStatusCode.NOT_FOUND)
		}

		const user_id = res.locals.user._id
		if (invoice.user_id !== user_id) {
			throw new ApiError(
				'You are not authorized to delete this invoice!',
				HttpStatusCode.UNAUTHORIZED
			)
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

		const invoice = await findInvoiceById(id)
		if (!invoice) {
			throw new ApiError('Invoice not found!', HttpStatusCode.NOT_FOUND)
		}

		const user_id = res.locals.user._id
		if (invoice.user_id !== user_id) {
			throw new ApiError(
				'You are not authorized to get this invoice!',
				HttpStatusCode.UNAUTHORIZED
			)
		}

		const invoiceExists = await findInvoice(
			{ _id: id },
			{ populate: { path: 'client', select: 'name email' } }
		)

		// @ts-expect-error
		const subtotal = calculate.subtotal(invoiceExists)
		// @ts-expect-error
		const total = calculate.total(invoiceExists)

		return res.status(HttpStatusCode.OK).json({
			success: true,
			message: 'Invoice fetched successfully!',
			data: {
				...invoiceExists?.toJSON(),
				subtotal,
				total,
			},
		})
	} catch (error) {
		next(error)
	}
}

// TODO: this should automagically generate payment link based on invoice
export const generatePaymentLinkHandler = () => {}
export const invoicePaymentHandler = () => {}

export const sendInvoiceViaMailHandler = async (
	req: Request<GetInvoiceInput>,
	res: Response,
	next: NextFunction
) => {
	try {
		const { id } = req.params

		const invoice = await findInvoiceById(id)
		if (!invoice) {
			throw new ApiError('Invoice not found!', HttpStatusCode.NOT_FOUND)
		}

		const user_id = res.locals.user._id
		if (invoice.user_id !== user_id) {
			throw new ApiError('You are not authorized!', HttpStatusCode.UNAUTHORIZED)
		}

		// send mail
		await sendMail({
			to: invoice.client,
			subject: `Invoice for ${invoice.project_name}`,
		})

		return res.status(HttpStatusCode.OK).json({
			success: true,
			message: 'Invoice sent successfully!',
		})
	} catch (error) {
		next(error)
	}
}

export const sendInvoiceReminderMailHandler = async (
	req: Request<GetInvoiceInput>,
	res: Response,
	next: NextFunction
) => {
	try {
		const { id } = req.params

		const invoice = await findInvoiceById(id)
		if (!invoice) {
			throw new ApiError('Invoice not found!', HttpStatusCode.NOT_FOUND)
		}

		const user_id = res.locals.user._id
		if (invoice.user_id !== user_id) {
			throw new ApiError('You are not authorized!', HttpStatusCode.UNAUTHORIZED)
		}

		// send mail
		await sendMail({
			to: invoice.client,
			subject: `Reminder: Invoice for ${invoice.project_name}`,
		})

		return res.status(HttpStatusCode.OK).json({
			success: true,
			message: 'Invoice reminder sent successfully!',
		})
	} catch (error) {
		next(error)
	}
}
