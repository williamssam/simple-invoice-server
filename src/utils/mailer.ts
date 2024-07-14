import nodemailer, { type SendMailOptions } from 'nodemailer'
import { config } from '../config'

// test details
const smtp = {
	host: config.smtp_host,
	port: 2525,
	secure: false,
	auth: {
		user: config.smtp_user,
		pass: config.smtp_pass,
	},
}

const transporter = nodemailer.createTransport({
	...smtp,
	connectionTimeout: 5 * 60 * 1000,
})

export const sendMail = async (payload: Omit<SendMailOptions, 'from'>) => {
	transporter.sendMail(
		{
			...payload,
		},
		(err, info) => {
			if (err) {
				console.error(err, 'Error sending email')
				return
			}

			console.log(`Preview URL: ${nodemailer.getTestMessageUrl(info)}`)
		}
	)
}
