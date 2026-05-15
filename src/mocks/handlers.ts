import { accountHandler } from './handlers/accountHandler'
import { authHandler } from './handlers/authHandler'
import { goalHandler } from './handlers/goalHandler'
import { postHandler } from './handlers/postHandler'

export const handlers = [
  ...authHandler,
  ...accountHandler,
  ...goalHandler,
  ...postHandler,
]
