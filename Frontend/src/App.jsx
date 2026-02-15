import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { AdminProductsPage } from './pages/AdminProductsPage';
import { StorePage } from './pages/StorePage';
import { CartPage } from './pages/CartPage';
import { CheckoutPage } from './pages/CheckoutPage';
// Removed game/teacher pages; e-book store will use store/cart/checkout pages
import { ProfilePage } from './pages/ProfilePage';
import { useAuthStore } from './store';

const ProtectedRoute = ({ children }) => {
  const user = useAuthStore((state) => state.user);
  const token = localStorage.getItem('authToken');

  if (!user && !token) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

const RoleProtected = ({ children, roles = [] }) => {
  const user = useAuthStore((state) => state.user);
  // If user not in store yet, try to load from localStorage (happens before App.useEffect runs)
  let effectiveUser = user;
  if (!effectiveUser) {
    try {
      const saved = localStorage.getItem('user');
      if (saved) effectiveUser = JSON.parse(saved);
    } catch (err) {
      console.error('Failed to parse stored user', err);
    }
  }

  if (!effectiveUser) return <Navigate to="/login" replace />;
  if (!roles.includes(effectiveUser.role)) return <Navigate to="/dashboard" replace />;

  return children;
};

function App() {
  const { setUser } = useAuthStore();

  useEffect(() => {
    // Load user from localStorage on mount
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.error('Error loading saved user:', error);
      }
    }
  }, [setUser]);

  return (
    <ThemeProvider>
      <Router>
        <div className="flex flex-col min-h-screen">
          <Header />
          <main className="flex-1">
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <DashboardPage />
                  </ProtectedRoute>
                }
              />
              {/* Game/teacher routes removed for e-book store */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute>
                    <RoleProtected roles={["admin"]}>
                      <AdminDashboardPage />
                    </RoleProtected>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/products"
                element={
                  <ProtectedRoute>
                    <RoleProtected roles={["admin"]}>
                      <AdminProductsPage />
                    </RoleProtected>
                  </ProtectedRoute>
                }
              />
              <Route path="/store" element={<StorePage />} />
              <Route
                path="/cart"
                element={
                  <ProtectedRoute>
                    <CartPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/checkout"
                element={
                  <ProtectedRoute>
                    <CheckoutPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <ProfilePage />
                  </ProtectedRoute>
                }
              />
              {/* Profile edit and separate change-password pages removed; profile page is consolidated */}
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;
