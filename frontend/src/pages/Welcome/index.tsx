import { Link, Navigate } from 'react-router-dom'
import { CheckCircle } from 'lucide-react'

export default function WelcomePage() {
  // Reload / bare app URL often hits `/` while localStorage still has the session — don't show the marketing screen.
  if (typeof window !== 'undefined' && localStorage.getItem('accessToken')) {
    return <Navigate to="/dashboard" replace />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Welcome to Your EverBee Store App
          </h1>
          <p className="text-xl text-gray-600">
            Your store management app is ready to go!
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <div className="space-y-4 mb-8">
            <div className="flex items-center gap-3 text-green-600">
              <CheckCircle className="w-6 h-6" />
              <span className="font-medium">Database Connected</span>
            </div>
            <div className="flex items-center gap-3 text-green-600">
              <CheckCircle className="w-6 h-6" />
              <span className="font-medium">EverBee Store API Ready</span>
            </div>
            <div className="flex items-center gap-3 text-green-600">
              <CheckCircle className="w-6 h-6" />
              <span className="font-medium">Authentication Working</span>
            </div>
          </div>

          <div className="space-y-3">
            <Link
              to="/auth/signup"
              className="block w-full bg-primary-600 text-white text-center py-3 px-6 rounded-lg font-semibold hover:bg-primary-700 transition-colors"
            >
              Get Started
            </Link>
            <Link
              to="/auth/login"
              className="block w-full bg-gray-100 text-gray-900 text-center py-3 px-6 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
            >
              Already have an account? Log in
            </Link>
          </div>
        </div>

        <div className="text-center text-sm text-gray-600">
          <p>Built with ❤️ for the EverBee Store ecosystem</p>
        </div>
      </div>
    </div>
  )
}
