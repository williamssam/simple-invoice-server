import 'dotenv/config'

export const config = {
	port: process.env.PORT || '4321',
	mongo_uri: process.env.MONGO_URI as string,
	api_url: process.env.API_URL as string,
	api_url_prefix: '/api/v1',
} as const
