import type { NextFunction, Request, Response } from 'express'
import { ApiError } from '../../exceptions/api-error'
import { HttpStatusCode } from '../../types'
import { INVOICE_STATUS } from '../../utils/constant'
import { calculate } from '../../utils/money'
import { findClientById } from '../client/client.service'
import type {
	CreateInvoiceInput,
	GetAllInvoicesInput,
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
	totalInvoice,
} from './invoice.service'

export const getAllInvoiceHandler = async (
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

		const data = await getAllInvoice({ skip, limit, status })
		const invoices = data.map(invoice => ({
			...invoice.toJSON(),
			total: calculate.total(invoice),
			subtotal: calculate.subtotal(invoice),
		}))
		const total = await totalInvoice()

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

		const clientExists = await findClientById(client)
		if (!clientExists) {
			throw new ApiError('Client not found!', HttpStatusCode.NOT_FOUND)
		}

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

		const invoiceExists = await findInvoiceById(id)
		if (!invoiceExists) {
			throw new ApiError('Invoice not found!', HttpStatusCode.NOT_FOUND)
		}

		const invoice = await findAndUpdateInvoice(
			{ _id: id },
			{ ...req.body },
			{ new: true }
		)

		// @ts-expect-error
		const subtotal = calculate.subtotal(invoice)
		// @ts-expect-error
		const total = calculate.total(invoice)

		return res.status(HttpStatusCode.OK).json({
			success: true,
			message: 'Invoice updated successfully!',
			data: {
				...invoice?.toJSON(),
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

		const invoiceExists = await findInvoiceById(id)
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
			message: 'Invoice status updated successfully!',
			// data: invoice,
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

		const invoiceExists = await findInvoiceById(id)
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
			{ populate: { path: 'client', select: 'name email' } }
		)

		// @ts-expect-error
		const subtotal = calculate.subtotal(invoice)
		// @ts-expect-error
		const total = calculate.total(invoice)

		return res.status(HttpStatusCode.OK).json({
			success: true,
			message: 'Invoice fetched successfully!',
			data: {
				...invoice?.toJSON(),
				subtotal,
				total,
			},
		})
	} catch (error) {
		next(error)
	}
}

export const invoicePaymentHandler = () => {}

export const sendInvoiceViaMailHandler = () => {}
