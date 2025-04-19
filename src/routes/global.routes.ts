import { Router } from 'express'
import adminRouter from './admin.routes'
import authRouter from './auth.routes'
import sellerRouter from './seller.routes'
import usersRouter from './users.route'
import trackingRoutes from './tracking.routes'
const globalRoutes = Router()
// const moduleRoutes = [
//   {
//     path: 'auth',
//     route: authRouter,
//   },
// ]
// moduleRoutes.forEach(route => globalRoutes.use(route.path, route.route))
globalRoutes.use('/', usersRouter)
globalRoutes.use('/auth', authRouter)
globalRoutes.use('/admin', adminRouter)
globalRoutes.use('/sellers', sellerRouter)
globalRoutes.use('/tracking', trackingRoutes)
export default globalRoutes
