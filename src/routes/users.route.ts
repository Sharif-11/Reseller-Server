import { Router } from 'express'
import userProductsRouter from './usersProducts.routes'

const usersRouter = Router()
usersRouter.use('/products', userProductsRouter)

export default usersRouter
