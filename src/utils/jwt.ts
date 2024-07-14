import jwt from 'jsonwebtoken'
import { config } from '../config'

/**
 * Verifies a JSON Web Token.
 *
 * @param {string} token - The token to verify.
 */
export const verifyJWT = async (token: string) => {
	try {
		const key = Buffer.from(config.access_token.key, 'base64').toString('ascii')
		const decoded = jwt.verify(token, key)

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
