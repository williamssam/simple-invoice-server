import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import mongoose from 'mongoose'
import { config } from '../../config'

export interface UserDocument extends mongoose.Document {
		name: string
		email: string
		phone: string
		is_verified: boolean
		verify_code: string
		verify_code_expires: Date
		recover_code: string
		recover_code_expires: Date
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
		verify_code: String,
		verify_code_expires: Date,
		recover_code: String,
		recover_code_expires: Date,
		//  This is the refresh token
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
				ret.token = undefined
				ret.__v = undefined
				ret._id = undefined
				ret.password = undefined
				ret.verify_code = undefined
				ret.verify_code_expires = undefined
				ret.recover_code = undefined
				ret.recover_code_expires = undefined

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
	const user = this.toObject()

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