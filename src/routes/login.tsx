import {
  Link,
  createFileRoute, 
} from '@tanstack/react-router'
import { SignIn } from '@clerk/tanstack-react-start'
import { z } from 'zod'

// 1. Secure Schema
const searchSchema = z.object({
  redirect: z
    .string()
    .optional()
    .catch('')
    .transform((val) => {

      if (val && val.startsWith('/') && !val.startsWith('//')) {
        return val
      }
      return undefined
    }),
})

export const Route = createFileRoute('/login')({
  validateSearch: searchSchema,
  component: LoginComponent,
})

function LoginComponent() {
  const search = Route.useSearch()

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] gap-6 p-4 bg-slate-50">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8 border border-slate-200">
        <h1 className="text-2xl font-bold text-slate-900 mb-6 text-center">
          Welcome Back
        </h1>
        <SignIn 
          routing="hash" 
          forceRedirectUrl={search.redirect || '/'} 
        />

        <div className="mt-6 pt-6 border-t border-slate-100 text-center">
          <Link 
            to="/" 
            className="text-slate-500 hover:text-slate-800 text-sm font-medium transition-colors"
          >
            ← Cancel and go Home
          </Link>
        </div>
      </div>
    </div>
  )
}