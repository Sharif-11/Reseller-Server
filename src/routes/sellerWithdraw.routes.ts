import { Router } from 'express'
import withdrawControllers from '../controllers/withdraw.controllers'
import validateRequest from '../middlewares/validation.middleware'
import withdrawValidators from '../Validators/withdrawValidators'

const sellerWithdrawRouter = Router()
sellerWithdrawRouter.post(
  '/',
  withdrawValidators.createRequest,
  validateRequest,
  withdrawControllers.createRequest
)
sellerWithdrawRouter.get(
  '/',
  withdrawValidators.getUserRequests,
  validateRequest,
  withdrawControllers.getUserRequests
)
sellerWithdrawRouter.delete(
  '/:withdrawId',
  withdrawValidators.cancelRequest,
  validateRequest,
  withdrawControllers.cancelRequest
)
export default sellerWithdrawRouter
