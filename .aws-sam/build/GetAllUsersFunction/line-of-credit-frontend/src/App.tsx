import React, { useState, useEffect, useCallback } from 'react'
import axios, { AxiosError } from 'axios'
import { AdminPage } from './components/AdminPage'
import { Application, ApplicationStatus, User, Transaction } from './types/application'

interface ApiErrorResponse {
  message: string;
}

function App() {
  const [userId, setUserId] = useState<string>('')
  const [user, setUser] = useState<User | null>(null)
  const [users, setUsers] = useState<User[]>([])
  const [applications, setApplications] = useState<Application[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null)
  const [repaymentAmount, setRepaymentAmount] = useState<number>(0)
  const [currentPage, setCurrentPage] = useState<'user' | 'admin'>('user')

  const API_BASE_URL = 'http://localhost:3000'

  const getAllUsers = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await axios.get(`${API_BASE_URL}/users`)
      setUsers(response.data)
    } catch (error) {
      console.error('Error fetching users:', error)
      setError('Failed to load users')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    getAllUsers()
  }, [getAllUsers])

  const getUser = useCallback(async (id: string) => {
    try {
      setLoading(true)
      setError(null)
      const response = await axios.get(`${API_BASE_URL}/users/${id}`)
      setUser(response.data)
      setUserId(id)
    } catch (error) {
      console.error('Error fetching user:', error)
      setError('Failed to load user data')
    } finally {
      setLoading(false)
    }
  }, [])

  const getUserApplications = useCallback(async (id: string) => {
    try {
      setLoading(true)
      setError(null)
      const response = await axios.get(`${API_BASE_URL}/users/${id}/applications`)
      setApplications(response.data)
    } catch (error) {
      console.error('Error fetching applications:', error)
      setError('Failed to load applications')
    } finally {
      setLoading(false)
    }
  }, [])

  const loginAsUser = async (user: User) => {
    setUserId(user._id)
    setUser(user)
    await getUserApplications(user._id)
  }

  const getApplicationTransactions = useCallback(async (applicationId: string) => {
    try {
      setLoading(true)
      setError('')
      const response = await axios.get(`${API_BASE_URL}/applications/${applicationId}/transactions`)
      setTransactions(response.data)
    } catch (err) {
      handleApiError(err as AxiosError<ApiErrorResponse>)
    } finally {
      setLoading(false)
    }
  }, [API_BASE_URL])

  useEffect(() => {
    if (selectedApplication?._id) {
      getApplicationTransactions(selectedApplication._id)
    }
  }, [selectedApplication, getApplicationTransactions])

  useEffect(() => {
    console.log('userId:', userId)
    if (userId) {
      getUser(userId)
    }
  }, [userId, getUser])

  const createTestApplication = async () => {
    if (!userId) return;
    try {
      setLoading(true);
      setError(null);
      await axios.post(`${API_BASE_URL}/applications`, {
        userId,
        requestedAmount: 1000,
        expressDelivery: false,
        tip: 0
      });
      await getUserApplications(userId);
    } catch (error) {
      console.error('Error creating application:', error);
      setError('Failed to create application');
    } finally {
      setLoading(false);
    }
  };

  const handleApiError = (err: AxiosError<ApiErrorResponse>) => {
    setError(err.response?.data?.message || 'An error occurred')
    console.error(err)
  }

  const disburseFunds = async (applicationId: string) => {
    try {
      setLoading(true)
      setError('')
      const response = await axios.post(`${API_BASE_URL}/applications/disburse`, {
        applicationId,
        amount: 5000,
        expressDelivery: true,
        tip: 100
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

  const repayFunds = async (applicationId: string) => {
    if (!repaymentAmount) return
    
    const application = applications.find(app => app._id === applicationId)
    if (!application) return

    // Validate repayment amount
    if (repaymentAmount <= 0) {
      setError('Repayment amount must be greater than 0')
      return
    }

    if (repaymentAmount > application.disbursedAmount) {
      setError('Repayment amount cannot exceed disbursed amount')
      return
    }

    // Optimistic update
    const optimisticApplication = {
      ...application,
      disbursedAmount: application.disbursedAmount - repaymentAmount,
      status: application.disbursedAmount - repaymentAmount === 0 
        ? ApplicationStatus.REPAID 
        : ApplicationStatus.OUTSTANDING
    }

    setApplications(applications.map(app => 
      app._id === applicationId ? optimisticApplication : app
    ))

    try {
      setLoading(true)
      setError('')
      const response = await axios.post(`${API_BASE_URL}/applications/repay`, {
        applicationId,
        amount: repaymentAmount
      })
      
      // Update with actual server response
      setApplications(applications.map(app => 
        app._id === applicationId ? response.data : app
      ))
      setRepaymentAmount(0)
    } catch (err) {
      // Revert optimistic update on error
      setApplications(applications.map(app => 
        app._id === applicationId ? application : app
      ))
      handleApiError(err as AxiosError<ApiErrorResponse>)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100" style={{ width: '100vw' }}>
      {/* Navigation */}
      <nav className="bg-gray-800 text-white p-4">
        <div className="w-full px-4 flex justify-between items-center">
          <h1 className="text-xl font-bold">Line of Credit Demo</h1>
          <div className="space-x-4">
            <button
              onClick={() => setCurrentPage('user')}
              className={`px-4 py-2 rounded ${
                currentPage === 'user' ? 'bg-blue-600' : 'hover:bg-gray-700'
              }`}
            >
              User Dashboard
            </button>
            <button
              onClick={() => setCurrentPage('admin')}
              className={`px-4 py-2 rounded ${
                currentPage === 'admin' ? 'bg-blue-600' : 'hover:bg-gray-700'
              }`}
            >
              Admin Dashboard
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="w-full px-4 py-6">
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

        {currentPage === 'admin' ? (
          <AdminPage />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full">
            {/* User Selection */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4">Select User</h2>
              <div className="grid grid-cols-1 gap-4">
                {users.map((user) => (
                  <div
                    key={user._id}
                    className={`border rounded-lg p-4 ${
                      userId === user._id ? 'border-blue-500 bg-blue-50' : ''
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">{user.firstName} {user.lastName}</p>
                        <p className="text-sm text-gray-500">Credit Limit: ${user.creditLimit}</p>
                      </div>
                      <button
                        onClick={() => loginAsUser(user)}
                        className={`px-3 py-1 rounded text-sm ${
                          userId === user._id
                            ? 'bg-green-500 text-white'
                            : 'bg-blue-500 text-white hover:bg-blue-600'
                        }`}
                      >
                        {userId === user._id ? 'Current User' : 'Login as User'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* User Information */}
            {user && (
              <div className="bg-white p-6 rounded-lg shadow lg:col-span-2">
                <h2 className="text-xl font-semibold mb-4">User Information</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Name</p>
                    <p className="font-medium">{user.firstName} {user.lastName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Credit Limit</p>
                    <p className="font-medium">${user.creditLimit}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Applications */}
            {user && (
              <div className="bg-white p-6 rounded-lg shadow lg:col-span-3">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">Applications</h2>
                  <button
                    onClick={createTestApplication}
                    disabled={loading}
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
                  >
                    Create Test Application
                  </button>
                </div>
                <div className="space-y-4">
                  {applications.map((application) => (
                    <div
                      key={application._id}
                      className="border rounded-lg p-4 hover:bg-gray-50"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">Application #{application._id.slice(-6)}</p>
                          <p className="text-sm text-gray-500">
                            Status: {application.status}
                          </p>
                          <p className="text-sm text-gray-500">
                            Amount: ${application.requestedAmount}
                          </p>
                          {application.status === ApplicationStatus.OUTSTANDING && (
                            <p className="text-sm text-gray-500">
                              Outstanding: ${application.disbursedAmount}
                            </p>
                          )}
                        </div>
                        <div className="space-x-2">
                          {application.status === ApplicationStatus.OPEN && (
                            <button
                              onClick={() => disburseFunds(application._id)}
                              disabled={loading}
                              className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600 disabled:opacity-50"
                            >
                              Disburse
                            </button>
                          )}
                          {application.status === ApplicationStatus.OUTSTANDING && (
                            <div className="flex items-center space-x-2">
                              <input
                                type="number"
                                value={repaymentAmount}
                                onChange={(e) => setRepaymentAmount(Number(e.target.value))}
                                className="border rounded px-2 py-1 w-32"
                                placeholder="Amount"
                                min="0"
                                max={application.disbursedAmount}
                              />
                              <button
                                onClick={() => repayFunds(application._id)}
                                disabled={loading || !repaymentAmount}
                                className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600 disabled:opacity-50"
                              >
                                Repay
                              </button>
                            </div>
                          )}
                          <div className="flex justify-center mt-2">
                            <button
                              onClick={() => {
                                setSelectedApplication(application);
                                getApplicationTransactions(application._id);
                              }}
                              className="bg-gray-500 text-white px-3 py-1 rounded text-sm hover:bg-gray-600"
                            >
                              View Transactions
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Transactions */}
            {selectedApplication && (
              <div className="bg-white p-6 rounded-lg shadow lg:col-span-3">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">Transactions for Application #{selectedApplication._id.slice(-6)}</h2>
                  <button
                    onClick={() => setSelectedApplication(null)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    Close
                  </button>
                </div>
                <div className="space-y-4">
                  {transactions.map((transaction) => (
                    <div key={transaction._id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium">{transaction.type}</p>
                          <p className="text-sm text-gray-500">
                            Amount: ${transaction.amount}
                          </p>
                        </div>
                        <p className="text-sm text-gray-500">
                          {new Date(transaction.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default App
