import type { NextFunction, Request, Response } from 'express'
import { ApiError } from '../../exceptions/api-error'
import { HttpStatusCode } from '../../types'
import { page_limit } from '../../utils/constant'
import { calculate } from '../../utils/money'
import { findUserById } from '../auth/user.service'
import type {
	CreateClientInput,
	DeleteClientInput,
	GetAllClientsInput,
	GetClientInput,
	GetClientInvoicesInput,
	UpdateClientInput,
} from './client.schema'
import {
	createClient,
	deleteClient,
	findAndUpdateClient,
	findClient,
	findClientById,
	getAllClientInvoice,
	getAllClients,
	totalClientInvoice,
} from './client.service'

export const createClientHandler = async (
	req: Request<unknown, unknown, CreateClientInput>,
	res: Response,
	next: NextFunction
) => {
	try {
		const id = res.locals.user._id
		const { email, phone } = req.body

		// TODO: check to see if client with email or phone already exists with the current logged in user
		const user = await findUserById(id)
		if (!user) {
			throw new ApiError('User not found!', HttpStatusCode.NOT_FOUND)
		}


		const clientWithEmailExists = await findClient({ email })
		if (clientWithEmailExists) {
			throw new ApiError(
				'Client with email already exists!',
				HttpStatusCode.BAD_REQUEST
			)
		}

		const clientWithPhoneExists = await findClient({ phone, user_id: id })
		if (clientWithPhoneExists) {
			throw new ApiError(
				'Client with phone already exists!',
				HttpStatusCode.BAD_REQUEST
			)
		}

		const client = await createClient({
			...req.body,
			user_id: id,
		})

		await client.save()

		return res.status(HttpStatusCode.CREATED).json({
			success: true,
			message: 'Client created successfully!',
			data: client,
		})
	} catch (error) {
		next(error)
	}
}

export const updateClientHandler = async (
	req: Request<UpdateClientInput['params'], unknown, UpdateClientInput['body']>,
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

		const user = await findUserById(user_id)
		if (!user) {
			throw new ApiError(
				'No active session, please login',
				HttpStatusCode.NOT_FOUND
			)
		}

		if (user._id !== client.user_id) {
			throw new ApiError(
				'You are not authorized to update this client!',
				HttpStatusCode.UNAUTHORIZED
			)
		}

		const updatedClient = await findAndUpdateClient(
			{ _id: id },
			{ ...req.body },
			{ new: true }
		)
		return res.status(HttpStatusCode.OK).json({
			success: true,
			message: 'Client updated successfully',
			data: updatedClient,
		})
	} catch (error) {
		next(error)
	}
}

export const deleteClientHandler = async (
	req: Request<DeleteClientInput>,
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

		const user = await findUserById(user_id)
		if (!user) {
			throw new ApiError(
				'No active session, please login',
				HttpStatusCode.NOT_FOUND
			)
		}

		if (user._id !== client.user_id) {
			throw new ApiError(
				'You are not authorized to delete this client!',
				HttpStatusCode.UNAUTHORIZED
			)
		}

		await deleteClient({ _id: id })
		return res.status(HttpStatusCode.OK).json({
			success: true,
			message: 'Client deleted successfully',
		})
	} catch (error) {
		next(error)
	}
}

export const getClientHandler = async (
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

		const user = await findUserById(user_id)
		if (!user) {
			throw new ApiError(
				'No active session, please login',
				HttpStatusCode.NOT_FOUND
			)
		}

		if (user._id !== client.user_id) {
			throw new ApiError(
				'You are not authorized to view this client!',
				HttpStatusCode.UNAUTHORIZED
			)
		}

		const clients = await findClient(
			{ _id: id },
			{ invoices: 0 },
			{ new: true }
		)

		// TODO: remove "invoices" from the response

		return res.status(HttpStatusCode.OK).json({
			success: true,
			message: 'Client fetched successfully',
			data: clients,
		})
	} catch (error) {
		next(error)
	}
}

export const getAllClientsHandler = async (
	req: Request<unknown, unknown, unknown, GetAllClientsInput>,
	res: Response,
	next: NextFunction
) => {
	try {
		const user_id = res.locals.user._id
		const { page: requestedPage, search } = req.query

		const user = await findUserById(user_id)
		if (!user) {
			throw new ApiError(
				'No active session, please login',
				HttpStatusCode.NOT_FOUND
			)
		}

		const page = Number(requestedPage) || 1
		const limit = page_limit
		const skip = (page - 1) * limit

		const data = getAllClients({ skip, search, id: user_id })
		const clients = await data
		const total = await data.countDocuments()

		return res.status(HttpStatusCode.OK).json({
			success: true,
			message: 'Clients fetched successfully!',
			data: clients,
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

export const getClientInvoicesHandler = async (
	req: Request<
		GetClientInvoicesInput['params'],
		unknown,
		unknown,
		GetClientInvoicesInput['query']
	>,
	res: Response,
	next: NextFunction
) => {
	try {
		const { id } = req.params
		const { page: requestedPage, status: requestedStatus } = req.query

		const client = await findClientById(id)
		if (!client) {
			throw new ApiError('Client not found!', HttpStatusCode.NOT_FOUND)
		}

		const page = Number(requestedPage) || 1
		const status = requestedStatus ?? 'all'
		const limit = 15
		const skip = (page - 1) * limit
		const total = await totalClientInvoice(id)

		const data = await getAllClientInvoice({
			id,
			skip,
			status,
		})
		const client_invoices = data.map(invoice => ({
			...invoice.toJSON(),
			total: calculate.total(invoice),
			subtotal: calculate.subtotal(invoice),
		}))

		return res.status(HttpStatusCode.OK).json({
			success: true,
			message: 'Client invoices fetched successfully!',
			data: client_invoices,
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
