import { ApiError } from '../exceptions/apiError'
import { HttpStatusCode } from '../types'

const whitelist = ['http://localhost:5173']

export const corsOptions = (
	origin: string | undefined,
	callback: (err: Error | null, allow?: boolean) => void
) => {
	if (whitelist.includes(origin as string) || !origin) {
		callback(null, true)
	} else {
		callback(
			new ApiError(
				`CORS error. Origin: ${origin} not allowed`,
				false,
				HttpStatusCode.BAD_REQUEST
			)
		)
	}
}
