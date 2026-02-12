import { createMiddleware } from '@tanstack/react-start'
import { auth } from '@clerk/tanstack-react-start/server'

// This ensures only logged-in users can run the server function
export const authMiddleware = createMiddleware().server(async ({ next }) => {
  const { userId } = await auth()

  if (!userId) {
    // return next({ context: { userId: 'user1' } }) // <--- want to pass in dummy data instead of throwing an error userid = user1
    throw new Error('Unauthorized: You must be signed in to perform this action.')
  }

  // Pass the userId down to the handler if needed
  return next({ context: { userId } })
})