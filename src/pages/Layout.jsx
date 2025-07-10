import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/SideBar';

const Layout = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const userRole = sessionStorage.getItem('userRole');

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsCollapsed(true);
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f8fafc' }}>
      <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} userRole={userRole} />
      <div 
        style={{
          marginLeft: isCollapsed ? '80px' : '280px',
          transition: 'margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          minHeight: '100vh',
          width: `calc(100vw - ${isCollapsed ? '80px' : '280px'})`,
          overflow: 'auto',
          background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)'
        }}
      >
        <Outlet />
      </div>
    </div>
  );
};

export default Layout;