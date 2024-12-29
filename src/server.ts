// src/server.ts
import app from './app'
import config from './config/index'
import prisma from './utils/prisma'

async function bootstrap() {
  let server: any

  try {
    // Start the server
    server = app.listen(config.port, () => {
      console.log('App listening on port', config.port)
    })

    // Graceful shutdown on signals
    const shutdown = async (signal: string) => {
      console.log(`Received ${signal}, shutting down gracefully...`)

      // Close the server
      if (server) {
        await new Promise<void>((resolve, reject) => {
          server.close((err: any) => {
            if (err) {
              console.error('Error while closing server:', err)
              reject(err)
            } else {
              console.log('HTTP server closed.')
              resolve()
            }
          })
        })
      }

      // Disconnect Prisma client
      try {
        await prisma.$disconnect()
        console.log('Disconnected from the database.')
      } catch (error) {
        console.error('Error disconnecting from the database:', error)
      }

      process.exit(0)
    }

    process.on('SIGINT', () => shutdown('SIGINT'))
    process.on('SIGTERM', () => shutdown('SIGTERM'))
  } catch (error) {
    console.error('Failed to start the server:', error)
    await prisma.$disconnect()
    process.exit(1)
  }
}

bootstrap()
