import { CustomError } from './custom-error'

export class ApiError extends CustomError {
		constructor(message: string, status: number) {
			super(message, false, status)
		}
	}
