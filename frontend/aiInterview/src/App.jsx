import { useState } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import Register from './auth/components/rejister'
import Login from './auth/components/login'
import { AuthContext } from './auth/services/auth.context.jsx'

function App() {
  const [user, setUser] = useState(null)
  const [loading, setloading] = useState(false)

  return (
    <BrowserRouter>
      <AuthContext.Provider value={{ user, setUser, loading, setloading }}>
        <Routes>
          <Route path="/" element={<Navigate to="/register" replace />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="*" element={<Navigate to="/register" replace />} />
        </Routes>
      </AuthContext.Provider>
    </BrowserRouter>
  )
}

export default App