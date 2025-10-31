import type { NextFunction, Request, Response } from "express";

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
	const status = 500;
	const message = "Internal Server Error";
	// In production, avoid leaking error details. For now, send minimal info.
	res.status(status).json({ message });
}

export default errorHandler;


