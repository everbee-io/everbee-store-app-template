import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'

export default function CallbackPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  useEffect(() => {
    const token = searchParams.get('token')
    const error = searchParams.get('error')

    if (error) {
      navigate('/auth/login?error=' + error)
      return
    }

    if (token) {
      localStorage.setItem('accessToken', token)
      navigate('/dashboard')
    } else {
      navigate('/auth/login')
    }
  }, [searchParams, navigate])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Completing authentication...</p>
      </div>
    </div>
  )
}
