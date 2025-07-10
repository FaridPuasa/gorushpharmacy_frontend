import React, { useState, useEffect } from 'react';
import { Menu, X, Home, Users, Package, ChevronRight, Activity, Settings, LogOut } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import '../styles/NavBar.css';

const Sidebar = ({ isCollapsed, setIsCollapsed }) => {
  const location = useLocation();
  const [hoveredItem, setHoveredItem] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const allMenuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: Home,
      path: '/dashboard',
      badge: null,
      roles: ['gorush']
    },
    {
      id: 'today',
      label: 'Today',
      icon: Home,
      path: '/today',
      badge: null,
      roles: ['gorush', 'jpmc', 'moh']
    },
    {
      id: 'customers',
      label: 'All Customers',
      icon: Users,
      path: '/customers',
      roles: ['gorush']
    },
    {
      id: 'orders',
      label: 'All Orders',
      icon: Package,
      path: '/orders',
      roles: ['gorush', 'jpmc', 'moh']
    },
    {
      id: 'collection',
      label: 'Collection Dates',
      icon: Package,
      path: '/collection',
      roles: ['gorush', 'jpmc', 'moh']
    },
  ];

  const bottomMenuItems = [
    {
      id: 'logout',
      label: 'Logout',
      icon: LogOut,
      path: '/logout',
      action: 'logout',
      roles: ['gorush', 'jpmc', 'moh']
    }
  ];

  useEffect(() => {
    // Get user role from sessionStorage
    const role = sessionStorage.getItem('userRole');
    console.log('Raw role from sessionStorage:', role, typeof role);
    
    // Clean and validate the role
    if (role && role !== 'null' && role !== 'undefined' && role !== '[object Object]') {
      const cleanRole = role.toLowerCase().trim();
      console.log('Cleaned role:', cleanRole);
      
      // Validate against expected roles
      const validRoles = ['gorush', 'jpmc', 'moh'];
      if (validRoles.includes(cleanRole)) {
        setUserRole(cleanRole);
      } else {
        console.warn('Invalid role detected:', cleanRole);
        // Clear invalid role from storage
        sessionStorage.removeItem('userRole');
      }
    } else {
      console.warn('No valid role found in sessionStorage');
    }
    
    setIsLoading(false);
  }, []);

  // Filter menu items based on user role
  const menuItems = userRole ? allMenuItems.filter(item => 
    item.roles.includes(userRole)
  ) : [];

  const filteredBottomMenuItems = userRole ? bottomMenuItems.filter(item => 
    item.roles.includes(userRole)
  ) : [];

  // Debug logs
  console.log('Current userRole:', userRole);
  console.log('Filtered menu items count:', menuItems.length);
  console.log('Menu items:', menuItems.map(item => item.label));

  if (isLoading) {
    return <div className="sidebar-loading">Loading...</div>;
  }

  // If no valid role, show minimal sidebar
  if (!userRole) {
    return (
      <div className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-header">
          <div className="brand">
            <img
              src="/gorushlogo.png"
              alt="Go Rush Logo"
              style={{ 
                height: '40px', 
                width: 'auto', 
                objectFit: 'contain', 
                marginTop: '13px', 
                marginLeft: isCollapsed ? '8px' : '15px',
                transition: 'margin-left 0.3s ease'
              }}
            />
          </div>
          <button 
            className="toggle-btn"
            onClick={() => setIsCollapsed(!isCollapsed)}
            style={{
              minWidth: '40px',
              minHeight: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              borderRadius: '6px',
              transition: 'background-color 0.2s ease',
              marginRight: isCollapsed ? '8px' : '16px'
            }}
          >
            {isCollapsed ? <Menu size={20} /> : <X size={20} />}
          </button>
        </div>
        <div style={{ padding: '1rem', textAlign: 'center', color: '#666' }}>
          Please log in to access features
        </div>
      </div>
    );
  }

  const handleLogout = () => {
    sessionStorage.removeItem('userRole');
    sessionStorage.removeItem('userSubRole');
    window.location.reload(); // This will trigger the password modal again
  };

  // Get role display name
  const getRoleDisplayName = () => {
    switch(userRole) {
      case 'jpmc':
        return 'JPMC Access';
      case 'moh':
        return 'MOH Access';
      case 'gorush':
        return 'Go Rush Access';
      default:
        return 'Unknown Access';
    }
  };

  // Get role styling
  const getRoleStyle = () => {
    switch(userRole) {
      case 'jpmc':
        return {
          backgroundColor: '#fef3c7',
          color: '#92400e'
        };
      case 'moh':
        return {
          backgroundColor: '#ecfdf5',
          color: '#065f46'
        };
      case 'gorush':
        return {
          backgroundColor: '#dbeafe',
          color: '#1e40af'
        };
      default:
        return {
          backgroundColor: '#f3f4f6',
          color: '#374151'
        };
    }
  };

  return (
    <div className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      {/* Header */}
      <div className="sidebar-header">
        <div className="brand">
          <div>
            <img
              src="/gorushlogo.png"
              alt="Go Rush Logo"
              style={{ 
                height: '40px', 
                width: 'auto', 
                objectFit: 'contain', 
                marginTop: '13px', 
                marginLeft: isCollapsed ? '8px' : '15px',
                transition: 'margin-left 0.3s ease'
              }}
            />
          </div>
          {!isCollapsed && (
            <div className="brand-text">
              <span>
                {userRole === 'jpmc' ? '' : ''}
              </span>
            </div>
          )}
        </div>

        <button 
          className="toggle-btn"
          onClick={() => setIsCollapsed(!isCollapsed)}
          style={{
            minWidth: '40px',
            minHeight: '40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            borderRadius: '6px',
            transition: 'background-color 0.2s ease',
            marginRight: isCollapsed ? '8px' : '16px'
          }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = 'rgba(0, 0, 0, 0.05)';
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = 'transparent';
          }}
        >
          {isCollapsed ? <Menu size={20} /> : <X size={20} />}
        </button>
      </div>

      {/* User Role Indicator */}
      {!isCollapsed && (
        <div className="user-role-indicator" style={{
          padding: '0.5rem 1rem',
          margin: '0.5rem',
          borderRadius: '6px',
          fontSize: '0.75rem',
          fontWeight: '500',
          textAlign: 'center',
          ...getRoleStyle()
        }}>
          {getRoleDisplayName()}
        </div>
      )}

      {/* Main Menu */}
      <div className="menu-section">
        <nav className="menu">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname.includes(item.path);
            const isHovered = hoveredItem === item.id;
            
            return (
              <Link
                to={item.path}
                key={item.id}
                className={`menu-item ${isActive ? 'active' : ''} ${isHovered ? 'hovered' : ''}`}
                onMouseEnter={() => setHoveredItem(item.id)}
                onMouseLeave={() => setHoveredItem(null)}
                title={isCollapsed ? item.label : ''} // Show tooltip when collapsed
              >
                <div className="menu-item-content">
                  <div className="icon-wrapper">
                    <Icon size={20} />
                  </div>
                  {!isCollapsed && (
                    <>
                      <span className="label">{item.label}</span>
                      <div className="menu-item-end">
                        {item.badge && (
                          <span className="badge">{item.badge}</span>
                        )}
                        <ChevronRight size={14} className="chevron" />
                      </div>
                    </>
                  )}
                </div>
                {isActive && <div className="active-indicator"></div>}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom Menu */}
      <div className="bottom-menu">
        {filteredBottomMenuItems.map((item) => {
          const Icon = item.icon;
          const isHovered = hoveredItem === item.id;
          
          if (item.action === 'logout') {
            return (
              <button
                key={item.id}
                className={`menu-item ${isHovered ? 'hovered' : ''}`}
                onMouseEnter={() => setHoveredItem(item.id)}
                onMouseLeave={() => setHoveredItem(null)}
                onClick={handleLogout}
                title={isCollapsed ? item.label : ''} // Show tooltip when collapsed
                style={{
                  background: 'none',
                  border: 'none',
                  width: '100%',
                  textAlign: 'left',
                  cursor: 'pointer'
                }}
              >
                <div className="menu-item-content">
                  <div className="icon-wrapper">
                    <Icon size={20} />
                  </div>
                  {!isCollapsed && <span className="label">{item.label}</span>}
                </div>
              </button>
            );
          }
          
          return (
            <Link
              to={item.path}
              key={item.id}
              className={`menu-item ${isHovered ? 'hovered' : ''}`}
              onMouseEnter={() => setHoveredItem(item.id)}
              onMouseLeave={() => setHoveredItem(null)}
              title={isCollapsed ? item.label : ''} // Show tooltip when collapsed
            >
              <div className="menu-item-content">
                <div className="icon-wrapper">
                  <Icon size={20} />
                </div>
                {!isCollapsed && <span className="label">{item.label}</span>}
              </div>
            </Link>
          );
        })}
      </div>

      {/* Footer */}
      {!isCollapsed && (
        <div className="sidebar-footer">
          <div className="footer-content">
            <div className="version">v1.0.0</div>
            <div className="copyright">© 2025 {userRole === 'jpmc' ? 'JPMC' : userRole === 'moh' ? 'MOH' : 'Go Rush'}</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;