 import express from 'express'
 const AuthRouter=express.Router()
 import authController from '../controllers/auth.controller.js'
 import authMiddleware from '../middleware/auth.middleware.js'
 
 AuthRouter.post('/register',authController.RegisterController)
 AuthRouter.post('/login',authController.LoginController)
 AuthRouter.post('/logout', authController.LogoutController)
 AuthRouter.get('/me', authMiddleware.protect, authController.GetMeController)
 
 export default AuthRouter