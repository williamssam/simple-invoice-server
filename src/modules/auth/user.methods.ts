import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { config } from '../../config'
import type { UserDocument } from './user.model'

type ComparePassword = {
	userPassword: string
	requestPassword: string
}
export const comparePassword = async ({
	requestPassword,
	userPassword,
}: ComparePassword) => {
	try {
		return await bcrypt.compare(requestPassword, userPassword)
	} catch (error) {
		return false
	}
}

export const generateAccessToken = async (user: UserDocument) => {
	const key = Buffer.from(config.access_token.key, 'base64').toString('ascii')
	return jwt.sign(user, key, {
		expiresIn: config.access_token.expires_in,
	})
}

export const generateRefreshToken = async (user: UserDocument) => {
	const key = Buffer.from(config.refresh_token.key, 'base64').toString('ascii')
	return jwt.sign({ id: user._id }, key, {
		expiresIn: config.refresh_token.expires_in,
	})
}