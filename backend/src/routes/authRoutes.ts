import { Router } from "express"
import { register, login } from "../controllers/authController.ts"
import { asyncHandler } from "../middleware/asyncHandler.ts"
import { validateLogin, validateRegister } from "../middleware/validators/auth.ts"

const router = Router()

router.post("/register", validateRegister, asyncHandler(register))
router.post("/login", validateLogin, asyncHandler(login))

export default router
