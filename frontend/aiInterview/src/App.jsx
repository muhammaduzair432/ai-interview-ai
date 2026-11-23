import { useState } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import Register from './auth/components/rejister'
import Login from './auth/components/login'
import { AuthContext } from './auth/services/auth.context.jsx'
import Home from './interviewFeatures/components/home.jsx'
import Interview from './interviewFeatures/components/interview.jsx'
import { InterviewProvider } from './interviewFeatures/services/interview.context.jsx'

function App() {
  const [user, setUser] = useState(null)
  const [loading, setloading] = useState(false)

  return (
    <BrowserRouter>
      <AuthContext.Provider value={{ user, setUser, loading, setloading }}>
        <Routes>
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/" element={
            <InterviewProvider>
              <Home />
            </InterviewProvider>
          } />
          <Route path="/interview/:interviewId" element={
            <InterviewProvider>
              <Interview />
            </InterviewProvider>
          } />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthContext.Provider>
    </BrowserRouter>
  )
}

export default App