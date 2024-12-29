import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library'

export const knownRequestHandler = (error: PrismaClientKnownRequestError) => {
  const { code, meta } = error
  console.log({ code, meta })
  if (code === 'P2002') {
    return `${meta?.target} must be unique`
  } else if (error.code === 'P2003') {
    if (error.message.includes('`prisma.course.delete()` invocation')) {
      return 'Delete operation failed. Record is being referenced by other records'
    }
  } else if (error.code === 'P2025') {
    return 'Foreign key constraint failed'
  }

  return 'Unknown error'
}
