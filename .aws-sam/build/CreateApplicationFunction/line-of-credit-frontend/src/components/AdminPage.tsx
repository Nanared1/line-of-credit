import { useState, useEffect } from 'react'
import axios, { AxiosError } from 'axios'
import { Application, ApplicationStatus } from '../types/application'

interface ApiErrorResponse {
  message: string;
}

export function AdminPage() {
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>('')

  const API_BASE_URL = 'http://localhost:3000'

  useEffect(() => {
    loadApplications()
  }, [])

  const loadApplications = async () => {
    try {
      setLoading(true)
      setError('')
      const response = await axios.get(`${API_BASE_URL}/applications`, {
        headers: {
          'x-admin-token': 'admin_123' // This should be replaced with a proper admin token
        }
      })
      console.log('Response:', response.data) 
      setApplications(response.data)
    } catch (err) {
      handleApiError(err as AxiosError<ApiErrorResponse>)
    } finally {
      setLoading(false)
    }
  }

  const handleApiError = (err: AxiosError<ApiErrorResponse>) => {
    setError(err.response?.data?.message || 'An error occurred')
    console.error(err)
  }

  const rejectApplication = async (applicationId: string) => {
    try {
      setLoading(true)
      setError('')
      const response = await axios.post(`${API_BASE_URL}/applications/reject`, {
        applicationId,
        adminId: 'admin_123'
      })
      setApplications(applications.map(app => 
        app._id === applicationId ? response.data : app
      ))
    } catch (err) {
      handleApiError(err as AxiosError<ApiErrorResponse>)
    } finally {
      setLoading(false)
    }
  }

  const pendingApplications = applications.filter(app => app.status === ApplicationStatus.OPEN)

  return (
    <div className="w-full px-4 py-6">
      <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {loading && (
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
        </div>
      )}

      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Pending Applications</h2>
        {pendingApplications.length > 0 ? (
          <div className="space-y-4">
            {pendingApplications.map(app => (
              <div key={app._id} className="p-4 border rounded">
                <p><strong>Application ID:</strong> {app._id}</p>
                <p><strong>User ID:</strong> {app.userId}</p>
                <p><strong>Status:</strong> {app.status}</p>
                <p><strong>Requested Amount:</strong> ${app.requestedAmount.toLocaleString()}</p>
                <p><strong>Express Delivery:</strong> {app.expressDelivery ? 'Yes' : 'No'}</p>
                <p><strong>Tip:</strong> ${app.tip.toLocaleString()}</p>
                <p><strong>Created:</strong> {new Date(app.createdAt).toLocaleDateString()}</p>
                
                <div className="mt-2">
                  <button
                    onClick={() => rejectApplication(app._id)}
                    className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                  >
                    Reject Application
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p>No pending applications found</p>
        )}
      </div>
    </div>
  )
} 