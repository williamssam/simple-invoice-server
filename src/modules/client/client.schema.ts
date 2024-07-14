import { isObjectIdOrHexString } from 'mongoose'
import { z } from 'zod'
import { INVOICE_STATUS } from '../../utils/constant'

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
			.min(11, 'Phone number should be 11 digits long')
			.max(11, 'Phone number should not be 11 digits long')
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

const query = {
	query: z.object({
		page: z
			.string({
				required_error: 'Page is required',
			})
			.catch('1'),
		status: z.enum(INVOICE_STATUS).catch('all'),
		// issued_date: z
		// 	.date({
		// 		required_error: 'Issued date is required',
		// 	}).nullable().catch(null),
		// due_date: z
		// 	.string({
		// 		required_error: 'Due date is required',
		// 	}).nullable().catch(null),
		// search: z.string().catch(''),
	}),
}

//
const createClientSchema = z.object({ ...payload })
const updateClientSchema = z.object({ ...payload, ...params })
const deleteClientSchema = z.object({ ...params })
const getClientSchema = z.object({ ...params })
const getAllClientsSchema = z.object({
	query: z.object({
		page: z.string().catch('1'),
		search: z.string().catch(''),
	}),
})
const getClientInvoicesSchema = z.object({
	...params,
	...query,
})

// TYPES
type CreateClientInput = z.infer<typeof createClientSchema>['body']
type UpdateClientInput = z.infer<typeof updateClientSchema>
type DeleteClientInput = z.infer<typeof deleteClientSchema>['params']
type GetClientInput = z.infer<typeof getClientSchema>['params']
type GetAllClientsInput = z.infer<typeof getAllClientsSchema>['query']
type GetClientInvoicesInput = z.infer<typeof getClientInvoicesSchema>

export {
	createClientSchema,
	deleteClientSchema,
	getAllClientsSchema,
	getClientInvoicesSchema,
	getClientSchema,
	updateClientSchema,
	type CreateClientInput,
	type DeleteClientInput,
	type GetAllClientsInput,
	type GetClientInput,
	type GetClientInvoicesInput,
	type UpdateClientInput,
}

