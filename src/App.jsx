import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './pages/Layout';
import OrdersPage from './pages/OrdersPage'
import Dashboard from './pages/Dashboard';
import AllCustomersPage from './pages/Customers';
import Today from './pages/Today';
import CollectionDatesPage from './pages/Collection';
import OrderDetails from './pages/OrderDetails';
import PasswordModal from './components/PasswordModal';
import MohOrdersDashboard from './pages/MOH';
import ManifestViewer from './pages/Manifest';

function App() {
  const [userRole, setUserRole] = useState(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

   useEffect(() => {
    // Ping backend every 10 minutes (600,000ms)
    const interval = setInterval(() => {
      fetch('https://grpharmacyappserver.onrender.com/api/health')
        .then(() => console.log('Backend pinged successfully'))
        .catch(err => console.error('Ping failed:', err));
    }, 600_000); // 10 minutes

    // Clear interval on unmount
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Check if user has already authenticated in this session
    const storedRole = sessionStorage.getItem('userRole');
    if (storedRole) {
      setUserRole(storedRole);
      setShowPasswordModal(false);
    }
  }, []);

  const handlePasswordSuccess = (role) => {
    setUserRole(role);
    setShowPasswordModal(false);
    // Store in sessionStorage so it persists during the session but clears on browser close
    sessionStorage.setItem('userRole', role);
  };

  // Protected Route Component
  const ProtectedRoute = ({ children, allowedRoles = ['gorush', 'jpmc', 'moh'] }) => {
    if (!userRole) {
      return <Navigate to="/pharmacylogin" replace />;
    }
    
    if (!allowedRoles.includes(userRole)) {
      return <Navigate to="/collection" replace />;
    }
    
    return children;
  };

  return (
    <Router>
      <Routes>
        {/* Root redirect */}
        <Route path="/" element={<Navigate to="/pharmacylogin" replace />} />
        
        {/* Login route - shows password modal */}
        <Route path="/pharmacylogin" element={
          userRole ? (
            // If already logged in, redirect based on role
            userRole === 'jpmc' ? <Navigate to="/today" replace /> : <Navigate to="/dashboard" replace />
          ) : (
            <PasswordModal onSuccess={handlePasswordSuccess} />
          )
        } />
        
        {/* Protected routes under Layout */}
        <Route path="/orders" element={
          <Layout>
            <ProtectedRoute allowedRoles={['gorush', 'jpmc', 'moh']}>
              <OrdersPage />
            </ProtectedRoute>
          </Layout>
        } />
        <Route path="/dashboard" element={
          <Layout>
            <ProtectedRoute allowedRoles={['gorush']}>
              <Dashboard />
            </ProtectedRoute>
          </Layout>
        } />
        <Route path="/customers" element={
          <Layout>
            <ProtectedRoute allowedRoles={['gorush']}>
              <AllCustomersPage />
            </ProtectedRoute>
          </Layout>
        } />
        <Route path="/mohorders" element={
          <Layout>
            <ProtectedRoute allowedRoles={['gorush']}>
              <MohOrdersDashboard />
            </ProtectedRoute>
          </Layout>
        } />
        <Route path="/today" element={
          <Layout>
            <ProtectedRoute allowedRoles={['gorush', 'jpmc', 'moh']}>
              <Today />
            </ProtectedRoute>
          </Layout>
        } />
        <Route path="/collection" element={
          <Layout>
            <ProtectedRoute allowedRoles={['gorush', 'jpmc', 'moh']}>
              <CollectionDatesPage />
            </ProtectedRoute>
          </Layout>
        } />
        <Route path="/manifestviewer" element={
          <Layout>
            <ProtectedRoute allowedRoles={['gorush']}>
              <ManifestViewer />
            </ProtectedRoute>
          </Layout>
        } />
        <Route path="/orders/:id" element={
          <Layout>
            <ProtectedRoute allowedRoles={['gorush', 'jpmc', 'moh']}>
              <OrderDetails />
            </ProtectedRoute>
          </Layout>
        } />
        
        {/* Catch all unmatched routes */}
        <Route path="*" element={<Navigate to="/pharmacylogin" replace />} />
      </Routes>
    </Router>
  );
}

export default App;