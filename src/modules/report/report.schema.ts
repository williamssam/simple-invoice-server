import { z } from 'zod'

const monthlyInvoiceReportSchema = z.object({
	params: z.object({
		start_date: z
			.string()
			.date('Invalid date string, date format: YYYY-MM-DD')
			.catch(new Date().toISOString()),
		end_date: z
			.string()
			.date('Invalid date string, date format: YYYY-MM-DD')
			.catch(new Date().toISOString()),
	}),
})

type MonthlyInvoiceReportInput = z.infer<
	typeof monthlyInvoiceReportSchema
>['params']

export { monthlyInvoiceReportSchema, type MonthlyInvoiceReportInput }

