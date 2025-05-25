//src/app.ts
import cookieParser from 'cookie-parser'
import cors from 'cors'
import express, { Application } from 'express'
import helmet from 'helmet'
import globalErrorHandler from './middlewares/globalErrorHandler'
import globalRoutes from './routes/global.routes'
const app: Application = express()
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())
app.use(helmet())
const corsOptions = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  origin: function (origin: string | undefined, callback: any) {
    callback(null, true)
  },
  credentials: true, // Allow credentials
}

// Use CORS middleware
app.use(cors(corsOptions))
app.use('/api/v1', globalRoutes)
//health check
app.get('/health', async (req, res) => {
  res.status(200).json({
    statusCode: 200,
    success: true,
    message: 'Server is running',
  })
})

//handling unhandled routes
app.all('*', (req, res, next) => {
  res.status(404).json({
    statusCode: 404,
    success: false,
    message: `Can't find ${req.originalUrl} on this server!`,
  })
})
app.use(globalErrorHandler)
export default app
