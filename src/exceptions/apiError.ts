import { CustomError } from './customError'

export class ApiError extends CustomError {
	// biome-ignore lint/style/useDefaultParameterLast: <explanation>
	constructor(message: string, success = false, status: number) {
		super(message, success, status)
	}
}
