import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import mongoose from 'mongoose'
import { config } from '../../config'

export interface UserDocument extends mongoose.Document {
	name: string
	email: string
	phone: string
	is_verified: boolean
	password_reset_code?: string
	verification_code: string
	created_at: Date
	updated_at: Date
	token: string
	password: string
	comparePassword: (password: string) => Promise<boolean>
	generateAccessToken: () => Promise<string>
	generateRefreshToken: () => Promise<string>
}

const userSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: true,
		},
		email: {
			type: String,
			required: true,
			unique: true,
		},
		phone: {
			type: String,
			required: true,
		},
		is_verified: {
			type: Boolean,
			default: false,
		},
		verification_code: String,
		password_reset_code: String,
		//  This is the access token
		token: String,
		password: {
			type: String,
			required: true,
		},
	},
	{
		timestamps: {
			createdAt: 'created_at',
			updatedAt: 'updated_at',
		},
		toJSON: {
			transform(doc, ret) {
				// biome-ignore lint/performance/noDelete: <explanation>
				delete ret.token
				// biome-ignore lint/performance/noDelete: <explanation>
				delete ret.password
				// biome-ignore lint/performance/noDelete: <explanation>
				delete ret.verification_code

				return ret
			},
		},
	}
)

userSchema.pre('save', async function (next) {
	try {
		if (!this.isModified('password')) {
			next()
		}

		const salt = await bcrypt.genSalt(10)
		const hash = await bcrypt.hash(this.password, salt)
		this.password = hash
		next()
	} catch (error) {
		next()
	}
})

userSchema.methods.comparePassword = async function (password: string) {
	try {
		return await bcrypt.compare(password, this.password)
	} catch (error) {
		return false
	}
}

userSchema.methods.generateAccessToken = async function () {
	// biome-ignore lint/complexity/noUselessThisAlias: <explanation>
	const user = this
	const key = Buffer.from(config.access_token.key, 'base64').toString('ascii')
	return jwt.sign(user, key, {
		expiresIn: config.access_token.expires_in,
	})
}

userSchema.methods.generateRefreshToken = async function () {
	// biome-ignore lint/complexity/noUselessThisAlias: <explanation>
	const user = this
	const key = Buffer.from(config.refresh_token.key, 'base64').toString('ascii')
	return jwt.sign({ id: user._id }, key, {
		expiresIn: config.refresh_token.expires_in,
	})
}

const UserModel = mongoose.model<UserDocument>('User', userSchema)
export default UserModel