import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Navbar from './components/Navbar'
import Products from './pages/Products'
import Login from './pages/Login'
import Register from './pages/Register'
import Searches from './pages/Searches'
import Admin from './pages/Admin'

function ProtectedRoute({ children }) {
  const { token } = useAuth()
  return token ? children : <Navigate to="/login" />
}

function AdminRoute({ children }) {
  const { token, isAdmin } = useAuth()
  if (!token) return <Navigate to="/login" />
  if (!isAdmin) return <Navigate to="/" />
  return children
}

function App() {
  return (
    <div className="min-h-screen bg-stone-50">
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-8">
        <Routes>
          <Route path="/" element={<Products />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/searches" element={<ProtectedRoute><Searches /></ProtectedRoute>} />
          <Route path="/admin" element={<AdminRoute><Admin /></AdminRoute>} />
        </Routes>
      </main>
    </div>
  )
}

export default App
