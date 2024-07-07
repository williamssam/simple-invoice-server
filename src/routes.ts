import { Router } from 'express'
import { config } from './config'
import { checkHTTPMethod } from './middlewares/check-method'
import clientRoutes from './modules/clients/client.routes'
import invoiceRoutes from './modules/invoices/invoice.routes'

const router = Router()

export default (): Router => {
	router.get(`${config.api_url_prefix}/health-check`, (_, res) =>
		res.sendStatus(200)
	)

	clientRoutes(router)
	invoiceRoutes(router)

	// handle not found routes

	// handle http method not allowed
	router.all('*', checkHTTPMethod)


	return router
}
