import { HttpStatusCode } from '../types'

// Note: Our custom error extends from Error, so we can throw this error as an exception.
export class CustomError extends Error {
		message: string
		success: boolean
		additional_info: any
		status: number
		stack?: string

		constructor(
			message: string,
			success = false,
			status: number = HttpStatusCode.INTERNAL_SERVER,
			additional_info = undefined,
			stack?: string
		) {
			super(message)

			this.message = message
			this.success = success
			this.additional_info = additional_info
			this.status = status
			this.stack = stack
		}
	}

export type CustomErrorResponse = {
		message: string
		additional_info?: string
		success: boolean
		status: boolean
		stack?: string
	}
