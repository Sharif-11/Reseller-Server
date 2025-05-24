import { Router } from 'express'
import commissionController from '../controllers/commission.controller'

const commissionRoutes = Router()
const sellerCommissionRoutes = Router()

// Commission Table Management
commissionRoutes.put('/', commissionController.replaceCommissionTable)

commissionRoutes.get('/', commissionController.getCommissionTable)
sellerCommissionRoutes.get('/', commissionController.getCommissionTable)

// Commission Calculations
commissionRoutes.post(
  '/calculations',
  commissionController.calculateUserCommissions
)

commissionRoutes.get(
  '/calculations/:price',
  commissionController.getCommissionsForPrice
)

export default commissionRoutes
export { sellerCommissionRoutes }
