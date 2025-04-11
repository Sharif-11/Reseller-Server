import { Router } from "express";
import commissionController from "../controllers/commission.controller";

const commissionRoutes=Router();
commissionRoutes.post('/', commissionController.createCommissions)
commissionRoutes.get('/', commissionController.getFullCommissionTable)
commissionRoutes.put('/', commissionController.updateCommissionTable)
commissionRoutes.get(
  '/calculate-commissions',
  commissionController.calculateCommissions
)
commissionRoutes.get(
  '/:price',
  commissionController.getCommissionsByPrice
)
export default commissionRoutes