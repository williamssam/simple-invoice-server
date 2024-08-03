export const config = {
	port: process.env.PORT || '4321',
	mongo_uri: process.env.MONGO_URI as string,
	api_url: process.env.API_URL as string,
	api_url_prefix: '/api/v1',
	smtp_host: process.env.SMTP_HOST as string,
	smtp_user: process.env.SMTP_USERNAME as string,
	smtp_pass: process.env.SMTP_PASSWORD as string,
	access_token: {
		key: process.env.ACCESS_TOKEN_KEY as string,
		expires_in: '5m',
	},
	refresh_token: {
		key: process.env.REFRESH_TOKEN_KEY as string,
		expires_in: '7d',
	},
} as const
