import 'dotenv/config'

import cors from 'cors'
import express from 'express'
import helmet from 'helmet'
import mongoose from 'mongoose'
import cron from 'node-cron'
import { config } from './config'
import { sendReminderEmail } from './jobs/send-reminder'
import errorHandler from './middlewares/error-handler'
import routes from './routes'
import { connectToDB } from './utils/connect-db'
import { corsOptions } from './utils/cors-options'

const app = express()

// <-- MIDDLEWARES -->
app.use(
	cors({
		origin: corsOptions,
	})
)
app.use(helmet())
// app.use(cookieParser())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// TODO: handle route not found errors
app.use(routes())
app.use(errorHandler)

// mongoose default to remove both "_id" and version number from response
mongoose.set('toJSON', {
	virtuals: true,
	versionKey: false,
	transform: (doc, ret) => {
		if (!ret._id) return

		// biome-ignore lint/performance/noDelete: <explanation>
		delete ret._id
	},
})

// <-- SERVER STARTs -->
app.listen(config.port, async () => {
	await connectToDB()
	console.log(`Server started on port ${config.port}`)
})

// Run this job every day at midnight
cron.schedule('0 0 */1 * *', sendReminderEmail)