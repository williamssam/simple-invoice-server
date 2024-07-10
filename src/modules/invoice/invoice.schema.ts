import { isObjectIdOrHexString } from 'mongoose'
import { z } from 'zod'
import { INVOICE_STATUS } from '../../utils/constant'

const payload = {
	body: z.object({
		client: z
			.string({
				required_error: 'Client ID is required',
			})
			.trim()
			.refine(val => isObjectIdOrHexString(val), {
				message: 'Invalid Client ID',
			}),
		invoice_number: z
			.string({
				required_error: 'Invoice number is required',
			})
			.trim(),
		project_name: z
			.string({
				required_error: 'Project name is required',
			})
			.trim(),
		items: z.array(
			z.object({
				description: z
					.string({
						required_error: 'Description is required',
					})
					.trim(),
				quantity: z
					.number({
						required_error: 'Quantity is required',
					})
					.nonnegative(),
				price: z
					.number({
						required_error: 'Price is required',
					})
					.nonnegative(),
			})
		),
		tax: z
			.number({
				required_error: 'Tax is required',
			})
			.nonnegative(),
		currency: z
			.string({
				required_error: 'Currency is required',
			})
			.catch('NGN'),
		issued_date: z.coerce.date({
			required_error: 'Issued date is required',
		}),
		due_date: z.coerce.date({
			required_error: 'Due date is required',
		}),
	}),
}

const params = {
	params: z.object({
		id: z
			.string({
				required_error: 'Invoice ID is required',
			})
			.trim()
			.refine(val => isObjectIdOrHexString(val), {
				message: 'Invalid Invoice ID',
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
const createInvoiceSchema = z.object({ ...payload })
const updateInvoiceSchema = z.object({ ...payload, ...params })
const deleteInvoiceSchema = z.object({ ...params })
const getInvoiceSchema = z.object({ ...params })
const getAllInvoicesSchema = z.object({ ...query })
const updateInvoiceStatusSchema = z.object({
	params: params.params.extend({
		status: z.enum(INVOICE_STATUS).catch('all'),
	}),
})
const monthlyInvoiceMetricSchema = z.object({
	params: z.object({
		date: z
			.string()
			.date('Invalid date string, date format: YYYY-MM-DD')
			.catch(new Date().toISOString()),
	}),
})

// TYPES
type CreateInvoiceInput = z.infer<typeof createInvoiceSchema>['body']
type UpdateInvoiceInput = z.infer<typeof updateInvoiceSchema>
type UpdateInvoiceStatusInput = z.infer<
	typeof updateInvoiceStatusSchema
>['params']
type DeleteInvoiceInput = z.infer<typeof deleteInvoiceSchema>['params']
type GetInvoiceInput = z.infer<typeof getInvoiceSchema>['params']
type GetAllInvoicesInput = z.infer<typeof getAllInvoicesSchema>['query']
type MonthlyInvoiceMetricInput = z.infer<
	typeof monthlyInvoiceMetricSchema
>['params']

export {
	createInvoiceSchema,
	deleteInvoiceSchema,
	getAllInvoicesSchema,
	getInvoiceSchema,
	monthlyInvoiceMetricSchema,
	updateInvoiceSchema,
	updateInvoiceStatusSchema,
	type CreateInvoiceInput,
	type DeleteInvoiceInput,
	type GetAllInvoicesInput,
	type GetInvoiceInput,
	type MonthlyInvoiceMetricInput,
	type UpdateInvoiceInput,
	type UpdateInvoiceStatusInput,
}

