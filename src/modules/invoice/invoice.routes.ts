import type { Router } from 'express'
import { config } from '../../config'
import { deserializeUser } from '../../middlewares/deserialize-user'
import { requireUser } from '../../middlewares/require-user'
import { validateResource } from '../../middlewares/validate-resource'
import {
	createInvoiceHandler,
	deleteInvoiceHandler,
	getAllInvoiceHandler,
	getInvoiceHandler,
	updateInvoiceHandler,
	updateInvoiceStatusHandler,
} from './invoice.controller'
import {
	createInvoiceSchema,
	deleteInvoiceSchema,
	getAllInvoicesSchema,
	getInvoiceSchema,
	updateInvoiceSchema,
	updateInvoiceStatusSchema,
} from './invoice.schema'

export default (router: Router) => {
	/**
	 * @description Get all invoices endpoint
	 */
	router.get(
		`${config.api_url_prefix}/invoices`,
		[deserializeUser, requireUser, validateResource(getAllInvoicesSchema)],
		getAllInvoiceHandler
	)

	/**
	 * @description Get one invoice endpoint
	 * @param {string} id
	 */
	router.get(
		`${config.api_url_prefix}/invoice/:id`,
		[deserializeUser, requireUser, validateResource(getInvoiceSchema)],
		getInvoiceHandler
	)

	/**
	 * @description Create new invoice endpoint
	 */
	router.post(
		`${config.api_url_prefix}/invoice`,
		[deserializeUser, requireUser, validateResource(createInvoiceSchema)],
		createInvoiceHandler
	)

	/**
	 * @description Update invoice endpoint
	 * @param {string} id
	 */
	router.put(
		`${config.api_url_prefix}/invoice/:id`,
		[deserializeUser, requireUser, validateResource(updateInvoiceSchema)],
		updateInvoiceHandler
	)

	/**
	 * @description Update invoice endpoint
	 * @param {string} id
	 */
	router.patch(
		`${config.api_url_prefix}/invoice/:id/:status`,
		[deserializeUser, requireUser, validateResource(updateInvoiceStatusSchema)],
		updateInvoiceStatusHandler
	)

	/**
	 * @description Delete invoice endpoint
	 * @param {string} id
	 */
	router.delete(
		`${config.api_url_prefix}/invoice/:id`,
		[deserializeUser, requireUser, validateResource(deleteInvoiceSchema)],
		deleteInvoiceHandler
	)
}