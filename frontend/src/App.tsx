import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'
import Layout from './components/Layout'
import AdminRoute from './components/AdminRoute'
import AdminLayout from './components/admin/AdminLayout'
import Home from './pages/Home'
import Books from './pages/Books'
import BookDetail from './pages/BookDetail'
import About from './pages/About'
import Login from './pages/Login'
import Register from './pages/Register'
import Cart from './pages/Cart'
import Orders from './pages/Orders'
import OrderDetail from './pages/OrderDetail'
import Profile from './pages/Profile'
import MyRatings from './pages/MyRatings'
import AdminDashboard from './pages/admin/Dashboard'
import AdminBooks from './pages/admin/AdminBooks'
import CreateBook from './pages/admin/CreateBook'
import EditBook from './pages/admin/EditBook'
import AdminOrders from './pages/admin/AdminOrders'
import AdminCategories from './pages/admin/AdminCategories'
import AdminAuthors from './pages/admin/AdminAuthors'
import AdminPublishers from './pages/admin/AdminPublishers'
import AdminPaymentMethods from './pages/admin/AdminPaymentMethods'
import AdminUsers from './pages/admin/AdminUsers'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return !isAuthenticated ? <>{children}</> : <Navigate to="/" replace />
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="books" element={<Books />} />
          <Route path="books/:id" element={<BookDetail />} />
          <Route
            path="login"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />
          <Route
            path="register"
            element={
              <PublicRoute>
                <Register />
              </PublicRoute>
            }
          />
          <Route
            path="cart"
            element={
              <ProtectedRoute>
                <Cart />
              </ProtectedRoute>
            }
          />
          <Route
            path="orders"
            element={
              <ProtectedRoute>
                <Orders />
              </ProtectedRoute>
            }
          />
          <Route
            path="orders/:id"
            element={
              <ProtectedRoute>
                <OrderDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="my-ratings"
            element={
              <ProtectedRoute>
                <MyRatings />
              </ProtectedRoute>
            }
          />
          <Route path="about" element={<About />} />
        </Route>

        {/* Admin Routes with AdminLayout */}
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminLayout />
            </AdminRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="books" element={<AdminBooks />} />
          <Route path="books/create" element={<CreateBook />} />
          <Route path="books/:id/edit" element={<EditBook />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="categories" element={<AdminCategories />} />
          <Route path="authors" element={<AdminAuthors />} />
          <Route path="publishers" element={<AdminPublishers />} />
          <Route path="payment-methods" element={<AdminPaymentMethods />} />
          <Route path="users" element={<AdminUsers />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App

