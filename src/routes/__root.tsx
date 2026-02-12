import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRouteWithContext,
  useRouter,
} from '@tanstack/react-router'

import { useEffect } from 'react'
import { createServerFn } from '@tanstack/react-start'
import { auth } from '@clerk/tanstack-react-start/server'
import { useAuth } from '@clerk/tanstack-react-start'
import ClerkProvider from '../integrations/clerk/provider'
import Header from '../components/Header'
import appCss from '../styles.css?url'
import type { QueryClient } from '@tanstack/react-query'
import { NotFound } from '@/components/NotFound'
import { DefaultCatchBoundary } from '@/components/DefaultCatchBoundary'

interface MyRouterContext {
  queryClient: QueryClient
  userId: string | null
}

const fetchClerkAuth = createServerFn({ method: 'GET' }).handler(async () => {
  const { userId } = await auth()

  return {
    userId,
  }
})

export const Route = createRootRouteWithContext<MyRouterContext>()({
  beforeLoad: async () => {
    const { userId } = await fetchClerkAuth()

    return {
      userId: userId,
    }
  },
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: 'TanStack Start Starter',
      },
    ],
    links: [
      {
        rel: 'stylesheet',
        href: appCss,
      },
    ],
  }),
errorComponent: (props) => {
    return (
      <RootDocument>
        <DefaultCatchBoundary {...props} />
      </RootDocument>
    )
  },
  notFoundComponent: () => <NotFound />,
  component: RootComponent,
})

function RootComponent() {
  return (
    <RootDocument>   
        <Outlet />
    </RootDocument>
  )
}

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
          <Header />
          <AuthSync />
          {children}
        <Scripts />
      </body>
    </html>
   </ClerkProvider>
  )
}

function AuthSync() {
  const router = useRouter()
  const { userId } = useAuth()

  useEffect(() => {
    if (userId) {
      router.invalidate() 
    }
  }, [userId, router])

  return null
}
