import type { Request, Response } from "express"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import User from "../models/Users.ts"
import { config } from "../config/env.ts"

export async function register(req: Request, res: Response) {
    try
    {
        const { name, email, password, age, address, gender, phone } = req.body

        // check if user exist in DB
        const existingUser = await User.findOne({ email })
        if (existingUser)
        {
            return res.status(400).json({ message: "User already exists" }) // TODO: Route to 404 page
        }

        // hash password
		const salt = await bcrypt.genSalt(12)
        const hashedPassword = await bcrypt.hash(password, salt)

        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            age,
            gender,
            address,
            phone
        })

		await newUser.save()
		res.status(201).json({ message: "User registered successfully" })
    }
    catch (err)
    {
		res.status(500).json({ message: "Server error" })
    }
}

export async function login(req: Request, res: Response) {
    try
    {
        const { email, password } = req.body
        const user = await User.findOne({ email })
        if (!user)
        {
            return res.status(400).json({ message: "Invalid credentials" })
        }

        const isMatch = await bcrypt.compare(password, user.password)
        if (!isMatch)
        {
            return res.status(400).json({ message: "Invalid credentials" })
        }

        // create token
		const token = jwt.sign({ userId: user._id, username: user.name }, config.jwtSecret, { expiresIn: "7d" })

		res.json({
			message: "Login successful",
			token,
			user: {
				userId: user._id,
				username: user.name,
				email: user.email
			}
		})
	}
	catch (_err)
	{
		res.status(500).json({ message: "Server error" })
	}
}

