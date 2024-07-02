import type { NextFunction, Request, Response } from 'express'
import {
	CustomError,
	type CustomErrorResponse,
} from '../exceptions/customError'
import { HttpStatusCode } from '../types'

const errorHandler = (
	err: any,
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

	if (!(err instanceof CustomError)) {
		return res.status(HttpStatusCode.INTERNAL_SERVER).json({
			message: 'Internal Server error. Something went wrong',
			success: false,
		})
	}

	const customError = err as CustomError
	const response = {
		message: customError.message,
		success: customError.success,
	} as CustomErrorResponse

	if (customError.additional_info) {
		response.additional_info = customError.additional_info
	}
	return res.status(customError.status).send(response)
}

export default errorHandler
