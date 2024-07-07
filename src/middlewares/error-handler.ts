import type { NextFunction, Request, Response } from 'express'
import {
	CustomError,
	type CustomErrorResponse,
} from '../exceptions/custom-error'
import { HttpStatusCode } from '../types'
import { IS_DEV } from '../utils/constant'

const errorHandler = (
	err: Error,
	req: Request,
	res: Response,
	next: NextFunction
) => {
	// log.error(err)
	// if (err instanceof MongooseError) {
	// 	return res.status(503).json({
	// 		success:false,
	// 		message: err.message,
	// 	})
	// }
	if (err) {
		// TODO: this does not make sense small, how do we know it its throwing an internal server error
		if (!(err instanceof CustomError)) {
			return res.status(HttpStatusCode.INTERNAL_SERVER).json({
				message: 'Internal Server error. Something went wrong',
				success: false,
				...(IS_DEV && { stack: err.stack }),
			})
		}

		const customError = err as CustomError
		const response = {
			message: customError.message,
			success: false,
		} as CustomErrorResponse

		if (IS_DEV) {
			response.stack = customError.stack
		}

		if (customError.additional_info) {
			response.additional_info = customError.additional_info
		}
		res.status(customError.status).send(response)
	}

	next()
}

export default errorHandler
