import 'dotenv/config'

import cookieParser from 'cookie-parser'
import cors from 'cors'
import express from 'express'
import helmet from 'helmet'
import mongoose from 'mongoose'
import { config } from './config'
import errorHandler from './middlewares/error-handler'
import routes from './routes'
import { connectToDB } from './utils/connect-db'
import { IS_DEV } from './utils/constant'
import { corsOptions } from './utils/cors-options'

const app = express()

console.log('env', IS_DEV)

// <-- MIDDLEWARES -->
app.use(
	cors({
		origin: corsOptions,
	})
)
app.use(helmet())
app.use(cookieParser())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use(routes())
app.use(errorHandler)

// mongoose default to remove both "_id" and version number from response
mongoose.set('toJSON', {
	virtuals: true,
	transform: (doc, converted) => {
		if (!converted._id) return

		converted.id = converted._id.toHexString()
		// biome-ignore lint/performance/noDelete: <explanation>
		delete converted._id
		// biome-ignore lint/performance/noDelete: <explanation>
		delete converted.__v
	},
})

// <-- SERVER STARTs -->
app.listen(config.port, async () => {
	await connectToDB()
	console.log(`Server started on port ${config.port}`)
})
