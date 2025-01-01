import { Router } from 'express'
import adminRouter from './admin.routes'
import authRouter from './auth.routes'
const globalRoutes = Router()
// const moduleRoutes = [
//   {
//     path: 'auth',
//     route: authRouter,
//   },
// ]
// moduleRoutes.forEach(route => globalRoutes.use(route.path, route.route))
globalRoutes.use('/auth', authRouter)
globalRoutes.use('/admin', adminRouter)
export default globalRoutes
