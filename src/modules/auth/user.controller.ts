import type { NextFunction, Request, Response } from 'express'
import { customAlphabet } from 'nanoid'
import { ApiError } from '../../exceptions/api-error'
import { HttpStatusCode } from '../../types'
import { verifyJWT } from '../../utils/jwt'
import { sendMail } from '../../utils/mailer'
import type {
	ChangePasswordInput,
	CreateUserInput,
	DeleteUserInput,
	ForgotPasswordInput,
	LoginUserInput,
	ResendVerificationCodeInput,
	ResetPasswordInput,
	UpdateUserInput,
	VerifyUserInput,
} from './user.schema'
import {
	createUser,
	deleteUser,
	findAndUpdateUser,
	findUser,
	findUserById,
} from './user.service'

const customNano = customAlphabet('0123456789', 6)

export const createUserHandler = async (
	req: Request<unknown, unknown, CreateUserInput>,
	res: Response,
	next: NextFunction
) => {
	try {
		const { email, phone } = req.body

		const emailExits = await findUser({ email })
		if (emailExits) {
			throw new ApiError(
				'Email address or phone already exists!',
				HttpStatusCode.CONFLICT
			)
		}

		const phoneExists = await findUser({ phone })
		if (phoneExists) {
			throw new ApiError(
				'Email address or phone already exists!',
				HttpStatusCode.CONFLICT
			)
		}

		const user = await createUser(req.body)
		user.verification_code = customNano()
		await sendMail({
			to: user.email,
			subject: 'Verify your email address',
			// html: verifyEmailMail({ otp: user.verification_code }),
		})

		await user.save()
		return res.status(HttpStatusCode.CREATED).json({
			success: true,
			message: 'User created successfully!',
			data: user,
		})
	} catch (error) {
		next(error)
	}
}

export const resendVerificationCodeHandler = async (
	req: Request<ResendVerificationCodeInput>,
	res: Response,
	next: NextFunction
) => {
	try {
		const { email } = req.params

		const user = await findUser({ email })
		if (!user) {
			throw new ApiError(
				'User with email address not found!',
				HttpStatusCode.NOT_FOUND
			)
		}

		user.verification_code = customNano()
		await sendMail({
			to: user.email,

			subject: 'Re: Verify your email address',
			// html: verifyEmailMail({ otp: user.verification_code }),
		})
		// TODO: send email verification code
		await user.save()

		return res.status(HttpStatusCode.OK).json({
			success: true,
			message: 'Verification code resent successfully!',
			data: null,
		})
	} catch (error) {
		next(error)
	}
}

export const verifyUserHandler = async (
	req: Request<unknown, unknown, VerifyUserInput>,
	res: Response,
	next: NextFunction
) => {
	try {
		const { email, code } = req.body

		const user = await findUser({ email })
		if (!user) {
			throw new ApiError(
				'User with email address not found!',
				HttpStatusCode.NOT_FOUND
			)
		}

		if (user.is_verified) {
			throw new ApiError('User already verified!', HttpStatusCode.BAD_REQUEST)
		}

		if (user.verification_code !== code) {
			throw new ApiError(
				'Invalid verification code!',
				HttpStatusCode.BAD_REQUEST
			)
		}

		user.is_verified = true
		user.verification_code = ''
		await sendMail({
			to: user.email,

			subject: 'Welcome to Simple Invoice',
			// html: verifyEmailMail({ otp: user.verification_code }),
		})

		await user.save()
		return res.status(HttpStatusCode.OK).json({
			success: true,
			message: 'User verified successfully!',
			data: null,
		})
	} catch (error) {
		next(error)
	}
}

export const loginHandler = async (
	req: Request<unknown, unknown, LoginUserInput>,
	res: Response,
	next: NextFunction
) => {
	try {
		const { email, password } = req.body

		const user = await findUser({ email })
		if (!user) {
			throw new ApiError(
				'User with email address not found!',
				HttpStatusCode.NOT_FOUND
			)
		}

		if (!user.is_verified) {
			throw new ApiError('User not verified!', HttpStatusCode.BAD_REQUEST)
		}

		const isPasswordValid = await user.comparePassword(password)
		if (!isPasswordValid) {
			throw new ApiError(
				'Invalid email address or password!',
				HttpStatusCode.BAD_REQUEST
			)
		}

		const access_token = await user.generateAccessToken()
		const refresh_token = await user.generateRefreshToken()

		// TODO: hash the refresh token and store in db
		user.token = refresh_token
		await user.save()
		// res.cookie('si-access-token', access_token, {
		// 	maxAge: config.access_token.expires_in, // 15mins
		// 	httpOnly: true,
		// 	sameSite: 'strict',
		// 	secure: process.env.NODE_ENV === 'production'
		// })

		return res.status(HttpStatusCode.OK).json({
			success: true,
			message: 'User logged in successfully!',
			data: {
				user,
				access_token,
				refresh_token,
			},
		})
	} catch (error) {
		next(error)
	}
}

export const refreshTokenHandler = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const currentUser = res.locals.user

		const user = await findUserById(currentUser._id)
		if (!user) {
			throw new ApiError('User does not found!', HttpStatusCode.NOT_FOUND)
		}

		const payload = await verifyJWT(user.token)
		if (!payload?.is_valid) {
			throw new ApiError(
				'Invalid or expired refresh token, please login again!',
				HttpStatusCode.UNAUTHORIZED
			)
		}

		const access_token = await user.generateAccessToken()
		return res.status(HttpStatusCode.OK).json({
			success: true,
			message: 'User logged in successfully!',
			data: {
				access_token,
			},
		})
	} catch (error) {
		next(error)
	}
}

export const getCurrentUserHandler = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const id = res.locals.user._doc._id
		const user = await findUserById(id)
		if (!user) {
			throw new ApiError('User does not found!', HttpStatusCode.NOT_FOUND)
		}

		return res.status(200).json({
			success: true,
			message: 'Current user retrieved successfully',
			data: user,
		})
	} catch (error) {
		return next(error)
	}
}

export const updateUserHandler = async (
	req: Request<UpdateUserInput['params'], unknown, UpdateUserInput['body']>,
	res: Response,
	next: NextFunction
) => {
	try {
		const { id } = req.params

		const user = await findUserById(id)
		if (!user) {
			throw new ApiError('User does not found!', HttpStatusCode.NOT_FOUND)
		}

		const updatedUser = await findAndUpdateUser(
			{ _id: id },
			{ ...req.body },
			{ new: true }
		)
		return res.status(HttpStatusCode.OK).json({
			success: true,
			message: 'User updated successfully',
			data: updatedUser,
		})
	} catch (error) {
		next(error)
	}
}

export const forgotPasswordHandler = async (
	req: Request<{}, {}, ForgotPasswordInput>,
	res: Response,
	next: NextFunction
) => {
	try {
		const { email } = req.body

		const user = await findUser({ email })
		if (!user) {
			throw new ApiError(
				'User with email address not found!',
				HttpStatusCode.NOT_FOUND
			)
		}

		if (!user.is_verified) {
			throw new ApiError(
				'Email address is not verified!',
				HttpStatusCode.BAD_REQUEST
			)
		}

		user.password_reset_code = customNano()
		await user.save()

		return res.status(HttpStatusCode.ACCEPTED).json({
			success: true,
			message: 'Password reset code sent to email address!',
			data: null,
		})
	} catch (error) {
		next(error)
	}
}

export const resetPasswordHandler = async (
	req: Request<unknown, unknown, ResetPasswordInput>,
	res: Response,
	next: NextFunction
) => {
	try {
		const { password, code, email } = req.body

		const user = await findUser({ email })
		if (!user) {
			throw new ApiError(
				'User with email address not found!',
				HttpStatusCode.NOT_FOUND
			)
		}

		if (user.password_reset_code !== code) {
			throw new ApiError(
				'Invalid password reset code!',
				HttpStatusCode.BAD_REQUEST
			)
		}

		user.password = password
		// await findAndUpdateUser({  }, { password_reset_code: '' })
		user.password_reset_code = ''
		await user.save()

		return res.status(HttpStatusCode.OK).json({
			success: true,
			message: 'Password reset successfully!',
			data: null,
		})
	} catch (error) {
		next(error)
	}
}

export const changePasswordHandler = async (
	req: Request<
		ChangePasswordInput['params'],
		unknown,
		ChangePasswordInput['body']
	>,
	res: Response,
	next: NextFunction
) => {
	try {
		const { id } = req.params
		const { new_password, old_password } = req.body

		const user = await findUserById(id)
		if (!user) {
			throw new ApiError('User not found', HttpStatusCode.BAD_REQUEST)
		}

		const isPasswordValid = await user.comparePassword(old_password)
		if (!isPasswordValid) {
			throw new ApiError(
				'Password is not incorrect',
				HttpStatusCode.BAD_REQUEST
			)
		}

		user.password = new_password
		await user.save()

		return res.status(HttpStatusCode.OK).json({
			success: true,
			message: 'Password changed successfully!',
			data: null,
		})
	} catch (error) {
		next(error)
	}
}

export const deleteUserHandler = async (
	req: Request<DeleteUserInput>,
	res: Response,
	next: NextFunction
) => {
	try {
		const { id } = req.params

		const user = await findUserById(id)
		if (!user) {
			throw new ApiError('User not found!', HttpStatusCode.NOT_FOUND)
		}

		await deleteUser({ _id: id })
		return res.status(HttpStatusCode.OK).json({
			success: true,
			message: 'User deleted successfully!',
			data: null,
		})
	} catch (error) {
		next(error)
	}
}

export const logoutHandler = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {}
