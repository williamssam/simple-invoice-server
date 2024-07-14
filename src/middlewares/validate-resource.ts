import type { NextFunction, Request, Response } from 'express'
import { type AnyZodObject, ZodError } from 'zod'
import { HttpStatusCode } from '../types'

export const validateResource =
	(schema: AnyZodObject) =>
	(req: Request, res: Response, next: NextFunction) => {
		try {
			schema.parse({
				body: req.body,
				query: req.query,
				params: req.params,
			})
			next()
		} catch (error: any) {
			if (error instanceof ZodError) {
				const errorMessage = error.errors.map(err => ({
					message: err.message,
					path: err.path[1],
				}))
				return res.status(HttpStatusCode.BAD_REQUEST).json({
					success: false,
					errors: errorMessage,
				})
			}

			return res.status(HttpStatusCode.INTERNAL_SERVER).send(error.errors)
		}
	}
