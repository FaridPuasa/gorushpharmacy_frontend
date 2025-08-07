import React, { useState, useEffect } from 'react';
import { 
  User, Search, Calendar, Phone, Package, Eye, X, Users, HeartPulse, AlertCircle, Plus, Filter, RefreshCw,
  ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Info, MapPin, Mail, CreditCard
} from 'lucide-react';
import { Link } from 'react-router-dom';

const CustomersPage = () => {
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerOrders, setCustomerOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('orders');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [totalOrdersCount, setTotalOrdersCount] = useState(0);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [customersPerPage] = useState(10);

  // Calculate pagination
  const indexOfLastCustomer = currentPage * customersPerPage;
  const indexOfFirstCustomer = indexOfLastCustomer - customersPerPage;
  const currentCustomers = filteredCustomers.slice(indexOfFirstCustomer, indexOfLastCustomer);
  const totalPages = Math.ceil(filteredCustomers.length / customersPerPage);

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const nextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));
  const prevPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));
  const firstPage = () => setCurrentPage(1);
  const lastPage = () => setCurrentPage(totalPages);

  const apiCall = async (url, options = {}) => {
  const userRole = sessionStorage.getItem('userRole');
  
  const defaultHeaders = {
    'Content-Type': 'application/json',
    'X-User-Role': userRole || 'jpmc'
  };

  const config = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers
    }
  };

  return fetch(url, config);
};

  // Reset to first page when search term changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // Styles
  const styles = {
    pageContainer: {
      minHeight: '100vh',
      backgroundColor: '#f8fafc'
    },
    contentContainer: {
      padding: '2rem',
      maxWidth: '1440px',
      margin: '0 auto'
    },
    card: {
      backgroundColor: 'white',
      borderRadius: '12px',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
      padding: '2rem',
      border: '1px solid #e2e8f0',
      marginBottom: '2rem'
    },
    customerCard: {
      backgroundColor: 'white',
      borderRadius: '12px',
      boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
      padding: '1.5rem',
      border: '1px solid #e2e8f0',
      transition: 'all 0.2s ease',
      ':hover': {
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        borderColor: '#bfdbfe',
        transform: 'translateY(-2px)'
      }
    },
    heading1: {
      fontSize: '2rem',
      fontWeight: '700',
      color: '#1e293b',
      marginBottom: '0.5rem'
    },
    heading2: {
      fontSize: '1.5rem',
      fontWeight: '600',
      color: '#1e293b',
      marginBottom: '1rem'
    },
    heading3: {
      fontSize: '1.25rem',
      fontWeight: '600',
      color: '#1e293b',
      marginBottom: '1rem'
    },
    paragraph: {
      color: '#475569',
      fontSize: '1rem',
      lineHeight: '1.5'
    },
    smallText: {
      color: '#64748b',
      fontSize: '0.875rem'
    },
    primaryButton: {
      background: 'linear-gradient(to right, #3b82f6, #6366f1)',
      color: 'white',
      padding: '0.75rem 1.5rem',
      borderRadius: '8px',
      fontWeight: '600',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '0.5rem',
      transition: 'all 0.2s ease',
      ':hover': {
        background: 'linear-gradient(to right, #2563eb, #4f46e5)',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
      }
    },
    secondaryButton: {
      backgroundColor: 'white',
      color: '#3b82f6',
      padding: '0.75rem 1.5rem',
      borderRadius: '8px',
      fontWeight: '500',
      border: '1px solid #e2e8f0',
      transition: 'all 0.2s ease',
      ':hover': {
        backgroundColor: '#f8fafc',
        borderColor: '#bfdbfe'
      }
    },
    searchInput: {
      width: '100%',
      padding: '0.875rem 1rem 0.875rem 3rem',
      fontSize: '1rem',
      border: '1px solid #e2e8f0',
      borderRadius: '8px',
      backgroundColor: '#f8fafc',
      transition: 'all 0.2s ease',
      ':focus': {
        outline: 'none',
        borderColor: '#93c5fd',
        backgroundColor: 'white',
        boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)'
      },
      '::placeholder': {
        color: '#94a3b8'
      }
    },
    spinner: {
      width: '2.5rem',
      height: '2.5rem',
      border: '3px solid #e0e7ff',
      borderTopColor: '#3b82f6',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite'
    },
    modalOverlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.7)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem',
      zIndex: 50
    },
    modalContent: {
      backgroundColor: 'white',
      borderRadius: '12px',
      width: '100%',
      maxWidth: '80rem',
      maxHeight: '90vh',
      overflow: 'hidden',
      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
    },
    modalHeader: {
      background: 'linear-gradient(to right, #3b82f6, #6366f1)',
      padding: '1.5rem 2rem',
      color: 'white'
    },
    flexCenter: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },
    flexBetween: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    },
    flexCol: {
      display: 'flex',
      flexDirection: 'column'
    },
    grid: {
      display: 'grid'
    },
    gap: {
      gap: '0.75rem'
    },
    gapMd: {
      gap: '1rem'
    },
    gapLg: {
      gap: '1.5rem'
    },
    mb: {
      marginBottom: '0.75rem'
    },
    mbMd: {
      marginBottom: '1rem'
    },
    mbLg: {
      marginBottom: '1.5rem'
    },
    p: {
      padding: '0.75rem'
    },
    pMd: {
      padding: '1rem'
    },
    pLg: {
      padding: '1.5rem'
    },
    rounded: {
      borderRadius: '6px'
    },
    roundedLg: {
      borderRadius: '8px'
    },
    roundedXl: {
      borderRadius: '12px'
    },
    shadowXs: {
      boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
    },
    shadowSm: {
      boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)'
    },
    badge: {
      display: 'inline-flex',
      alignItems: 'center',
      padding: '0.25rem 0.75rem',
      borderRadius: '9999px',
      fontSize: '0.75rem',
      fontWeight: '600',
      textTransform: 'capitalize'
    },
    badgePrimary: {
      backgroundColor: '#dbeafe',
      color: '#1e40af'
    },
    badgeSuccess: {
      backgroundColor: '#dcfce7',
      color: '#166534'
    },
    badgeWarning: {
      backgroundColor: '#fef3c7',
      color: '#92400e'
    },
    badgeDanger: {
      backgroundColor: '#fee2e2',
      color: '#991b1b'
    },
    badgeInfo: {
      backgroundColor: '#e0f2fe',
      color: '#0369a1'
    },
    paginationContainer: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      gap: '0.5rem',
      marginTop: '2rem'
    },
    paginationButton: {
      padding: '0.5rem 0.75rem',
      borderRadius: '6px',
      border: '1px solid #e2e8f0',
      backgroundColor: 'white',
      color: '#3b82f6',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      ':hover': {
        backgroundColor: '#f1f5f9'
      },
      ':disabled': {
        backgroundColor: '#f8fafc',
        color: '#cbd5e1',
        cursor: 'not-allowed',
        borderColor: '#e2e8f0'
      }
    },
    activePageButton: {
      backgroundColor: '#3b82f6',
      color: 'white',
      borderColor: '#3b82f6',
      ':hover': {
        backgroundColor: '#2563eb',
        borderColor: '#2563eb'
      }
    },
    paginationInfo: {
      color: '#64748b',
      fontSize: '0.875rem',
      margin: '0 1rem'
    },
    pageNumbers: {
      display: 'flex',
      gap: '0.25rem'
    },
    pageNumberButton: {
      padding: '0.5rem 0.75rem',
      borderRadius: '6px',
      border: '1px solid #e2e8f0',
      backgroundColor: 'white',
      color: '#3b82f6',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      ':hover': {
        backgroundColor: '#f1f5f9'
      }
    }
  };

const fetchCustomers = async () => {
  try {
    setLoading(true);
    setIsRefreshing(true);
    setError(null);
    
    // Get user role from sessionStorage
    const userRole = sessionStorage.getItem('userRole');
    
    const customersResponse = await fetch('https://grpharmacyappserver.onrender.com/api/customers', {
      headers: { 
        'Content-Type': 'application/json',
        'X-User-Role': userRole || 'jpmc'
      }
    });
    
    if (!customersResponse.ok) throw new Error(`HTTP error! status: ${customersResponse.status}`);
    
    const customersData = await customersResponse.json();
    
    // Fetch orders count - NOW WITH USER ROLE HEADER
    const ordersResponse = await fetch('https://grpharmacyappserver.onrender.com/api/orders', {
      headers: {
        'Content-Type': 'application/json',
        'X-User-Role': userRole || 'jpmc'
      }
    });
    
    if (!ordersResponse.ok) throw new Error(`HTTP error! status: ${ordersResponse.status}`);
    const ordersData = await ordersResponse.json();
    
    // Process data
    const uniqueCustomers = customersData.reduce((acc, current) => {
      const x = acc.find(item => item.patientNumber === current.patientNumber);
      if (!x) return acc.concat([current]);
      return acc;
    }, []);
    
    setCustomers(uniqueCustomers);
    setFilteredCustomers(uniqueCustomers);
    setTotalOrdersCount(ordersData.length); // Add this state variable
    
  } catch (err) {
    setError(err.message);
    console.error("Error fetching data:", err);
  } finally {
    setLoading(false);
    setIsRefreshing(false);
  }
};

  useEffect(() => {
    fetchCustomers();
  }, []);

  // Filter customers
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredCustomers(customers);
    } else {
      const filtered = customers.filter(customer =>
        customer.receiverName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.patientNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.receiverPhoneNumber?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredCustomers(filtered);
    }
  }, [searchTerm, customers]);

  const userRole = sessionStorage.getItem('userRole');

const fetchCustomerOrders = async (customer) => {
  try {
    setOrdersLoading(true);
    setError(null);
    
    const response = await apiCall(`https://grpharmacyappserver.onrender.com/api/customers/${customer.patientNumber}/orders`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    setCustomerOrders(data);
  } catch (err) {
    setError(err.message);
    console.error("Error fetching orders:", err);
  } finally {
    setOrdersLoading(false);
  }
};

  const handleViewCustomer = (customer) => {
    setSelectedCustomer(customer);
    setShowModal(true);
    setActiveTab('orders');
    fetchCustomerOrders(customer);
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  // Format currency for display
  const formatCurrency = (amount) => {
    if (!amount) return '$0.00';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  // Generate unique key for customers
  const generateCustomerKey = (customer, index) => {
    return customer._id || `${customer.patientNumber}-${index}`;
  };

  if (loading) {
    return (
      <div style={{ ...styles.flexCol, ...styles.flexCenter, height: '80vh' }}>
        <div style={{ position: 'relative' }}>
          <div style={{ ...styles.spinner }}></div>
          <div style={{ position: 'absolute', inset: 0, ...styles.flexCenter }}>
            <HeartPulse style={{ width: '1.5rem', height: '1.5rem', color: '#3b82f6' }} />
          </div>
        </div>
        <p style={{ marginTop: '1.5rem', color: '#1e293b', fontWeight: '600', fontSize: '1.125rem' }}>
          Loading Patient Records
        </p>
        <p style={{ fontSize: '0.875rem', color: '#64748b', marginTop: '0.5rem' }}>
          Gathering the latest patient data...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ ...styles.flexCol, ...styles.flexCenter, height: '80vh' }}>
        <div style={{ 
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '2rem',
          maxWidth: '28rem',
          textAlign: 'center',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          border: '1px solid #fecaca'
        }}>
          <div style={{ 
            width: '4rem',
            height: '4rem',
            backgroundColor: '#fee2e2',
            borderRadius: '50%',
            ...styles.flexCenter,
            margin: '0 auto',
            marginBottom: '1rem'
          }}>
            <AlertCircle style={{ width: '2rem', height: '2rem', color: '#dc2626' }} />
          </div>
          <h3 style={{ 
            fontSize: '1.25rem',
            fontWeight: '600',
            color: '#991b1b',
            marginBottom: '0.5rem'
          }}>
            Connection Error
          </h3>
          <p style={{ color: '#dc2626', marginBottom: '1.5rem' }}>{error}</p>
          <button
            onClick={fetchCustomers}
            style={{
              background: 'linear-gradient(to right, #ef4444, #dc2626)',
              color: 'white',
              padding: '0.75rem 1.5rem',
              borderRadius: '8px',
              fontWeight: '600',
              transition: 'all 0.2s ease',
              ':hover': {
                background: 'linear-gradient(to right, #dc2626, #b91c1c)',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
              }
            }}
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.pageContainer}>
      <div style={styles.contentContainer}>
        {/* Page Header */}
        <div style={{ ...styles.flexBetween, marginBottom: '2rem' }}>
          <div>
            <h1 style={styles.heading1}>Patient Records</h1>
            <p style={{ color: '#64748b', fontSize: '1rem' }}>
              Manage and view comprehensive patient information
            </p>
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button
              style={styles.secondaryButton}
              onClick={fetchCustomers}
              disabled={isRefreshing}
            >
              <RefreshCw 
                style={{ 
                  width: '1rem', 
                  height: '1rem', 
                  marginRight: '0.5rem',
                  animation: isRefreshing ? 'spin 1s linear infinite' : 'none'
                }} 
              />
              Refresh
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div style={{ 
          display: 'grid',
          gridTemplateColumns: 'repeat(1, 1fr)',
          gap: '1rem',
          marginBottom: '2rem',
          '@media (minWidth: 640px)': {
            gridTemplateColumns: 'repeat(2, 1fr)'
          },
          '@media (minWidth: 1024px)': {
            gridTemplateColumns: 'repeat(4, 1fr)'
          }
        }}>
          <div style={{ 
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '1.5rem',
            border: '1px solid #e2e8f0',
            boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ 
                backgroundColor: '#dbeafe',
                padding: '0.75rem',
                borderRadius: '8px',
                color: '#1e40af'
              }}>
                <Users style={{ width: '1.5rem', height: '1.5rem' }} />
              </div>
              <div>
                <p style={{ color: '#64748b', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Total Patients</p>
                <h3 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1e293b' }}>
                  {customers.length}
                </h3>
              </div>
            </div>
          </div>
          
          <div style={{ 
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '1.5rem',
            border: '1px solid #e2e8f0',
            boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ 
                backgroundColor: '#ecfdf5',
                padding: '0.75rem',
                borderRadius: '8px',
                color: '#047857'
              }}>
                <Package style={{ width: '1.5rem', height: '1.5rem' }} />
              </div>
              <div>
                <p style={{ color: '#64748b', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Total Orders</p>
                <h3 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1e293b' }}>
                  {totalOrdersCount}
                </h3>
              </div>
            </div>
          </div>
        
        
        </div>

        {/* Search and Filter */}
        <div style={{ 
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '1.5rem',
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
          marginBottom: '2rem'
        }}>
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <div style={{ 
                position: 'absolute',
                top: 0,
                bottom: 0,
                left: 0,
                paddingLeft: '1rem',
                ...styles.flexCenter,
                pointerEvents: 'none'
              }}>
                <Search style={{ width: '1.25rem', height: '1.25rem', color: '#94a3b8' }} />
              </div>
              <input
                type="text"
                placeholder="Search patients by name, ID, or phone number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={styles.searchInput}
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  style={{
                    position: 'absolute',
                    top: 0,
                    bottom: 0,
                    right: 0,
                    paddingRight: '1rem',
                    ...styles.flexCenter,
                    color: '#94a3b8',
                    ':hover': {
                      color: '#64748b'
                    },
                    transition: 'color 0.2s ease'
                  }}
                >
                  <X style={{ width: '1.25rem', height: '1.25rem' }} />
                </button>
              )}
            </div>
          </div>
          {searchTerm && (
            <div style={{ 
              color: '#64748b',
              fontSize: '0.875rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <span>
                Showing {filteredCustomers.length} patient{filteredCustomers.length !== 1 ? 's' : ''} matching "{searchTerm}"
              </span>
              <button 
                onClick={() => setSearchTerm('')}
                style={{
                  color: '#3b82f6',
                  fontWeight: '500',
                  fontSize: '0.875rem',
                  ':hover': {
                    textDecoration: 'underline'
                  }
                }}
              >
                Clear search
              </button>
            </div>
          )}
        </div>

        {/* Customers Grid */}
        {currentCustomers.length > 0 ? (
          <>
            <div style={{ 
              display: 'grid',
              gridTemplateColumns: 'repeat(1, minmax(0, 1fr))',
              gap: '1.5rem',
              '@media (minWidth: 640px)': {
                gridTemplateColumns: 'repeat(2, minmax(0, 1fr))'
              },
              '@media (minWidth: 1024px)': {
                gridTemplateColumns: 'repeat(3, minmax(0, 1fr))'
              }
            }}>
              {currentCustomers.map((customer, index) => (
                <div 
                  key={generateCustomerKey(customer, index)}
                  style={{
                    backgroundColor: 'white',
                    borderRadius: '12px',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
                    padding: '1.5rem',
                    border: '1px solid #e2e8f0',
                    transition: 'all 0.2s ease',
                    ':hover': {
                      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                      borderColor: '#bfdbfe',
                      transform: 'translateY(-2px)'
                    }
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', marginBottom: '1.5rem' }}>
                    <div style={{ 
                      backgroundColor: '#dbeafe',
                      color: '#1e40af',
                      padding: '0.75rem',
                      borderRadius: '8px',
                      flexShrink: 0
                    }}>
                      <User style={{ width: '1.5rem', height: '1.5rem' }} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <h3 style={{ 
                        fontWeight: '600',
                        color: '#1e293b',
                        fontSize: '1.125rem',
                        marginBottom: '0.25rem'
                      }}>
                        {customer.receiverName || 'Unknown Patient'}
                      </h3>
                      <p style={{ 
                        fontSize: '0.875rem',
                        color: '#64748b',
                        fontWeight: '500',
                        marginBottom: '0.5rem'
                      }}>
                        ID: {customer.patientNumber || 'N/A'}
                      </p>
                      {customer.receiverPhoneNumber && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: '#475569' }}>
                          <Phone style={{ width: '1rem', height: '1rem', color: '#94a3b8' }} />
                          <span>{customer.receiverPhoneNumber}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div style={{ 
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                    gap: '0.75rem',
                    marginBottom: '1.5rem'
                  }}>
                  </div>

                  <button
                    onClick={() => handleViewCustomer(customer)}
                    style={{
                      width: '100%',
                      backgroundColor: 'white',
                      color: '#3b82f6',
                      padding: '0.75rem 1rem',
                      borderRadius: '8px',
                      fontWeight: '600',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem',
                      border: '1px solid #e2e8f0',
                      transition: 'all 0.2s ease',
                      ':hover': {
                        backgroundColor: '#f8fafc',
                        borderColor: '#bfdbfe'
                      }
                    }}
                  >
                    <Eye style={{ width: '1rem', height: '1rem' }} />
                    View Details
                  </button>
                </div>
              ))}
            </div>
            
            {/* Pagination Controls */}
            {filteredCustomers.length > customersPerPage && (
              <div style={styles.paginationContainer}>
                <button 
                  onClick={firstPage}
                  disabled={currentPage === 1}
                  style={styles.paginationButton}
                  aria-label="First page"
                >
                  <ChevronsLeft size={16} />
                </button>
                <button 
                  onClick={prevPage}
                  disabled={currentPage === 1}
                  style={styles.paginationButton}
                  aria-label="Previous page"
                >
                  <ChevronLeft size={16} />
                </button>
                
                <div style={styles.pageNumbers}>
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => paginate(pageNum)}
                        style={{
                          ...styles.pageNumberButton,
                          ...(currentPage === pageNum ? styles.activePageButton : {})
                        }}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
                
                <span style={styles.paginationInfo}>
                  Showing {indexOfFirstCustomer + 1}-{Math.min(indexOfLastCustomer, filteredCustomers.length)} of {filteredCustomers.length}
                </span>
                
                <button 
                  onClick={nextPage}
                  disabled={currentPage === totalPages}
                  style={styles.paginationButton}
                  aria-label="Next page"
                >
                  <ChevronRight size={16} />
                </button>
                <button 
                  onClick={lastPage}
                  disabled={currentPage === totalPages}
                  style={styles.paginationButton}
                  aria-label="Last page"
                >
                  <ChevronsRight size={16} />
                </button>
              </div>
            )}
          </>
        ) : (
          <div style={{ 
            backgroundColor: 'white',
            borderRadius: '12px',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
            padding: '3rem',
            textAlign: 'center',
            border: '1px solid #e2e8f0'
          }}>
            <div style={{ 
              width: '5rem',
              height: '5rem',
              backgroundColor: '#f1f5f9',
              borderRadius: '50%',
              ...styles.flexCenter,
              margin: '0 auto',
              marginBottom: '1.5rem'
            }}>
              <Users style={{ width: '2rem', height: '2rem', color: '#94a3b8' }} />
            </div>
            <h3 style={{ 
              fontSize: '1.25rem',
              fontWeight: '600',
              color: '#1e293b',
              marginBottom: '0.5rem'
            }}>
              {searchTerm ? 'No matching patients found' : 'No patient records available'}
            </h3>
            <p style={{ 
              color: '#64748b',
              marginBottom: '1.5rem',
              maxWidth: '32rem',
              marginLeft: 'auto',
              marginRight: 'auto'
            }}>
              {searchTerm ? 'Try adjusting your search query or filters' : 'Patient records will appear here once added to the system'}
            </p>
            {searchTerm ? (
              <button
                onClick={() => setSearchTerm('')}
                style={{
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '8px',
                  fontWeight: '600',
                  transition: 'all 0.2s ease',
                  ':hover': {
                    backgroundColor: '#2563eb',
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
                  }
                }}
              >
                Clear Search
              </button>
            ) : (
              <button
                onClick={fetchCustomers}
                style={{
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '8px',
                  fontWeight: '600',
                  transition: 'all 0.2s ease',
                  ':hover': {
                    backgroundColor: '#2563eb',
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
                  }
                }}
              >
                Refresh Data
              </button>
            )}
          </div>
        )}

        {/* Customer Details Modal */}
        {showModal && selectedCustomer && (
          <div 
            style={styles.modalOverlay}
            onClick={() => setShowModal(false)}
          >
            <div 
              style={styles.modalContent}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div style={styles.modalHeader}>
                <div style={{ ...styles.flexBetween, alignItems: 'flex-start' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.2)',
                      padding: '0.75rem',
                      borderRadius: '8px'
                    }}>
                      <User style={{ width: '1.5rem', height: '1.5rem' }} />
                    </div>
                    <div>
                      <h2 style={{ 
                        fontSize: '1.5rem',
                        fontWeight: '600',
                        marginBottom: '0.25rem'
                      }}>
                        {selectedCustomer.receiverName}
                      </h2>
                      <div style={{ 
                        display: 'flex',
                        flexWrap: 'wrap',
                        alignItems: 'center',
                        gap: '0.75rem'
                      }}>
                        <span style={{ 
                          color: '#bfdbfe',
                          fontWeight: '500',
                          fontSize: '0.875rem',
                          backgroundColor: 'rgba(255, 255, 255, 0.1)',
                          padding: '0.25rem 0.5rem',
                          borderRadius: '4px'
                        }}>
                          ID: {selectedCustomer.patientNumber}
                        </span>
                        {selectedCustomer.receiverPhoneNumber && (
                          <span style={{ 
                            color: '#bfdbfe',
                            fontWeight: '500',
                            fontSize: '0.875rem',
                            backgroundColor: 'rgba(255, 255, 255, 0.1)',
                            padding: '0.25rem 0.5rem',
                            borderRadius: '4px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.25rem'
                          }}>
                            <Phone style={{ width: '0.75rem', height: '0.75rem' }} />
                            {selectedCustomer.receiverPhoneNumber}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <button 
                    onClick={() => setShowModal(false)}
                    style={{
                      color: 'rgba(255, 255, 255, 0.8)',
                      ':hover': {
                        color: 'white',
                        backgroundColor: 'rgba(255, 255, 255, 0.2)'
                      },
                      padding: '0.5rem',
                      borderRadius: '6px',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <X style={{ width: '1.5rem', height: '1.5rem' }} />
                  </button>
                </div>
                <div style={{
                  display: 'flex',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
                  marginTop: '1.5rem',
                }}>
                  {[
                    { label: 'Orders', value: 'orders' },
                    { label: 'Details', value: 'details' },
                  ].map((tab) => (
                    <button
                      key={tab.value}
                      onClick={() => setActiveTab(tab.value)}
                      style={{
                        padding: '0.75rem 1.25rem',
                        fontWeight: 500,
                        fontSize: '0.875rem',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        marginRight: '0.25rem',
                        borderBottom:
                          activeTab === tab.value ? '2px solid white' : '2px solid transparent',
                        color: activeTab === tab.value ? 'white' : '#bfdbfe',
                        filter: activeTab === tab.value ? 'none' : 'brightness(0.9)',
                        opacity: activeTab === tab.value ? 1 : 0.8,
                      }}
                      onMouseEnter={(e) => {
                        if (activeTab !== tab.value) {
                          e.currentTarget.style.color = 'white';
                          e.currentTarget.style.opacity = 1;
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (activeTab !== tab.value) {
                          e.currentTarget.style.color = '#bfdbfe';
                          e.currentTarget.style.opacity = 0.8;
                        }
                      }}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Modal Body */}
              <div style={{ 
                padding: '2rem',
                overflowY: 'auto',
                maxHeight: 'calc(90vh - 9.375rem)'
              }}>
                {activeTab === 'orders' && (
                  <div>
                    <div style={{ ...styles.flexBetween, marginBottom: '1.5rem' }}>
                      <h3 style={{ 
                        ...styles.heading3,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                      }}>
                        <Package style={{ width: '1.25rem', height: '1.25rem', color: '#3b82f6' }} />
                        All Orders
                      </h3>
                    </div>
                    
                    {ordersLoading ? (
                      <div style={{ ...styles.flexCenter, padding: '3rem' }}>
                        <div style={{ position: 'relative' }}>
                          <div style={{ 
                            width: '2.5rem',
                            height: '2.5rem',
                            border: '3px solid #e0e7ff',
                            borderTopColor: '#3b82f6',
                            borderRadius: '50%',
                            animation: 'spin 1s linear infinite'
                          }}></div>
                          <div style={{ 
                            position: 'absolute',
                            inset: 0,
                            ...styles.flexCenter
                          }}>
                            <Package style={{ width: '1rem', height: '1rem', color: '#3b82f6' }} />
                          </div>
                        </div>
                        <span style={{ marginLeft: '1rem', color: '#475569', fontWeight: '500' }}>Loading orders...</span>
                      </div>
                    ) : customerOrders.length > 0 ? (
                      <div style={{ 
                        backgroundColor: 'white',
                        borderRadius: '12px',
                        border: '1px solid #e2e8f0',
                        overflow: 'hidden'
                      }}>
                        <div style={{ 
                          display: 'grid',
                          gridTemplateColumns: 'repeat(12, minmax(0, 1fr))',
                          gap: '1rem',
                          padding: '1rem',
                          backgroundColor: '#f8fafc',
                          borderBottom: '1px solid #e2e8f0',
                          fontWeight: '500',
                          fontSize: '0.75rem',
                          color: '#64748b',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px'
                        }}>
                          <div style={{ gridColumn: 'span 3' }}>Order #</div>
                          <div style={{ gridColumn: 'span 2' }}>Date</div>
                          <div style={{ gridColumn: 'span 2' }}>Status</div>
                          <div style={{ gridColumn: 'span 2' }}>Price</div>
                          <div style={{ gridColumn: 'span 1' }}></div>
                        </div>
                        
                        {customerOrders.map((order, index) => (
                          <div key={order._id || `order-${index}`} style={{ 
                            display: 'grid',
                            gridTemplateColumns: 'repeat(12, minmax(0, 1fr))',
                            gap: '1rem',
                            alignItems: 'center',
                            padding: '1rem',
                            borderBottom: '1px solid #f1f5f9',
                            transition: 'background-color 0.2s ease',
                            ':hover': {
                              backgroundColor: '#f8fafc'
                            },
                            ':lastChild': {
                              borderBottom: 'none'
                            }
                          }}>
                            <div style={{ 
                              gridColumn: 'span 3',
                              fontWeight: '500',
                              color: '#3b82f6',
                              fontSize: '0.875rem'
                            }}>
                              {order.doTrackingNumber || 'N/A'}
                            </div>
                            <div style={{ 
                              gridColumn: 'span 2',
                              fontSize: '0.875rem',
                              color: '#64748b'
                            }}>
                              {formatDate(order.creationDate)}
                            </div>
                            <div style={{ gridColumn: 'span 2' }}>
                              <span style={{
                                ...styles.badge,
                                ...(order.status === 'completed' ? styles.badgeSuccess : 
                                     order.status === 'pending' ? styles.badgeWarning : 
                                     order.status === 'cancelled' ? styles.badgeDanger : styles.badgeInfo)
                              }}>
                                {order.status || 'N/A'}
                              </span>
                            </div>
                            <div style={{ 
                              gridColumn: 'span 2',
                              fontWeight: '600',
                              color: '#1e293b'
                            }}>
                              {formatCurrency(order.totalPrice)}
                            </div>
                            <div style={{ 
                              gridColumn: 'span 1',
                              display: 'flex',
                              justifyContent: 'flex-end'
                            }}>
                              <Link 
                                to={`/orders/${order._id}`} 
                                style={{ 
                                  padding: '0.25rem',
                                  color: '#3b82f6',
                                  ':hover': {
                                    color: '#2563eb'
                                  }
                                }}
                              >
                                <Eye style={{ width: '1.25rem', height: '1.25rem' }} />
                              </Link>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div style={{ 
                        backgroundColor: '#f8fafc',
                        padding: '3rem',
                        textAlign: 'center',
                        borderRadius: '12px',
                        border: '1px dashed #e2e8f0'
                      }}>
                        <div style={{ 
                          width: '4rem',
                          height: '4rem',
                          backgroundColor: '#f1f5f9',
                          borderRadius: '50%',
                          ...styles.flexCenter,
                          margin: '0 auto',
                          marginBottom: '1rem'
                        }}>
                          <Package style={{ width: '1.5rem', height: '1.5rem', color: '#94a3b8' }} />
                        </div>
                        <h4 style={{ 
                          fontSize: '1.125rem',
                          fontWeight: '600',
                          color: '#1e293b',
                          marginBottom: '0.5rem'
                        }}>
                          No Order History
                        </h4>
                        <p style={{ color: '#64748b', fontSize: '0.875rem' }}>This patient hasn't placed any orders yet</p>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'details' && (
                  <div>
                    <h3 style={{ 
                      ...styles.heading3,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      marginBottom: '1.5rem'
                    }}>
                      <User style={{ width: '1.25rem', height: '1.25rem', color: '#3b82f6' }} />
                      Patient Details
                    </h3>
                    
                    <div style={{ 
                      backgroundColor: 'white',
                      borderRadius: '12px',
                      border: '1px solid #e2e8f0',
                      overflow: 'hidden'
                    }}>
                      <div style={{ 
                        display: 'grid',
                        gridTemplateColumns: 'repeat(1, minmax(0, 1fr))',
                        gap: '1.5rem',
                        padding: '1.5rem',
                        '@media (minWidth: 768px)': {
                          gridTemplateColumns: 'repeat(2, minmax(0, 1fr))'
                        }
                      }}>
                        <div style={{ ...styles.flexCol, gap: '1.5rem' }}>
                          <div>
                            <h4 style={{ 
                              fontSize: '0.75rem',
                              fontWeight: '500',
                              color: '#64748b',
                              marginBottom: '0.5rem',
                              textTransform: 'uppercase',
                              letterSpacing: '0.5px'
                            }}>
                              Personal Information
                            </h4>
                            <div style={{ ...styles.flexCol, gap: '1rem' }}>
                              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                                <User style={{ width: '1rem', height: '1rem', color: '#94a3b8', flexShrink: 0, marginTop: '0.25rem' }} />
                                <div>
                                  <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.25rem' }}>Full Name</p>
                                  <p style={{ fontWeight: '500', color: '#1e293b' }}>
                                    {selectedCustomer.receiverName || 'Not specified'}
                                  </p>
                                </div>
                              </div>
                              
                              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                                <Info style={{ width: '1rem', height: '1rem', color: '#94a3b8', flexShrink: 0, marginTop: '0.25rem' }} />
                                <div>
                                  <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.25rem' }}>Patient ID</p>
                                  <p style={{ fontWeight: '500', color: '#1e293b' }}>
                                    {selectedCustomer.patientNumber || 'Not specified'}
                                  </p>
                                </div>
                              </div>
                              
                              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                                <Phone style={{ width: '1rem', height: '1rem', color: '#94a3b8', flexShrink: 0, marginTop: '0.25rem' }} />
                                <div>
                                  <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.25rem' }}>Phone Number</p>
                                  <p style={{ fontWeight: '500', color: '#1e293b' }}>
                                    {selectedCustomer.receiverPhoneNumber || 'Not specified'}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          <div>
                            <h4 style={{ 
                              fontSize: '0.75rem',
                              fontWeight: '500',
                              color: '#64748b',
                              marginBottom: '0.5rem',
                              textTransform: 'uppercase',
                              letterSpacing: '0.5px'
                            }}>
                              Medical Information
                            </h4>
                            <div style={{ ...styles.flexCol, gap: '1rem' }}>
                              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                                <Calendar style={{ width: '1rem', height: '1rem', color: '#94a3b8', flexShrink: 0, marginTop: '0.25rem' }} />
                                <div>
                                  <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.25rem' }}>Date of Birth</p>
                                  <p style={{ fontWeight: '500', color: '#1e293b' }}>
                                    {selectedCustomer.dateOfBirth ? formatDate(selectedCustomer.dateOfBirth) : 'Not specified'}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div style={{ ...styles.flexCol, gap: '1.5rem' }}>
                          <div>
                            <h4 style={{ 
                              fontSize: '0.75rem',
                              fontWeight: '500',
                              color: '#64748b',
                              marginBottom: '0.5rem',
                              textTransform: 'uppercase',
                              letterSpacing: '0.5px'
                            }}>
                              Contact Information
                            </h4>
                            <div style={{ ...styles.flexCol, gap: '1rem' }}>
                              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                                <Mail style={{ width: '1rem', height: '1rem', color: '#94a3b8', flexShrink: 0, marginTop: '0.25rem' }} />
                                <div>
                                  <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.25rem' }}>Email</p>
                                  <p style={{ fontWeight: '500', color: '#1e293b' }}>
                                    {selectedCustomer.email || 'Not specified'}
                                  </p>
                                </div>
                              </div>
                              
                              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                                <MapPin style={{ width: '1rem', height: '1rem', color: '#94a3b8', flexShrink: 0, marginTop: '0.25rem' }} />
                                <div>
                                  <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.25rem' }}>Address</p>
                                  <p style={{ fontWeight: '500', color: '#1e293b' }}>
                                    {selectedCustomer.receiverAddress || 'Not specified'}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          <div>
                            <h4 style={{ 
                              fontSize: '0.75rem',
                              fontWeight: '500',
                              color: '#64748b',
                              marginBottom: '0.5rem',
                              textTransform: 'uppercase',
                              letterSpacing: '0.5px'
                            }}>
                              Order Statistics
                            </h4>
                            <div style={{ ...styles.flexCol, gap: '1rem' }}>
                              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                                <CreditCard style={{ width: '1rem', height: '1rem', color: '#94a3b8', flexShrink: 0, marginTop: '0.25rem' }} />
                                <div>
                                  <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.25rem' }}>Total Orders</p>
                                  <p style={{ fontWeight: '500', color: '#1e293b' }}>
                                    {selectedCustomer.totalOrders || 0}
                                  </p>
                                </div>
                              </div>
                              
                              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                                <Calendar style={{ width: '1rem', height: '1rem', color: '#94a3b8', flexShrink: 0, marginTop: '0.25rem' }} />
                                <div>
                                  <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.25rem' }}>Last Order</p>
                                  <p style={{ fontWeight: '500', color: '#1e293b' }}>
                                    {selectedCustomer.lastOrderDate ? formatDate(selectedCustomer.lastOrderDate) : 'N/A'}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div style={{ 
                        borderTop: '1px solid #e2e8f0',
                        padding: '1.5rem'
                      }}>
                        <h4 style={{ 
                          fontSize: '0.75rem',
                          fontWeight: '500',
                          color: '#64748b',
                          marginBottom: '0.75rem',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px'
                        }}>
                          Additional Notes
                        </h4>
                        <p style={{ 
                          color: '#475569',
                          fontStyle: selectedCustomer.additionalInfo ? 'normal' : 'italic',
                          backgroundColor: selectedCustomer.additionalInfo ? 'transparent' : '#f8fafc',
                          padding: selectedCustomer.additionalInfo ? '0' : '1rem',
                          borderRadius: selectedCustomer.additionalInfo ? '0' : '8px'
                        }}>
                          {selectedCustomer.additionalInfo || 'No additional notes provided'}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomersPage;