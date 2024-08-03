import type { Router } from 'express'
import { config } from '../../config'
import { deserializeUser } from '../../middlewares/deserialize-user'
import { requireUser } from '../../middlewares/require-user'
import { validateResource } from '../../middlewares/validate-resource'
import {
	createClientHandler,
	deleteClientHandler,
	getAllClientsHandler,
	getClientHandler,
	getClientInvoicesHandler,
	updateClientHandler,
} from './client.controller'
import {
	createClientSchema,
	deleteClientSchema,
	getAllClientsSchema,
	getClientSchema,
	updateClientSchema,
} from './client.schema'

export default (router: Router) => {
	/**
	 * @description Create new client endpoint
	 */
	router.post(
		`${config.api_url_prefix}/client`,
		[deserializeUser, requireUser, validateResource(createClientSchema)],
		createClientHandler
	)

	/**
	 * @description Update client endpoint
	 * @param {string} id
	 */
	router.put(
		`${config.api_url_prefix}/client/:id`,
		[deserializeUser, requireUser, validateResource(updateClientSchema)],
		updateClientHandler
	)

	/**
	 * @description Delete client endpoint
	 * @param {string} id
	 */
	router.delete(
		`${config.api_url_prefix}/client/:id`,
		[deserializeUser, requireUser, validateResource(deleteClientSchema)],
		deleteClientHandler
	)

	/**
	 * @description Get one client endpoint
	 * @param {string} id
	 */
	router.get(
		`${config.api_url_prefix}/client/:id`,
		[deserializeUser, requireUser, validateResource(getClientSchema)],
		getClientHandler
	)

	/**
	 * @description Get one client invoice endpoint
	 * @param {string} id
	 */
	router.get(
		`${config.api_url_prefix}/client/:id/invoice`,
		[deserializeUser, requireUser, validateResource(getClientSchema)],
		getClientInvoicesHandler
	)

	/**
	 * @description Get all clients endpoint
	 */
	router.get(
		`${config.api_url_prefix}/clients`,
		[deserializeUser, requireUser, validateResource(getAllClientsSchema)],
		getAllClientsHandler
	)
}