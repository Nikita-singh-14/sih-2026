import { Router } from 'express'

import { authenticate } from '../middleware/auth'
import { authController } from '../controllers/authController'

const router = Router()

router.post('/signup', authController.signup)
router.post('/login', authController.login)
router.get('/me', authenticate, authController.me)

export default router
