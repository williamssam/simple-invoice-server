import type { Router } from 'express'
import { config } from '../../config'
import { getInvoiceMetricHandler } from './report.controller'

export default (router: Router) => {
	/**
	 * @description Get invoice metric endpoint
	 */
	router.get(`${config.api_url_prefix}/report/invoice`, getInvoiceMetricHandler)
}