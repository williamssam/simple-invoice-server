import type { NextFunction, Request, Response } from 'express'
import { ApiError } from '../../exceptions/api-error'
import { HttpStatusCode } from '../../types'
import type {
	CreateClientInput,
	DeleteClientInput,
	GetClientInput,
	UpdateClientInput,
} from './client.schema'
import {
	createClient,
	deleteClient,
	findAndUpdateClient,
	findClient,
	findClientById,
	getAllClients,
	totalClient,
} from './clients.service'

export const createClientHandler = async (
	req: Request<unknown, unknown, CreateClientInput>,
	res: Response,
	next: NextFunction
) => {
	try {
		const { email, phone } = req.body

		// TODO: check to see if this check for both email and phone
		const clientWithEmailExists = await findClient({ email })
		if (clientWithEmailExists) {
			throw new ApiError(
				'Client with email already exists!',
				HttpStatusCode.BAD_REQUEST
			)
		}

		const clientWithPhoneExists = await findClient({ phone })
		if (clientWithPhoneExists) {
			throw new ApiError(
				'Client with phone already exists!',
				HttpStatusCode.BAD_REQUEST
			)
		}


		const client = await createClient(req.body)

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

		const clientExists = await findClientById(id)
		if (!clientExists) {
			throw new ApiError('Client not found!', HttpStatusCode.NOT_FOUND)
		}

		const client = await findAndUpdateClient(
			{ _id: id },
			{ ...req.body },
			{ new: true }
		)
		return res.status(HttpStatusCode.OK).json({
			success: true,
			message: 'Client updated successfully',
			data: client,
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

		const clientExists = await findClientById(id)
		if (!clientExists) {
			throw new ApiError('Client not found!', HttpStatusCode.NOT_FOUND)
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
		const client = await findClientById(id)

		if (!client) {
			throw new ApiError('Client not found!', HttpStatusCode.NOT_FOUND)
		}

		// TODO: remove "invoices" from the response

		return res.status(HttpStatusCode.OK).json({
			success: true,
			message: 'Client fetched successfully',
			data: client,
		})
	} catch (error) {
		next(error)
	}
}

export const getAllClientsHandler = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		// const clients = await findClient({})
		const page = Number(req.params.page as string) || 1

		const limit = 15
		const skip = (page - 1) * limit

		const clients = await getAllClients({ skip, limit })
		const total = await totalClient()

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

export const getClientInvoicesHandler = () => {}