import { isObjectIdOrHexString } from 'mongoose'
import { z } from 'zod'

const payload = {
	body: z.object({
		name: z
			.string({
				required_error: 'Name is required',
			})
			.trim(),
		email: z
			.string({
				required_error: 'Email is required',
			})
			.email('Invalid email address')
			.trim(),
		phone: z
			.string({
				required_error: 'Phone is required',
			})
			.min(11, 'Phone number should be 11 digits long')
			.max(11, 'Phone number should not be 11 digits long')
			.trim(),
		password: z
			.string({
				required_error: 'Password is required',
			})
			.min(6, 'Password should be at least 6 characters long')
			.trim(),
	}),
}

const params = {
	params: z.object({
		id: z
			.string({
				required_error: 'User ID is required',
			})
			.trim()
			.refine(val => isObjectIdOrHexString(val), {
				message: 'Invalid User ID',
			}),
	}),
}

const createUserSchema = z.object({ ...payload })
const updateUserSchema = z.object({ ...payload, ...params })
const deleteUserSchema = z.object({ ...params })
const getUserSchema = z.object({ ...params })
const resendVerificationCodeSchema = z.object({
	params: z.object({
		email: z
			.string({
				required_error: 'Email is required',
			})
			.email('Invalid email address')
			.trim(),
	}),
})
const verifyUserSchema = z.object({
	body: z.object({
		code: z
			.string({ required_error: 'Verification code is required' })
			.min(4, { message: 'Verification code cannot be less than 4 digits' })
			.max(4, { message: 'Verification code cannot be more than 4 digits' }),
		email: z
			.string({
				required_error: 'Email is required',
			})
			.email('Invalid email address')
			.trim(),
	}),
})
const loginUserSchema = z.object({
	body: z.object({
		email: z
			.string({
				required_error: 'Email is required',
			})
			.email('Invalid email address')
			.trim(),
		password: z
			.string({
				required_error: 'Password is required',
			})
			.min(6, 'Password should be at least 6 characters long')
			.trim(),
	}),
})
const resetPasswordSchema = z.object({
	body: z.object({
		password: z
			.string({
				required_error: 'Password is required',
			})
			.min(6, 'Password must be at least 6 characters')
			.regex(
				/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{6,}$/,
				'Password must contain at least one letter, one number and one special character'
			)
			.trim(),
		code: z
			.string({
				required_error: 'Password reset code is required',
			})
			.trim(),
		email: z
			.string({
				required_error: 'Email is required',
			})
			.email('Invalid email address')
			.trim(),
	}),
})
const changePasswordSchema = z.object({
	body: z.object({
		old_password: z
			.string({ required_error: 'Old password is required' })
			.trim(),
		new_password: z
			.string({
				required_error: 'Password is required',
			})
			.min(6, 'Password must be at least 6 characters')
			.regex(
				/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{6,}$/,
				'Password must contain at least one letter, one number and one special character'
			)
			.trim(),
	}),
	...params,
})
const forgotPasswordSchema = z.object({
	body: z.object({
		email: z
			.string({
				required_error: 'Email is required',
			})
			.email('Invalid email address')
			.trim(),
	}),
})

// TYPES
type CreateUserInput = z.infer<typeof createUserSchema>['body']
type UpdateUserInput = z.infer<typeof updateUserSchema>
type DeleteUserInput = z.infer<typeof deleteUserSchema>['params']
type GetUserInput = z.infer<typeof getUserSchema>['params']
type ResendVerificationCodeInput = z.infer<
	typeof resendVerificationCodeSchema
>['params']
type VerifyUserInput = z.infer<typeof verifyUserSchema>['body']
type LoginUserInput = z.infer<typeof loginUserSchema>['body']
type ResetPasswordInput = z.infer<typeof resetPasswordSchema>['body']
type ChangePasswordInput = z.infer<typeof changePasswordSchema>
type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>['body']

export {
	changePasswordSchema,
	createUserSchema,
	deleteUserSchema,
	forgotPasswordSchema,
	getUserSchema,
	loginUserSchema,
	resendVerificationCodeSchema,
	resetPasswordSchema,
	updateUserSchema,
	verifyUserSchema,
	type ChangePasswordInput,
	type CreateUserInput,
	type DeleteUserInput,
	type ForgotPasswordInput,
	type GetUserInput,
	type LoginUserInput,
	type ResendVerificationCodeInput,
	type ResetPasswordInput,
	type UpdateUserInput,
	type VerifyUserInput,
}

