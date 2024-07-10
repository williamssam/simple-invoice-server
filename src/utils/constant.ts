export const IS_DEV = process.env.NODE_ENV?.trim() === 'development'
export const IS_PROD = process.env.NODE_ENV?.trim() === 'production'

// unpaid: when invoice is sent but not paid
// paid: when invoice is paid
// draft: when invoice is created but not sent or saved
// overdue: when invoice is overdue i.e due date is passed
// cancelled: when invoice is cancelled
export const INVOICE_STATUS = [
	'all',
	'paid',
	'draft',
	'overdue',
	'cancelled',
	'unpaid',
] as const

export const page_limit = 15