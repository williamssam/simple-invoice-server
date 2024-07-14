import type {
	FilterQuery,
	ProjectionType,
	QueryOptions,
	UpdateQuery,
} from 'mongoose'
import type { UserDocument } from './user.model'
import UserModel from './user.model'

type UserInput = Pick<UserDocument, 'name' | 'email' | 'phone'> & {
	password: string
}

export const createUser = (input: UserInput) => {
	return UserModel.create(input)
}

export const findUserById = (id: string) => {
	return UserModel.findById(id)
}

export const findUser = (
	query: FilterQuery<UserDocument>,
	projection: ProjectionType<UserDocument> = {},
	options: QueryOptions = { lean: true }
) => {
	return UserModel.findOne(query, projection, options)
}

export const findAndUpdateUser = (
	query: FilterQuery<UserDocument>,
	update: UpdateQuery<UserDocument>,
	options: QueryOptions = { lean: true }
) => {
	return UserModel.findOneAndUpdate(query, update, options)
}

export const deleteUser = (query: FilterQuery<UserDocument>) => {
	return UserModel.deleteOne(query)
}
