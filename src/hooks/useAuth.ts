import { useEffect } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '../services/firebase'
import { useAuthStore } from '../store/auth'

export function useAuthInit() {
  const { setUser, setLoading } = useAuthStore()

  useEffect(() => {
    setLoading(true)
    const unsub = onAuthStateChanged(auth, (user) => {
      setUser(user)
    })
    return unsub
  }, [setUser, setLoading])
}
