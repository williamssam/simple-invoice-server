import type { Request } from 'express'

const paginate = async (req: Request, total: number) => {
	const page = Number(req.params.page as string) || 1
	const limit = 15
	const skip = (page - 1) * limit

	return {
		total,
		current_page: page,
		per_page: limit,
		total_pages: Math.ceil(total / limit) || 1,
		has_next_page: page < Math.ceil(total / limit),
		has_prev_page: page > 1,
		next_page: page + 1,
		prev_page: page - 1 || 1,
	}
}