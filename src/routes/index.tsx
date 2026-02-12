  import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
   component: App
  })

function App() {

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      <h2 className="text-3xl font-bold text-white text-center pt-20">
        Welcome to the Roster App!
      </h2>
    </div>
  )
}
