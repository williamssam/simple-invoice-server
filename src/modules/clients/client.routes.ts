import type { Router } from 'express'
import { config } from '../../config'
import { validateResource } from '../../middlewares/validate-resource'
import {
	createClientHandler,
	deleteClientHandler,
	getAllClientsHandler,
	getClientHandler,
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
		[validateResource(createClientSchema)],
		createClientHandler
	)

	/**
	 * @description Update client endpoint
	 * @param {string} id
	 */
	router.put(
		`${config.api_url_prefix}/client/:id`,
		[validateResource(updateClientSchema)],
		updateClientHandler
	)

	/**
	 * @description Delete client endpoint
	 * @param {string} id
	 */
	router.delete(
		`${config.api_url_prefix}/client/:id`,
		[validateResource(deleteClientSchema)],
		deleteClientHandler
	)

	/**
	 * @description Get one client endpoint
	 * @param {string} id
	 */
	router.get(
		`${config.api_url_prefix}/client/:id`,
		[validateResource(getClientSchema)],
		getClientHandler
	)

	/**
	 * @description Get all clients endpoint
	 */
	router.get(
		`${config.api_url_prefix}/clients`,
		[validateResource(getAllClientsSchema)],
		getAllClientsHandler
	)
}