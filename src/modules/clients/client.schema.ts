import { isObjectIdOrHexString } from 'mongoose'
import { z } from 'zod'

const payload = {
	body: z.object({
		name: z
			.string({
				required_error: 'Client name is required',
			})
			.trim(),
		email: z
			.string({
				required_error: 'Client email is required',
			})
			.email('Invalid email address')
			.trim(),
		phone: z
			.string({
				required_error: 'Client phone is required',
			})
			.trim(),
		address: z
			.string({
				required_error: 'Client address is required',
			})
			.trim(),
	}),
}

const params = {
	params: z.object({
		id: z
			.string({
				required_error: 'Client ID is required',
			})
			.trim()
			.refine(val => isObjectIdOrHexString(val), {
				message: 'Invalid Client ID',
			}),
	}),
}

//
const createClientSchema = z.object({ ...payload })
const updateClientSchema = z.object({ ...payload, ...params })
const deleteClientSchema = z.object({ ...params })
const getClientSchema = z.object({ ...params })
const getAllClientsSchema = z.object({
	params: z.object({
		page: z
			.string({
				required_error: 'Page is required',
			})
			.catch('1'),
	}),
})

// TYPES
type CreateClientInput = z.infer<typeof createClientSchema>['body']
type UpdateClientInput = z.infer<typeof updateClientSchema>
type DeleteClientInput = z.infer<typeof deleteClientSchema>['params']
type GetClientInput = z.infer<typeof getClientSchema>['params']
type GetAllClientsInput = z.infer<typeof getAllClientsSchema>

export {
	createClientSchema,
	deleteClientSchema,
	getAllClientsSchema,
	getClientSchema,
	updateClientSchema,
	type CreateClientInput,
	type DeleteClientInput,
	type GetAllClientsInput,
	type GetClientInput,
	type UpdateClientInput,
}

