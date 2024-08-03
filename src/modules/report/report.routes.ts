import type { Router } from 'express'
import { config } from '../../config'
import { deserializeUser } from '../../middlewares/deserialize-user'
import { requireUser } from '../../middlewares/require-user'
import { validateResource } from '../../middlewares/validate-resource'
import { getClientSchema } from '../client/client.schema'
import {
	getClientInvoiceReportHandler,
	getInvoiceMetricHandler,
	getInvoiceMonthlyReportHandler,
} from './report.controller'

export default (router: Router) => {
	/**
	 * @description Get invoice metric endpoint
	 */
	router.get(
		`${config.api_url_prefix}/report/invoice`,
		[deserializeUser, requireUser],
		getInvoiceMetricHandler
	)

	/**
	 * @description Get invoice metric endpoint
	 */
	router.get(
		`${config.api_url_prefix}/report/client/:id/invoice`,
		[deserializeUser, requireUser, validateResource(getClientSchema)],
		getClientInvoiceReportHandler
	)

	/**
	 * @description Get invoice metric endpoint
	 */
	router.get(
		`${config.api_url_prefix}/report/invoice/:start_date/:end_date`,
		[deserializeUser, requireUser],
		getInvoiceMonthlyReportHandler
	)
}