import { Link, useNavigate } from 'react-router-dom'
import { signOut } from 'firebase/auth'
import { auth } from '../services/firebase'
import { useAuthStore } from '../store/auth'

export function Navbar() {
  const { user } = useAuthStore()
  const navigate = useNavigate()

  async function handleSignOut() {
    await signOut(auth)
    navigate('/login')
  }

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-zinc-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-12">
        <Link to="/" className="text-sm font-semibold text-zinc-700 hover:text-zinc-900 transition-colors">
          🦥 trankilo-ai
        </Link>

        {user && (
          <div className="flex items-center gap-3">
            {user.photoURL && (
              <img src={user.photoURL} alt={user.displayName ?? ''} className="w-7 h-7 rounded-full" />
            )}
            <span className="text-sm text-zinc-600 hidden sm:block">{user.displayName ?? user.email}</span>
            <button onClick={handleSignOut} className="btn-secondary text-xs px-3 py-1.5">
              Sign out
            </button>
          </div>
        )}
      </div>
    </nav>
  )
}
