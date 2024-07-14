import type { NextFunction, Request, Response } from 'express'
import { ApiError } from '../exceptions/api-error'
import { HttpStatusCode } from '../types'
import { verifyJWT } from '../utils/jwt'

/**
 * Deserializes the user from the request headers and stores it in the response locals.
 */
export const deserializeUser = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const has_header = req.headers.authorization
		if (!has_header?.startsWith('Bearer ')) {
			throw new ApiError(
				'Invalid access token, unknown authentication scheme',
				HttpStatusCode.UNAUTHORIZED
			)
		}

		const access_token = req.headers.authorization?.split(' ')[1]
		if (!access_token) {
			throw new ApiError('Access token not found!', HttpStatusCode.UNAUTHORIZED)
		}

		const payload = await verifyJWT(access_token)
		if (payload?.decoded) {
			res.locals.user = payload?.decoded
			return next()
		}

		if (!payload?.is_valid) {
			throw new ApiError(
				'Invalid or expired access token!',
				HttpStatusCode.UNAUTHORIZED
			)
		}

		return next()
	} catch (error) {
		return next(error)
	}
}
