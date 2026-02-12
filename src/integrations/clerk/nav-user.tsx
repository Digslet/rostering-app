import {
  SignInButton,
  SignedIn,
  SignedOut,
  useClerk,
} from '@clerk/clerk-react'
import { Button } from '@/components/ui/button'

export default function NavUser() {
  const { signOut } = useClerk()

  const handleSignOut = async () => {
    const ok = window.confirm('Are you sure you want to sign out?')
    if (!ok) return

    await signOut({ redirectUrl: '/' })
  }

  return (
    <>
      <SignedIn>
        <Button variant="outline" onClick={handleSignOut} 
        className="bg-gray-800 hover:bg-red-400 text-red-400 border-red-400">
          Sign Out
        </Button>
      </SignedIn>
      <SignedOut>
        <SignInButton />
      </SignedOut>
    </>
  )
}
