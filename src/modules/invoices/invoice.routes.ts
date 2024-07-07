import type { Router } from 'express'
import { config } from '../../config'
import { validateResource } from '../../middlewares/validate-resource'
import {
	createInvoiceHandler,
	deleteInvoiceHandler,
	getAllInvoicesHandler,
	getInvoiceHandler,
	getInvoiceMetricHandler,
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
		[validateResource(getAllInvoicesSchema)],
		getAllInvoicesHandler
	)

	/**
	 * @description Get one invoice endpoint
	 * @param {string} id
	 */
	router.get(
		`${config.api_url_prefix}/invoice/:id`,
		[validateResource(getInvoiceSchema)],
		getInvoiceHandler
	)

	/**
	 * @description Create new invoice endpoint
	 */
	router.post(
		`${config.api_url_prefix}/invoice`,
		[validateResource(createInvoiceSchema)],
		createInvoiceHandler
	)

	/**
	 * @description Update invoice endpoint
	 * @param {string} id
	 */
	router.put(
		`${config.api_url_prefix}/invoice/:id`,
		[validateResource(updateInvoiceSchema)],
		updateInvoiceHandler
	)

	/**
	 * @description Update invoice endpoint
	 * @param {string} id
	 */
	router.patch(
		`${config.api_url_prefix}/invoice/:id/:status`,
		[validateResource(updateInvoiceStatusSchema)],
		updateInvoiceStatusHandler
	)

	/**
	 * @description Delete invoice endpoint
	 * @param {string} id
	 */
	router.delete(
		`${config.api_url_prefix}/invoice/:id`,
		[validateResource(deleteInvoiceSchema)],
		deleteInvoiceHandler
	)

	/**
	 * @description Get invoice metric endpoint
	 */
	router.get(
		`${config.api_url_prefix}/invoices/metric`,
		getInvoiceMetricHandler
	)
}