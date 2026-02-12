import {
  SignInButton,
  SignedIn,
  SignedOut,
  UserButton,
} from '@clerk/clerk-react'

type AuthButtonProps = { 
    classname?: string
}

export default function signinHeader({classname}:AuthButtonProps) {
  return (
<div className="absolute right-4 flex items-center gap-2">
  <SignedOut>
    <SignInButton mode="modal">
      <button className={classname}>
        Sign in
      </button>
    </SignInButton>
  </SignedOut>

  <SignedIn>
    <UserButton />
  </SignedIn>
</div>
  )}