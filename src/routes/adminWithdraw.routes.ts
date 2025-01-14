import { Router } from 'express'
import withdrawControllers from '../controllers/withdraw.controllers'
import validateRequest from '../middlewares/validation.middleware'
import withdrawValidators from '../Validators/withdrawValidators'

const adminWithdrawRouter = Router()
adminWithdrawRouter.get(
  '/',
  withdrawValidators.getAllRequests,
  validateRequest,
  withdrawControllers.getAllRequests
)
adminWithdrawRouter.patch(
  '/:withdrawId/complete',
  withdrawValidators.completeRequest,
  validateRequest,
  withdrawControllers.completeRequest
)
adminWithdrawRouter.patch(
  '/:withdrawId/reject',
  withdrawValidators.rejectRequest,
  validateRequest,
  withdrawControllers.rejectRequest
)

export default adminWithdrawRouter
