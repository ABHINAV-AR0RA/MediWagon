import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { config } from "../config/env.ts";

export function requireAuth(req: Request, res: Response, next: NextFunction) {
	const auth = req.headers.authorization || "";
	const [scheme, token] = auth.split(" ");
	if (scheme !== "Bearer" || !token) {
		return res.status(401).json({ message: "Unauthorized" });
	}
	try {
		const payload = jwt.verify(token, config.jwtSecret) as { userId: string; username: string };
		// @ts-expect-error augment at runtime
		req.user = { userId: payload.userId, username: payload.username };
		return next();
	} catch {
		return res.status(401).json({ message: "Unauthorized" });
	}
}

export default requireAuth;


