import { Router } from 'express'
import { config } from './config'
import { checkHTTPMethod } from './middlewares/check-method'
import userRoutes from './modules/auth/user.routes'
import clientRoutes from './modules/client/client.routes'
import invoiceRoutes from './modules/invoice/invoice.routes'
import reportRoutes from './modules/report/report.routes'

const router = Router()

export default (): Router => {
	router.get(`${config.api_url_prefix}/health-check`, (_, res) =>
		res.sendStatus(200)
	)

	clientRoutes(router)
	invoiceRoutes(router)
	reportRoutes(router)
	userRoutes(router)

	// handle http method not allowed
	router.all('/*', checkHTTPMethod)

	return router
}
