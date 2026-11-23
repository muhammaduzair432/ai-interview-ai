import { useEffect, useState } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import Register from './auth/components/rejister'
import Login from './auth/components/login'
import { AuthContext } from './auth/services/auth.context.jsx'
import Home from './interviewFeatures/components/home.jsx'
import Interview from './interviewFeatures/components/interview.jsx'
import { InterviewProvider } from './interviewFeatures/services/interview.context.jsx'
import Protected from './auth/Protectcomponents/protected.jsx'
import { getCurrentUser } from './auth/services/auth.api.js'

function App() {
  const [user, setUser] = useState(null)
  const [loading, setloading] = useState(true)

  useEffect(() => {
    getCurrentUser()
      .then((data) => setUser(data.data || null))
      .catch(() => setUser(null))
      .finally(() => setloading(false))
  }, [])

  return (
    <BrowserRouter>
      <AuthContext.Provider value={{ user, setUser, loading, setloading }}>
        <Routes>
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/" element={
            <Protected>
              <InterviewProvider>
                <Home />
              </InterviewProvider>
            </Protected>
          } />
          <Route path="/interview/:interviewId" element={
            <Protected>
              <InterviewProvider>
                <Interview />
              </InterviewProvider>
            </Protected>
          } />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthContext.Provider>
    </BrowserRouter>
  )
}

export default App