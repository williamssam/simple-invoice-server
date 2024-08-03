import jwt from 'jsonwebtoken'
import { config } from '../config'

/**
 * Verifies a JSON Web Token.
 *
 * @param {string} token - The token to verify.
 */
export const verifyAccessJWT = async (
	token: string,
	options?: jwt.VerifyOptions
) => {
	try {
		const key = Buffer.from(config.access_token.key, 'base64').toString('ascii')
		const decoded = jwt.verify(token, key, options)

		return {
			is_valid: true,
			decoded,
		}
	} catch (error) {
		return {
			is_valid: false,
			decoded: null,
		}
		// if (error instanceof jwt.TokenExpiredError) {
		// }

		// if(error instanceof jwt.JsonWebTokenError) {
		// 	return {
		// 		expired: false,
		// 		decoded: null,
		// 	}
		// }
	}
}

export const verifyRefreshJWT = async (
	token: string,
	options?: jwt.VerifyOptions
) => {
	try {
		const key = Buffer.from(config.refresh_token.key, 'base64').toString(
			'ascii'
		)
		const decoded = jwt.verify(token, key, options)

		return {
			is_valid: true,
			decoded,
		}
	} catch (error) {
		return {
			is_valid: false,
			decoded: null,
		}
		// if (error instanceof jwt.TokenExpiredError) {
		// }

		// if(error instanceof jwt.JsonWebTokenError) {
		// 	return {
		// 		expired: false,
		// 		decoded: null,
		// 	}
		// }
	}
}
