import React, { useState, useEffect } from 'react';
import { Menu, X, Home, Users, Package, ChevronRight, ChevronDown, Activity, Settings, LogOut, Calendar, ClipboardList, Pill, FileText, Building2 } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import '../styles/NavBar.css';

// Minimal styles for elements not covered by CSS
const styles = {
  loadingSpinner: {
    width: '16px',
    height: '16px',
    border: '2px solid #e5e7eb',
    borderTop: '2px solid #3b82f6',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  },
  iconActive: {
    color: '#3b82f6'
  },
  iconDefault: {
    color: '#94a3b8'
  },
  dropdownHeader: {
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    padding: '0.75rem 1rem',
    margin: '0 0.5rem 0.5rem 0.5rem',
    borderRadius: '8px',
    transition: 'all 0.2s ease',
    color: '#e2e8f0',
    fontSize: '0.9rem',
    fontWeight: '600',
    background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(29, 78, 216, 0.05))',
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: 'rgba(59, 130, 246, 0.2)',
    position: 'relative',
    overflow: 'hidden'
  },
  dropdownHeaderHovered: {
    background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(29, 78, 216, 0.08))',
    borderColor: 'rgba(59, 130, 246, 0.3)',
    transform: 'translateX(2px)'
  },
  dropdownHeaderOpen: {
    background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(29, 78, 216, 0.1))',
    borderColor: 'rgba(59, 130, 246, 0.4)',
    color: '#93c5fd'
  },
  dropdownIcon: {
    marginRight: '12px',
    color: '#3b82f6',
    padding: '4px',
    background: 'rgba(59, 130, 246, 0.1)',
    borderRadius: '6px'
  },
  dropdownChevron: {
    marginLeft: 'auto',
    transition: 'transform 0.3s ease',
    color: '#3b82f6',
    background: 'rgba(59, 130, 246, 0.1)',
    borderRadius: '4px',
    padding: '2px'
  },
  dropdownChevronOpen: {
    transform: 'rotate(180deg)'
  },
  dropdownContent: {
    overflow: 'hidden',
    transition: 'max-height 0.3s ease, opacity 0.3s ease',
    paddingLeft: '1rem',
    background: 'rgba(15, 23, 42, 0.3)',
    borderRadius: '0 0 8px 8px',
    margin: '0 0.5rem 0.5rem 0.5rem',
    borderLeft: '2px solid rgba(59, 130, 246, 0.3)'
  },
  dropdownContentClosed: {
    maxHeight: '0',
    opacity: '0'
  },
  dropdownContentOpen: {
    maxHeight: '200px',
    opacity: '1'
  }
};

const Sidebar = ({ isCollapsed, setIsCollapsed }) => {
  const location = useLocation();
  const [hoveredItem, setHoveredItem] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const [mohDropdownOpen, setMohDropdownOpen] = useState(false);
  const [hoveredDropdown, setHoveredDropdown] = useState(null);

  // Core menu items (available to all roles)
  const coreMenuItems = [
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
      icon: Activity,
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
      icon: ClipboardList,
      path: '/orders',
      roles: ['gorush', 'jpmc', 'moh']
    },
    {
      id: 'collection',
      label: 'Collection Dates',
      icon: Calendar,
      path: '/collection',
      roles: ['gorush', 'jpmc', 'moh']
    }
  ];

  // MOH specific menu items
  const mohMenuItems = [
    {
      id: 'moh',
      label: 'MOH Orders',
      icon: Pill,
      path: '/mohorders',
      roles: ['gorush']
    },
    {
      id: 'manifestviewer',
      label: 'MOH Forms',
      icon: FileText,
      path: '/manifestviewer',
      roles: ['gorush']
    },
    //     {
    //   id: 'wargaemas',
    //   label: 'Warga Emas',
    //   icon: FileText,
    //   path: '/wargaemas',
    //   roles: ['gorush']
    // }
  ];

  // Bottom menu items
  const bottomMenuItems = [
    {
      id: 'logout',
      label: 'Logout',
      icon: LogOut,
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
  const filteredCoreMenuItems = userRole ? coreMenuItems.filter(item => 
    item.roles.includes(userRole)
  ) : [];

  const filteredMohMenuItems = userRole ? mohMenuItems.filter(item => 
    item.roles.includes(userRole)
  ) : [];

  const filteredBottomMenuItems = userRole ? bottomMenuItems.filter(item => 
    item.roles.includes(userRole)
  ) : [];

  // Debug logs
  console.log('Current userRole:', userRole);
  console.log('Filtered core menu items count:', filteredCoreMenuItems.length);
  console.log('Filtered MOH menu items count:', filteredMohMenuItems.length);

  if (isLoading) {
    return (
      <div className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-header">
          <div style={{ 
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            color: '#94a3b8',
            fontSize: '14px'
          }}>
            <div style={styles.loadingSpinner}></div>
            Loading...
          </div>
        </div>
      </div>
    );
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
              style={{ height: '40px', width: 'auto', objectFit: 'contain' }}
            />
          </div>
          <button 
            className="toggle-btn"
            onClick={() => setIsCollapsed(!isCollapsed)}
          >
            {isCollapsed ? <Menu size={16} /> : <X size={16} />}
          </button>
        </div>
        <div className="menu-section" style={{ 
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#94a3b8',
          fontSize: '14px'
        }}>
          Please log in to access features
        </div>
      </div>
    );
  }

  // Updated handleLogout function
  const handleLogout = () => {
    console.log('Logging out...');
    
    // Clear all authentication data
    sessionStorage.removeItem('userRole');
    sessionStorage.removeItem('userSubRole');
    
    // Clear any other stored data if needed
    sessionStorage.clear();
    
    // Force a complete page reload to reset the app state
    window.location.href = window.location.origin;
  };

  // Get role display name
  const getRoleDisplayName = () => {
    switch(userRole) {
      case 'jpmc':
        return 'JPMC Portal';
      case 'moh':
        return 'MOH Portal';
      case 'gorush':
        return 'Go Rush Admin';
      default:
        return 'Portal Access';
    }
  };

  // Handle sidebar hover for collapsed state
  const handleSidebarMouseEnter = () => {
    if (isCollapsed) {
      setIsHovered(true);
    }
  };

  const handleSidebarMouseLeave = () => {
    if (isCollapsed) {
      setIsHovered(false);
    }
  };

  // Render menu section
  const renderMenuSection = (items, title = null) => {
    if (items.length === 0) return null;

    return (
      <div className="menu">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname.includes(item.path);
          const isItemHovered = hoveredItem === item.id;
          
          return (
            <Link
              to={item.path}
              key={item.id}
              className={`menu-item ${isActive ? 'active' : ''} ${isItemHovered ? 'hovered' : ''}`}
              onMouseEnter={() => setHoveredItem(item.id)}
              onMouseLeave={() => setHoveredItem(null)}
              title={item.label}
            >
              <div className="menu-item-content">
                <div className="icon-wrapper">
                  <Icon 
                    size={18} 
                    style={isActive ? styles.iconActive : styles.iconDefault} 
                  />
                </div>
                <span className="label">{item.label}</span>
                <div className="menu-item-end">
                  {item.badge && (
                    <span className="badge">{item.badge}</span>
                  )}
                  <ChevronRight size={12} className="chevron" />
                </div>
              </div>
              {isActive && <div className="active-indicator"></div>}
              {isItemHovered && !isActive && <div className="hover-indicator"></div>}
            </Link>
          );
        })}
      </div>
    );
  };

  // Render MOH dropdown section
  const renderMohDropdown = (items) => {
    if (items.length === 0) return null;

    const isDropdownHovered = hoveredDropdown === 'moh';

    return (
      <div className="menu">
        {/* Dropdown Header */}
        <div
          style={{
            ...styles.dropdownHeader,
            ...(isDropdownHovered ? styles.dropdownHeaderHovered : {}),
            ...(mohDropdownOpen ? styles.dropdownHeaderOpen : {})
          }}
          onClick={() => setMohDropdownOpen(!mohDropdownOpen)}
          onMouseEnter={() => setHoveredDropdown('moh')}
          onMouseLeave={() => setHoveredDropdown(null)}
          title={isCollapsed && !isHovered ? 'MOH Services' : ''}
        >
          {/* Subtle background gradient effect */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(90deg, rgba(59, 130, 246, 0.05), transparent)',
            opacity: isDropdownHovered ? 1 : 0,
            transition: 'opacity 0.2s ease'
          }} />
          
          <Building2 size={18} style={styles.dropdownIcon} />
          {(!isCollapsed || isHovered) && (
            <>
              <span style={{ position: 'relative', zIndex: 1 }}>
                MOH Services
                <span style={{
                  marginLeft: '8px',
                  fontSize: '0.7rem',
                  opacity: 0.7,
                  fontWeight: '400'
                }}>
                  ({items.length})
                </span>
              </span>
              <ChevronDown 
                size={16} 
                style={{
                  ...styles.dropdownChevron,
                  ...(mohDropdownOpen ? styles.dropdownChevronOpen : {}),
                  position: 'relative',
                  zIndex: 1
                }}
              />
            </>
          )}
        </div>

        {/* Dropdown Content */}
        {(!isCollapsed || isHovered) && (
          <div
            style={{
              ...styles.dropdownContent,
              ...(mohDropdownOpen ? styles.dropdownContentOpen : styles.dropdownContentClosed)
            }}
          >
            {mohDropdownOpen && items.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname.includes(item.path);
              const isItemHovered = hoveredItem === item.id;
              
              return (
                <Link
                  to={item.path}
                  key={item.id}
                  className={`menu-item ${isActive ? 'active' : ''} ${isItemHovered ? 'hovered' : ''}`}
                  onMouseEnter={() => setHoveredItem(item.id)}
                  onMouseLeave={() => setHoveredItem(null)}
                  title={item.label}
                  style={{ 
                    marginBottom: '0.25rem',
                    background: 'rgba(30, 41, 59, 0.3)',
                    borderRadius: '6px'
                  }}
                >
                  <div className="menu-item-content" style={{ padding: '0.6rem 0.8rem' }}>
                    <div className="icon-wrapper" style={{ marginRight: '10px' }}>
                      <Icon 
                        size={16} 
                        style={isActive ? styles.iconActive : styles.iconDefault} 
                      />
                    </div>
                    <span className="label" style={{ fontSize: '0.85rem' }}>{item.label}</span>
                    <div className="menu-item-end">
                      {item.badge && (
                        <span className="badge">{item.badge}</span>
                      )}
                      <ChevronRight size={10} className="chevron" />
                    </div>
                  </div>
                  {isActive && <div className="active-indicator"></div>}
                  {isItemHovered && !isActive && <div className="hover-indicator"></div>}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  const sidebarClassName = `sidebar ${isCollapsed ? 'collapsed' : ''} ${isHovered ? 'hovered' : ''}`;

  return (
    <div 
      className={sidebarClassName}
      data-role={userRole}
      onMouseEnter={handleSidebarMouseEnter}
      onMouseLeave={handleSidebarMouseLeave}
    >
      {/* Header */}
      <div className="sidebar-header">
        <div className="brand">
          <img
            src="/gorushlogo.png"
            alt="Go Rush Logo"
            style={{ height: '40px', width: 'auto', objectFit: 'contain' }}
          />
        </div>

        <button 
          className="toggle-btn"
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          {isCollapsed ? <Menu size={18} /> : <X size={18} />}
        </button>
      </div>

      {/* User Role Indicator */}
      <div className="user-role-indicator">
        <Building2 size={14} style={{ marginRight: '8px' }} />
        {getRoleDisplayName()}
      </div>

      {/* Main Content */}
      <div className="menu-section">
        {/* Core Menu Items */}
        {renderMenuSection(filteredCoreMenuItems, 'General')}
        
        {/* MOH Specific Items Dropdown */}
        {renderMohDropdown(filteredMohMenuItems)}
      </div>

      {/* Bottom Menu */}
      <div className="bottom-menu">
        {filteredBottomMenuItems.map((item) => {
          const Icon = item.icon;
          const isItemHovered = hoveredItem === item.id;
          
          if (item.action === 'logout') {
            return (
              <div
                key={item.id}
                className={`menu-item ${isItemHovered ? 'hovered' : ''}`}
                onMouseEnter={() => setHoveredItem(item.id)}
                onMouseLeave={() => setHoveredItem(null)}
                onClick={handleLogout}
                title={item.label}
                style={{ cursor: 'pointer' }}
              >
                <div className="menu-item-content">
                  <div className="icon-wrapper">
                    <Icon size={18} style={{ color: '#ef4444' }} />
                  </div>
                  <span className="label" style={{ color: '#ef4444' }}>{item.label}</span>
                </div>
                {isItemHovered && <div className="hover-indicator"></div>}
              </div>
            );
          }
          
          return null;
        })}
      </div>

      {/* Footer */}
      <div className="sidebar-footer">
        <div className="footer-content">
          <div className="version">Version 1.0.0</div>
          <div className="copyright">
            © 2025 {userRole === 'jpmc' ? 'JPMC' : userRole === 'moh' ? 'Ministry of Health' : 'Go Rush Delivery'}
          </div>
        </div>
      </div>

      {/* Add loading animation styles */}
      <style jsx="true">{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default Sidebar;