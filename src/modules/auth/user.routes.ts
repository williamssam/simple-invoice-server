import type { Router } from 'express'
import { config } from '../../config'
import { deserializeUser } from '../../middlewares/deserialize-user'
import { requireUser } from '../../middlewares/require-user'
import { validateResource } from '../../middlewares/validate-resource'
import {
	changePasswordHandler,
	createUserHandler,
	deleteUserHandler,
	forgotPasswordHandler,
	generateRefreshTokenHandler,
	getCurrentUserHandler,
	loginHandler,
	resendVerificationCodeHandler,
	resetPasswordHandler,
	updateUserHandler,
	verifyUserHandler,
} from './user.controller'
import {
	changePasswordSchema,
	createUserSchema,
	deleteUserSchema,
	forgotPasswordSchema,
	generateAccessTokenSchema,
	loginUserSchema,
	resendVerificationCodeSchema,
	resetPasswordSchema,
	updateUserSchema,
	verifyUserSchema,
} from './user.schema'

export default (router: Router) => {
	/**
	 * Login endpoint
	 */
	router.post(
		`${config.api_url_prefix}/login`,
		[validateResource(loginUserSchema)],
		loginHandler
	)

	/**
	 * Refresh token endpoint
	 */
	router.post(
		`${config.api_url_prefix}/refresh-token`,
		[validateResource(generateAccessTokenSchema)],
		generateRefreshTokenHandler
	)

	/**
	 * Register endpoint
	 */
	router.post(
		`${config.api_url_prefix}/register`,
		[validateResource(createUserSchema)],
		createUserHandler
	)

	/**
	 * Verify email endpoint
	 */
	router.post(
		`${config.api_url_prefix}/verify-email`,
		[validateResource(verifyUserSchema)],
		verifyUserHandler
	)

	/**
	 * Resend verification code endpoint
	 */
	router.get(
		`${config.api_url_prefix}/resend-code/:email`,
		[validateResource(resendVerificationCodeSchema)],
		resendVerificationCodeHandler
	)

	/**
	 * Forgot password endpoint
	 */
	router.post(
		`${config.api_url_prefix}/forgot-password`,
		[validateResource(forgotPasswordSchema)],
		forgotPasswordHandler
	)

	/**
	 * Reset password endpoint
	 */
	router.patch(
		`${config.api_url_prefix}/reset-password`,
		[validateResource(resetPasswordSchema)],
		resetPasswordHandler
	)

	/**
	 * Get current user endpoint
	 */
	router.get(
		`${config.api_url_prefix}/me`,
		[deserializeUser, requireUser],
		getCurrentUserHandler
	)

	/**
	 * Update current user endpoint
	 */
	router.put(
		// might remove this id
		`${config.api_url_prefix}/account/:id`,
		[deserializeUser, requireUser, validateResource(updateUserSchema)],
		updateUserHandler
	)

	/**
	 * Change password endpoint for authenticated user
	 */
	router.patch(
		`${config.api_url_prefix}/account/:id/change-password`,
		[deserializeUser, requireUser, validateResource(changePasswordSchema)],
		changePasswordHandler
	)

	/**
	 * Delete authenticated user
	 */
	router.delete(
		`${config.api_url_prefix}/account/:id`,
		[deserializeUser, requireUser, validateResource(deleteUserSchema)],
		deleteUserHandler
	)
}