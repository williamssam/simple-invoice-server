import { Router } from 'express'
import { config } from './config'

const router = Router()

export default (): Router => {
	router.get(`${config.api_url_prefix}/health-check`, (_, res) =>
		res.sendStatus(200)
	)

	return router
}
