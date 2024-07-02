import mongoose from 'mongoose'
import { config } from '../config'

export const connectToDB = async () => {
	try {
		await mongoose.connect(config.mongo_uri)
		console.log('Connected to DB')
	} catch (error) {
		console.error('Could not connect to DB')
		console.log('connect error:', error)
		process.exit(1)
	}
}
