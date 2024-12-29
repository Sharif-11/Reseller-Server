import 'express'

declare module 'express' {
  export interface Request {
    user?: {
      userId: string
      mobileNo: string
      role: string
    }
  }
}
