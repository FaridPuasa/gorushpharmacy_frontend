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
import WargaEmas from './pages/WargaEmas';
import MohOrdersNoFormDashboard from './pages/MOHnoForm';

function App() {
  const [userRole, setUserRole] = useState(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

   useEffect(() => {
    // Ping backend every 10 minutes (600,000ms)
    const interval = setInterval(() => {
      fetch('https://gorushpharmacy-server.onrender.com/api/health')
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
        {/* Login route - shows password modal */}
        <Route path="/pharmacylogin" element={
          userRole ? (
            // If already logged in, redirect based on role
            userRole === 'jpmc' ? <Navigate to="/today" replace /> : <Navigate to="/dashboard" replace />
          ) : (
            <PasswordModal onSuccess={handlePasswordSuccess} />
          )
        } />
        
        {/* Protected routes under Layout - now includes the root path */}
        <Route path="/" element={<Layout />}>
          <Route index element={
            userRole ? (
              userRole === 'jpmc' ? <Navigate to="/today" replace /> : <Navigate to="/dashboard" replace />
            ) : (
              <Navigate to="/pharmacylogin" replace />
            )
          } />
          <Route path="orders" element={
            <ProtectedRoute allowedRoles={['gorush', 'jpmc', 'moh']}>
              <OrdersPage />
            </ProtectedRoute>
          } />
          <Route path="dashboard" element={
            <ProtectedRoute allowedRoles={['gorush']}>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="customers" element={
            <ProtectedRoute allowedRoles={['gorush']}>
              <AllCustomersPage />
            </ProtectedRoute>
          } />
          <Route path="mohorders" element={
            <ProtectedRoute allowedRoles={['gorush']}>
              <MohOrdersDashboard />
            </ProtectedRoute>
          } />
          <Route path="mohnoform" element={
            <ProtectedRoute allowedRoles={['gorush']}>
              <MohOrdersNoFormDashboard />
            </ProtectedRoute>
          } />
          <Route path="today" element={
            <ProtectedRoute allowedRoles={['gorush', 'jpmc', 'moh']}>
              <Today />
            </ProtectedRoute>
          } />
          <Route path="collection" element={
            <ProtectedRoute allowedRoles={['gorush', 'jpmc', 'moh']}>
              <CollectionDatesPage />
            </ProtectedRoute>
          } />
          <Route path="manifestviewer" element={
            <ProtectedRoute allowedRoles={['gorush']}>
              <ManifestViewer />
            </ProtectedRoute>
          } />
          <Route path="wargaemas" element={
            <ProtectedRoute allowedRoles={['gorush']}>
              <WargaEmas />
            </ProtectedRoute>
          } />
          <Route path="orders/:id" element={
            <ProtectedRoute allowedRoles={['gorush', 'jpmc', 'moh']}>
              <OrderDetails />
            </ProtectedRoute>
          } />
        </Route>
        
        {/* Catch-all route for unmatched paths */}
        <Route path="*" element={<Navigate to="/pharmacylogin" replace />} />
      </Routes>
    </Router>
  );
}

export default App;