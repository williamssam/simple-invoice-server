import type { NextFunction, Request, Response } from 'express'
import { ApiError } from '../exceptions/api-error'
import { HttpStatusCode } from '../types'

/**
 * Middleware function to require a user to be authenticated.
 */
export const requireUser = (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	const user = res.locals.user

	if (!user) {
		throw new ApiError(
			'No active session, please login',
			HttpStatusCode.UNAUTHORIZED
		)
	}

	return next()
}
