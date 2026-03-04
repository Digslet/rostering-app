// src/routes/_authed.tsx
import { createFileRoute, redirect } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/react-start';
import { auth } from '@clerk/tanstack-react-start/server';

const checkAuthStatus = createServerFn({ method: 'GET' })
  .handler(async () => {
    const session = await auth();
    return { 
      userId: session.userId, 
      orgId: session.orgId 
    };
  });

export const Route = createFileRoute('/_authed')({
  beforeLoad: async () => {
    const session = await checkAuthStatus();

    if (!session.userId) {
      throw redirect({
        to: '/login',
        search: {
          redirect: window.location.pathname,
        },
      });
    }
    
    return session;
  },
});