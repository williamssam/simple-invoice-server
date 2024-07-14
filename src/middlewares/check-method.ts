import type { NextFunction, Request, Response } from 'express'
import { ApiError } from '../exceptions/api-error'
import { HttpStatusCode } from '../types'

export const checkHTTPMethod = (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		if (req.method !== req.route.method) {
			res.set('Allow', req.route.methods)
			throw new ApiError(
				`HTTP method "${req.method}" not allowed!`,
				HttpStatusCode.METHOD_NOT_ALLOWED
			)
		}

		next()
	} catch (error) {
		next(error)
	}
}