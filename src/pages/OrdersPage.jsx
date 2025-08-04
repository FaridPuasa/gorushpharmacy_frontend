import { useEffect, useState } from 'react';
import { Search, Calendar, Filter, X, Package, Users, CreditCard, Clock, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [qbStartDate, setQbStartDate] = useState(null);
  const [qbEndDate, setQbEndDate] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');
  const [selectedDeliveryType, setSelectedDeliveryType] = useState('');
  const [startAgingDays, setStartAgingDays] = useState('');
  const [endAgingDays, setEndAgingDays] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const navigate = useNavigate();
  const [selectedStatus, setSelectedStatus] = useState('');
  const [userRole, setUserRole] = useState(null);
  const [userSubrole, setUserSubrole] = useState(null);
  const [isRoleLoaded, setIsRoleLoaded] = useState(false);
  const [productFilter, setProductFilter] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

 

  const LoadingSpinner = () => (
  <div style={{
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000
  }}>
    <div style={{
      border: '4px solid #f3f3f3',
      borderTop: '4px solid #3b82f6',
      borderRadius: '50%',
      width: '40px',
      height: '40px',
      animation: 'spin 1s linear infinite'
    }}></div>
    <style>{`
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `}</style>
  </div>
);

  const formatDate = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

const statusColors = {
  pending: { bg: '#e0e7ff', text: '#3730a3' },
  'in progress': { bg: '#fef3c7', text: '#92400e' },
  ready: { bg: '#dbeafe', text: '#1e40af' },
  collected: { bg: '#dcfce7', text: '#166534' },
  completed: { bg: '#dcfce7', text: '#065f46' },
  cancelled: { bg: '#fee2e2', text: '#991b1b' },
  default: { bg: '#f3f4f6', text: '#6b7280' } // Added default style
};

const getStatusStyle = (status) => {
  if (!status) return statusColors.default;
  
  const lowerStatus = status.toLowerCase();
  return statusColors[lowerStatus] || statusColors.default;
};

  // Load user role first
  useEffect(() => {
    const role = sessionStorage.getItem('userRole');
    setUserRole(role || 'jpmc'); // Set default if no role found
    setIsRoleLoaded(true); // Mark role as loaded
  }, []);

  useEffect(() => {
  const role = sessionStorage.getItem('userRole');
  const subrole = sessionStorage.getItem('userSubrole'); // Add this line
  setUserRole(role || 'jpmc');
  setUserSubrole(subrole || null); // Add this line
  setIsRoleLoaded(true);
}, []);

useEffect(() => {
  const role = sessionStorage.getItem('userRole');
  const subrole = sessionStorage.getItem('userSubrole');
  setUserRole(role || 'jpmc');
  setUserSubrole(subrole || null);
  setIsRoleLoaded(true);
}, []);

useEffect(() => {
  if (!isRoleLoaded) return; 

  setIsLoading(true); 
  fetch('http://localhost:5050/api/orders', {
    headers: {
      'Content-Type': 'application/json',
      'X-User-Role': userRole || 'jpmc'
    }
  })
    .then(res => res.json())
    .then(data => {
      // First filter based on user role
      let roleFilteredData = data;
      if (userRole === 'jpmc') {
        roleFilteredData = data.filter(order => order.product === 'pharmacyjpmc');
      } else if (userRole === 'moh') {
        roleFilteredData = data.filter(order => order.product === 'pharmacymoh');
      }

      // Then process the data
      const processedData = roleFilteredData.map(order => {
        const isCollected = order.goRushStatus?.toLowerCase() === 'collected';
        const isCancelled = order.goRushStatus?.toLowerCase() === 'cancelled';
        const isCompleted = ['cancelled', 'collected'].includes(order.pharmacyStatus?.toLowerCase());
        return {
          ...order,
          agingDays: isCollected ? 'collected' : 
                    isCancelled ? 'cancelled' :
                    (!isCompleted && order.creationDate ?
                      Math.floor((new Date() - new Date(order.creationDate)) / (1000 * 60 * 60 * 24)) : null)
        };
      });

      setOrders(processedData);
      setFilteredOrders(processedData);
    })
    .catch(err => console.error("Error fetching orders:", err))
    .finally(() => setIsLoading(false));
}, [isRoleLoaded, userRole]);


  useEffect(() => {
    let filtered = [...orders];

    if (userRole === 'gorush' && productFilter) {
      filtered = filtered.filter(order => order.product === productFilter);
    }

    // Search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(order => 
        (order.doTrackingNumber && order.doTrackingNumber.toLowerCase().includes(search)) ||
        (order.receiverName && order.receiverName.toLowerCase().includes(search)) ||
        (order.receiverPhoneNumber && order.receiverPhoneNumber.toLowerCase().includes(search)) ||
        (order.icPassNum && order.icPassNum.toLowerCase().includes(search)) ||
        (order.patientNumber && order.patientNumber.toLowerCase().includes(search)) ||
        (order.receiverAddress && order.receiverAddress.toLowerCase().includes(search))
      );
    }

    // Status filter
    if (selectedStatus) {
      filtered = filtered.filter(order => {
        // Check both pharmacyStatus and goRushStatus (adjust as needed)
        return order.pharmacyStatus?.toLowerCase() === selectedStatus.toLowerCase() || 
               order.goRushStatus?.toLowerCase() === selectedStatus.toLowerCase();
      });
    }

    // Date filter
    if (qbStartDate && qbEndDate) {
      filtered = filtered.filter(order => {
        if (!order.creationDate) return false;
        const qbDate = new Date(order.creationDate);
        return qbDate >= qbStartDate && qbDate <= qbEndDate;
      });
    }

    // Payment method filter
    if (selectedPaymentMethod) {
      filtered = filtered.filter(order => order.paymentMethod === selectedPaymentMethod);
    }

    // Delivery type filter
    if (selectedDeliveryType) {
      filtered = filtered.filter(order => order.jobMethod === selectedDeliveryType);
    }

    // Aging filter
    if (startAgingDays !== '' || endAgingDays !== '') {
      const start = startAgingDays === '' ? 0 : parseInt(startAgingDays);
      const end = endAgingDays === '' ? Infinity : parseInt(endAgingDays);
      
      filtered = filtered.filter(order => {
        if (order.agingDays === null) return false;
        return order.agingDays >= start && order.agingDays <= end;
      });
    }

    setFilteredOrders(filtered);
  }, [searchTerm, qbStartDate, qbEndDate, selectedPaymentMethod, 
    selectedDeliveryType, startAgingDays, endAgingDays, orders, 
    selectedStatus, productFilter, userRole]);

  const clearFilters = () => {
    setQbStartDate(null);
    setQbEndDate(null);
    setSearchTerm('');
    setSelectedPaymentMethod('');
    setSelectedDeliveryType('');
    setStartAgingDays('');
    setEndAgingDays('');
    setSelectedStatus('');
    setFilteredOrders(orders);
  };

  const getUniqueValues = (field) => {
    return [...new Set(orders.map(order => order[field]).filter(Boolean))];
  };

  const calculateAgingStats = () => {
    const today = new Date();
    const agingStats = {
      total: orders.length,
      withDate: orders.filter(o => o.creationDate).length,
      overdue: 0,
      critical: 0
    };

    orders.forEach(order => {
      if (!order.creationDate || ['cancelled', 'collected'].includes(order.pharmacyStatus?.toLowerCase())) return;
      
      const diffDays = Math.floor((today - new Date(order.creationDate)) / (1000 * 60 * 60 * 24));
      if (diffDays > 30) agingStats.overdue++;
      if (diffDays > 60) agingStats.critical++;
    });

    return agingStats;
  };


  const totalAmount = filteredOrders.reduce((sum, order) => {
    const amount = parseFloat(order.paymentAmount) || 0;
    return sum + amount;
  }, 0);

  const handleTrackingNumberClick = (order) => {
    if (order.doTrackingNumber && order._id) {
      navigate(`/orders/${order._id}`);
    }
  };

const getAgingBadgeStyle = (days) => {
  if (days === 'collected') return { backgroundColor: '#dcfce7', color: '#166534' };
  if (days === 'cancelled') return { backgroundColor: '#fee2e2', color: '#991b1b' };
  if (!days && days !== 0) return { backgroundColor: '#f3f4f6', color: '#6b7280' };
  if (days === null) return { backgroundColor: '#f3f4f6', color: '#6b7280' };
  if (days <= 7) return { backgroundColor: '#dcfce7', color: '#166534' };
  if (days <= 30) return { backgroundColor: '#fef9c3', color: '#854d0e' };
  if (days <= 60) return { backgroundColor: '#fee2e2', color: '#991b1b' };
  return { backgroundColor: '#f3e8ff', color: '#7e22ce' };
};

  // Show loading state until role is loaded
  if (!isRoleLoaded) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div>Loading...</div>
      </div>
    );
  }

  if (!isRoleLoaded || isLoading) {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <div style={{
        border: '4px solid #f3f3f3',
        borderTop: '4px solid #3b82f6',
        borderRadius: '50%',
        width: '40px',
        height: '40px',
        animation: 'spin 1s linear infinite'
      }}></div>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

  return (
    <>
    {isLoading && <LoadingSpinner />}
    <div style={styles.container}>
      <div style={styles.maxWidthContainer}>
        {/* Header */}
        <div style={styles.headerCard}>
          <div style={styles.headerFlex}>
            <div style={styles.headerLeft}>
              <div style={styles.iconContainer}>
                <Package style={{ width: '32px', height: '32px', color: 'white' }} />
              </div>
              <div>
                <h1 style={styles.headerTitle}>Pharmacy Orders Dashboard</h1>
                <p style={styles.headerSubtitle}>Manage and track pharmacy orders efficiently</p>
              </div>
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              style={{
                ...styles.filterToggle,
                backgroundColor: showFilters ? '#c7d2fe' : '#e0e7ff'
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#c7d2fe'}
              onMouseLeave={(e) => e.target.style.backgroundColor = showFilters ? '#c7d2fe' : '#e0e7ff'}
            >
              <Filter style={{ width: '16px', height: '16px' }} />
              <span>Filters</span>
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div style={styles.searchCard}>
          <div style={styles.searchContainer}>
            <Search style={{ ...styles.searchIcon, width: '20px', height: '20px' }} />
            <input
              type="text"
              placeholder="Search by tracking number, patient name, phone, IC number, patient number, or address..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                ...styles.searchInput,
                boxShadow: searchTerm ? '0 0 0 2px #6366f1' : 'none',
                borderColor: searchTerm ? 'transparent' : '#e5e7eb'
              }}
              onFocus={(e) => {
                e.target.style.boxShadow = '0 0 0 2px #6366f1';
                e.target.style.borderColor = 'transparent';
              }}
              onBlur={(e) => {
                if (!searchTerm) {
                  e.target.style.boxShadow = 'none';
                  e.target.style.borderColor = '#e5e7eb';
                }
              }}
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                style={styles.clearSearchBtn}
                onMouseEnter={(e) => e.target.style.color = '#6b7280'}
                onMouseLeave={(e) => e.target.style.color = '#9ca3af'}
              >
                <X style={{ width: '20px', height: '20px' }} />
              </button>
            )}
          </div>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div style={styles.filtersCard}>
            <div style={styles.filtersGrid}>
              <div style={styles.filterGroup}>
                <label style={styles.filterLabel}>
                  <Calendar style={{ width: '16px', height: '16px' }} />
                  Start Date
                </label>
                <input
                  type="date"
                  value={qbStartDate ? qbStartDate.toISOString().split('T')[0] : ''}
                  onChange={(e) => setQbStartDate(e.target.value ? new Date(e.target.value) : null)}
                  style={styles.filterInput}
                  onFocus={(e) => {
                    e.target.style.boxShadow = '0 0 0 2px #6366f1';
                    e.target.style.borderColor = 'transparent';
                  }}
                  onBlur={(e) => {
                    e.target.style.boxShadow = 'none';
                    e.target.style.borderColor = '#d1d5db';
                  }}
                />
              </div>
              
              <div style={styles.filterGroup}>
                <label style={styles.filterLabel}>
                  <Calendar style={{ width: '16px', height: '16px' }} />
                  End Date
                </label>
                <input
                  type="date"
                  value={qbEndDate ? qbEndDate.toISOString().split('T')[0] : ''}
                  onChange={(e) => setQbEndDate(e.target.value ? new Date(e.target.value) : null)}
                  style={styles.filterInput}
                  onFocus={(e) => {
                    e.target.style.boxShadow = '0 0 0 2px #6366f1';
                    e.target.style.borderColor = 'transparent';
                  }}
                  onBlur={(e) => {
                    e.target.style.boxShadow = 'none';
                    e.target.style.borderColor = '#d1d5db';
                  }}
                />
              </div>

              <div style={styles.filterGroup}>
                <label style={styles.filterLabel}>
                  <CreditCard style={{ width: '16px', height: '16px' }} />
                  Payment Method
                </label>
                <select
                  value={selectedPaymentMethod}
                  onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                  style={styles.filterInput}
                  onFocus={(e) => {
                    e.target.style.boxShadow = '0 0 0 2px #6366f1';
                    e.target.style.borderColor = 'transparent';
                  }}
                  onBlur={(e) => {
                    e.target.style.boxShadow = 'none';
                    e.target.style.borderColor = '#d1d5db';
                  }}
                >
                  <option value="">All Methods</option>
                  {getUniqueValues('paymentMethod').map(method => (
                    <option key={method} value={method}>{method}</option>
                  ))}
                </select>
              </div>

              <div style={styles.filterGroup}>
                <label style={styles.filterLabel}>
                  <Package style={{ width: '16px', height: '16px' }} />
                  Delivery Type
                </label>
                <select
                  value={selectedDeliveryType}
                  onChange={(e) => setSelectedDeliveryType(e.target.value)}
                  style={styles.filterInput}
                  onFocus={(e) => {
                    e.target.style.boxShadow = '0 0 0 2px #6366f1';
                    e.target.style.borderColor = 'transparent';
                  }}
                  onBlur={(e) => {
                    e.target.style.boxShadow = 'none';
                    e.target.style.borderColor = '#d1d5db';
                  }}
                >
                  <option value="">All Types</option>
                  {getUniqueValues('jobMethod').map(method => (
                    <option key={method} value={method}>{method}</option>
                  ))}
                </select>
              </div>

              <div style={styles.filterGroup}>
                <label style={styles.filterLabel}>
                  <AlertCircle style={{ width: '16px', height: '16px' }} />
                  Status
                </label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  style={styles.filterInput}
                  onFocus={(e) => {
                    e.target.style.boxShadow = '0 0 0 2px #6366f1';
                    e.target.style.borderColor = 'transparent';
                  }}
                  onBlur={(e) => {
                    e.target.style.boxShadow = 'none';
                    e.target.style.borderColor = '#d1d5db';
                  }}
                >
                  <option value="">All Statuses</option>
                  {[...new Set([
                    ...orders.map(o => o.pharmacyStatus).filter(Boolean),
                    ...orders.map(o => o.goRushStatus).filter(Boolean)
                  ])].map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>

                {userRole === 'gorush' && (
          <div style={styles.filterGroup}>
            <label style={styles.filterLabel}>
              <Package style={{ width: '16px', height: '16px' }} />
              Product Filter
            </label>
            <select
              value={productFilter || ''}
              onChange={(e) => setProductFilter(e.target.value || null)}
              style={styles.filterInput}
              onFocus={(e) => {
                e.target.style.boxShadow = '0 0 0 2px #6366f1';
                e.target.style.borderColor = 'transparent';
              }}
              onBlur={(e) => {
                e.target.style.boxShadow = 'none';
                e.target.style.borderColor = '#d1d5db';
              }}
            >
              <option value="">All Products</option>
              <option value="pharmacymoh">MOH Pharmacy</option>
              <option value="pharmacyjpmc">JPMC Pharmacy</option>
            </select>
          </div>
        )}
              </div>

              <div style={styles.filterGroup}>
                <label style={styles.filterLabel}>
                  <Clock style={{ width: '16px', height: '16px' }} />
                  Aging Range (Days)
                </label>
                <div style={styles.agingRangeContainer}>
                  <input
                    type="number"
                    placeholder="From"
                    value={startAgingDays}
                    onChange={(e) => setStartAgingDays(e.target.value)}
                    min="0"
                    style={styles.agingInput}
                    onFocus={(e) => {
                      e.target.style.boxShadow = '0 0 0 2px #6366f1';
                      e.target.style.borderColor = 'transparent';
                    }}
                    onBlur={(e) => {
                      e.target.style.boxShadow = 'none';
                      e.target.style.borderColor = '#d1d5db';
                    }}
                  />
                  <span>to</span>
                  <input
                    type="number"
                    placeholder="To"
                    value={endAgingDays}
                    onChange={(e) => setEndAgingDays(e.target.value)}
                    min={startAgingDays || '0'}
                    style={styles.agingInput}
                    onFocus={(e) => {
                      e.target.style.boxShadow = '0 0 0 2px #6366f1';
                      e.target.style.borderColor = 'transparent';
                    }}
                    onBlur={(e) => {
                      e.target.style.boxShadow = 'none';
                      e.target.style.borderColor = '#d1d5db';
                    }}
                  />
                </div>
              </div>
            </div>
            
            <div style={styles.clearFiltersContainer}>
              <button
                onClick={clearFilters}
                style={styles.clearFiltersBtn}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#dc2626'}
                onMouseLeave={(e) => e.target.style.backgroundColor = '#ef4444'}
              >
                <X style={{ width: '16px', height: '16px' }} />
                <span>Clear All Filters</span>
              </button>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div style={styles.statsGrid}>
          <div style={styles.statCard1}>
            <div style={styles.statCardContent}>
              <div>
                <p style={styles.statLabel}>Total Orders</p>
                <p style={styles.statValue}>{filteredOrders.length}</p>
              </div>
              <Package style={{ width: '32px', height: '32px', opacity: 0.7 }} />
            </div>
          </div>

          {userRole === 'gorush' && userSubrole == 'admin' && (
          <div style={styles.statCard4}>
            <div style={styles.statCardContent}>
              <div>
                <p style={styles.statLabel}>Total Amount</p>
                <p style={styles.statValue}>${totalAmount.toFixed(2)}</p>
              </div>
              <CreditCard style={{ width: '32px', height: '32px', opacity: 0.7 }} />
            </div>
          </div>
        )}
      </div>

        {/* Orders Table */}
        <div style={styles.tableCard}>
          <div style={styles.tableHeader}>
            <h2 style={styles.tableTitle}>Orders List</h2>
            <p style={styles.tableSubtitle}>Showing {filteredOrders.length} of {orders.length} orders</p>
          </div>
          
          <div style={styles.tableContainer}>
            <div style={styles.tableScrollContainer}>
              <table style={styles.table}>
                <thead style={styles.tableHead}>
                  <tr>
                    <th style={styles.th}>Tracking Number</th>
                    <th style={styles.th}>Created On</th>
                    <th style={styles.th}>Aging (Days)</th>
                    <th style={styles.th}>Collection Date</th>
                    <th style={styles.th}>Patient Name</th>
                    <th style={styles.th}>Phone</th>
                    <th style={styles.th}>Payment Method</th>
                    <th style={styles.th}>Delivery Type</th>
                    <th style={styles.th}>Amount</th>
                    <th style={styles.th}>IC Number</th>
                    <th style={styles.th}>Patient Number</th>
                    <th style={styles.th}>Address</th>
                    <th style={styles.th}>Date of Birth</th>
                    <th style={styles.th}>Remarks</th>
                    <th style={styles.th}>Additional Phone</th>
                    <th style={styles.th}>Appointment Place</th>
                    <th style={styles.th}>Paying Patient</th>
                    <th style={styles.th}>Passport</th>
                    <th style={styles.th}>Go Rush Status</th>
                    <th style={styles.th}>Pharmacy Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((order, idx) => (
                    <tr 
                      key={idx} 
                      style={idx % 2 === 0 ? styles.evenRow : styles.oddRow}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = idx % 2 === 0 ? 'white' : '#f9fafb'}
                    >
                      <td 
                        style={{ ...styles.td, ...styles.trackingNumber, cursor: order.doTrackingNumber ? 'pointer' : 'default' }}
                        onClick={() => handleTrackingNumberClick(order)}
                        onMouseEnter={(e) => order.doTrackingNumber && (e.currentTarget.style.textDecoration = 'underline')}
                        onMouseLeave={(e) => order.doTrackingNumber && (e.currentTarget.style.textDecoration = 'none')}
                      >
                        {order.doTrackingNumber || <span style={styles.naText}>N/A</span>}
                      </td>
                      <td style={styles.td}>
                        {order.dateTimeSubmission}
                      </td>
<td style={styles.td}>
  {order.agingDays === 'collected' ? (
    <span style={{ 
      ...styles.badge, 
      ...getAgingBadgeStyle(order.agingDays)
    }}>
      Collected
    </span>
  ) : order.agingDays === 'cancelled' ? (
    <span style={{ 
      ...styles.badge, 
      ...getAgingBadgeStyle(order.agingDays)
    }}>
      Cancelled
    </span>
  ) : typeof order.agingDays === 'number' ? (
    <span style={{ 
      ...styles.badge, 
      ...getAgingBadgeStyle(order.agingDays)
    }}>
      {order.agingDays} days
    </span>
  ) : (
    <span style={styles.naText}>N/A</span>
  )}
</td>
                      <td style={{ ...styles.td, ...styles.truncated }}>
                        {order.collectionDate ? formatDate(order.collectionDate) : "N/A"}
                      </td>
                      <td style={{ ...styles.td, ...styles.truncated }}>
                        {order.receiverName || <span style={styles.naText}>N/A</span>}
                      </td>
                      <td style={styles.td}>
                        {order.receiverPhoneNumber || <span style={styles.naText}>N/A</span>}
                      </td>
                      <td style={styles.td}>
                        {order.paymentMethod ? (
                          <span style={{ ...styles.badge, ...styles.paymentBadge }}>
                            {order.paymentMethod}
                          </span>
                        ) : <span style={styles.naText}>N/A</span>}
                      </td>
                      <td style={styles.td}>
                        {order.jobMethod ? (
                          <span style={{ ...styles.badge, ...styles.deliveryBadge }}>
                            {order.jobMethod}
                          </span>
                        ) : <span style={styles.naText}>N/A</span>}
                      </td>
                      <td style={{ ...styles.td, ...styles.amount }}>
                        {order.paymentAmount ? `$${parseFloat(order.paymentAmount).toFixed(2)}` : <span style={styles.naText}>N/A</span>}
                      </td>
                      <td style={styles.td}>
                        {order.icPassNum || <span style={styles.naText}>N/A</span>}
                      </td>
                      <td style={styles.td}>
                        {order.patientNumber || <span style={styles.naText}>N/A</span>}
                      </td>
                      <td style={{ ...styles.td, ...styles.truncated }}>
                        {order.receiverAddress || <span style={styles.naText}>N/A</span>}
                      </td>
                      <td style={styles.td}>
                        {order.dateOfBirth || <span style={styles.naText}>N/A</span>}
                      </td>
                      <td style={{ ...styles.td, ...styles.truncated }}>
                        {order.remarks || <span style={styles.naText}>N/A</span>}
                      </td>
                      <td style={styles.td}>
                        {order.additionalPhoneNumber || <span style={styles.naText}>N/A</span>}
                      </td>
                      <td style={{ ...styles.td, ...styles.truncated }}>
                        {order.appointmentPlace || <span style={styles.naText}>N/A</span>}
                      </td>
                      <td style={{ ...styles.td, ...styles.truncated }}>
                        {order.payingPatient || <span style={styles.naText}>N/A</span>}
                      </td>
                      <td style={styles.td}>
                        {order.passport || <span style={styles.naText}>N/A</span>}
                      </td>
                      <td style={styles.td}>
  {order.goRushStatus ? (
    <span style={{ 
      ...styles.badge,
      backgroundColor: getStatusStyle(order.goRushStatus).bg,
      color: getStatusStyle(order.goRushStatus).text,
      padding: '4px 8px',
      borderRadius: '9999px',
      fontSize: '12px',
      fontWeight: '500'
    }}>
      {order.goRushStatus}
    </span>
  ) : <span style={styles.naText}>N/A</span>}
</td>
<td style={styles.td}>
  {order.pharmacyStatus ? (
    <span style={{ 
      ...styles.badge,
      backgroundColor: getStatusStyle(order.pharmacyStatus).bg,
      color: getStatusStyle(order.pharmacyStatus).text,
      padding: '4px 8px',
      borderRadius: '9999px',
      fontSize: '12px',
      fontWeight: '500'
    }}>
      {order.pharmacyStatus}
    </span>
  ) : <span style={styles.naText}>N/A</span>}
</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          
          
          {filteredOrders.length === 0 && (
            <div style={styles.emptyState}>
              <Package style={styles.emptyIcon} />
              <p style={styles.emptyTitle}>No orders found matching your criteria</p>
              <p style={styles.emptySubtitle}>Try adjusting your search terms or filters</p>
            </div>
          )}
        </div>
      </div>
    </div>
    </>
  );
}

  const styles = {
    container: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #dbeafe 0%, #e0e7ff 50%, #f3e8ff 100%)',
      padding: '24px'
    },
    maxWidthContainer: {
      maxWidth: '1280px',
      margin: '0 auto'
    },
    headerCard: {
      backgroundColor: 'white',
      borderRadius: '16px',
      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
      padding: '24px',
      marginBottom: '24px',
      border: '1px solid #f3f4f6'
    },
    headerFlex: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      gap: '16px'
    },
    headerLeft: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px'
    },
    iconContainer: {
      padding: '12px',
      background: 'linear-gradient(135deg, #3b82f6 0%, #4f46e5 100%)',
      borderRadius: '12px'
    },
    headerTitle: {
      fontSize: '2rem',
      fontWeight: 'bold',
      color: '#111827',
      margin: 0
    },
    headerSubtitle: {
      color: '#6b7280',
      marginTop: '4px',
      fontSize: '1rem'
    },
    filterToggle: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      padding: '8px 16px',
      backgroundColor: '#e0e7ff',
      color: '#4338ca',
      border: 'none',
      borderRadius: '8px',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: '500',
      transition: 'background-color 0.2s'
    },
    searchCard: {
      backgroundColor: 'white',
      borderRadius: '16px',
      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
      padding: '24px',
      marginBottom: '24px',
      border: '1px solid #f3f4f6'
    },
    searchContainer: {
      position: 'relative'
    },
    searchInput: {
      width: '80%',
      paddingLeft: '48px',
      paddingRight: '1px',
      paddingTop: '16px',
      paddingBottom: '16px',
      fontSize: '1.125rem',
      border: '1px solid #e5e7eb',
      borderRadius: '12px',
      outline: 'none',
      transition: 'all 0.2s'
    },
    searchIcon: {
      position: 'absolute',
      left: '16px',
      top: '50%',
      transform: 'translateY(-50%)',
      color: '#9ca3af'
    },
    clearSearchBtn: {
      position: 'absolute',
      right: '16px',
      top: '50%',
      transform: 'translateY(-50%)',
      color: '#9ca3af',
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      padding: '4px'
    },
    filtersCard: {
      backgroundColor: 'white',
      borderRadius: '16px',
      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
      padding: '24px',
      marginBottom: '24px',
      border: '1px solid #f3f4f6'
    },
    filtersGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
      gap: '24px'
    },
    filterGroup: {
      display: 'flex',
      flexDirection: 'column',
      gap: '8px'
    },
    filterLabel: {
      display: 'flex',
      alignItems: 'center',
      fontSize: '14px',
      fontWeight: '500',
      color: '#374151',
      gap: '8px'
    },
    filterInput: {
      width: '100%',
      padding: '8px 12px',
      border: '1px solid #d1d5db',
      borderRadius: '8px',
      fontSize: '14px',
      outline: 'none',
      transition: 'all 0.2s'
    },
    agingRangeContainer: {
      display: 'flex',
      gap: '12px',
      alignItems: 'center'
    },
    agingInput: {
      flex: 1,
      padding: '8px 12px',
      border: '1px solid #d1d5db',
      borderRadius: '8px',
      fontSize: '14px',
      outline: 'none',
      transition: 'all 0.2s'
    },
    clearFiltersContainer: {
      marginTop: '16px',
      display: 'flex',
      justifyContent: 'flex-end'
    },
    clearFiltersBtn: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      padding: '8px 24px',
      backgroundColor: '#ef4444',
      color: 'white',
      border: 'none',
      borderRadius: '8px',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: '500',
      transition: 'background-color 0.2s'
    },
    statsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
      gap: '24px',
      marginBottom: '24px'
    },
    statCard1: {
      background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
      borderRadius: '12px',
      padding: '24px',
      color: 'white',
      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
    },
    statCard2: {
      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
      borderRadius: '12px',
      padding: '24px',
      color: 'white',
      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
    },
    statCard3: {
      background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
      borderRadius: '12px',
      padding: '24px',
      color: 'white',
      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
    },
    statCard4: {
      background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
      borderRadius: '12px',
      padding: '24px',
      color: 'white',
      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
    },
    statCard5: {
      background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
      borderRadius: '12px',
      padding: '24px',
      color: 'white',
      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
    },
    statCard6: {
      background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
      borderRadius: '12px',
      padding: '24px',
      color: 'white',
      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
    },
    statCardContent: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    },
    statLabel: {
      fontSize: '14px',
      opacity: 0.8,
      marginBottom: '4px'
    },
    statValue: {
      fontSize: '2rem',
      fontWeight: 'bold',
      margin: 0
    },
    tableCard: {
      backgroundColor: 'white',
      borderRadius: '16px',
      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
      border: '1px solid #f3f4f6',
      overflow: 'hidden'
    },
    tableHeader: {
      padding: '24px',
      borderBottom: '1px solid #e5e7eb'
    },
    tableTitle: {
      fontSize: '1.25rem',
      fontWeight: '600',
      color: '#111827',
      margin: 0
    },
    tableSubtitle: {
      color: '#6b7280',
      marginTop: '4px',
      fontSize: '14px'
    },
    tableContainer: {
      overflowX: 'auto'
    },
    tableScrollContainer: {
      maxHeight: '400px',
      overflowY: 'auto'
    },
    table: {
      width: '100%',
      borderCollapse: 'collapse'
    },
    tableHead: {
      backgroundColor: '#f9fafb',
      position: 'sticky',
      top: 0,
      zIndex: 10
    },
    th: {
      padding: '16px 24px',
      textAlign: 'left',
      fontSize: '12px',
      fontWeight: '500',
      color: '#6b7280',
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
      whiteSpace: 'nowrap'
    },
    td: {
      padding: '16px 24px',
      fontSize: '14px',
      color: '#374151',
      borderBottom: '1px solid #f3f4f6'
    },
    evenRow: {
      backgroundColor: 'white'
    },
    oddRow: {
      backgroundColor: '#f9fafb'
    },
    trackingNumber: {
      fontWeight: '500',
      color: '#111827'
    },
    badge: {
      padding: '4px 8px',
      fontSize: '12px',
      fontWeight: '500',
      borderRadius: '9999px'
    },
    paymentBadge: {
      backgroundColor: '#dbeafe',
      color: '#1e40af'
    },
    deliveryBadge: {
      backgroundColor: '#dcfce7',
      color: '#166534'
    },
    amount: {
      fontWeight: '500',
      color: '#111827'
    },
    truncated: {
      maxWidth: '200px',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap'
    },
    naText: {
      color: '#9ca3af'
    },
    emptyState: {
      textAlign: 'center',
      padding: '48px 24px'
    },
    emptyIcon: {
      width: '48px',
      height: '48px',
      color: '#9ca3af',
      margin: '0 auto 16px'
    },
    emptyTitle: {
      color: '#6b7280',
      fontSize: '1.125rem',
      margin: '0 0 4px 0'
    },
    emptySubtitle: {
      color: '#9ca3af',
      fontSize: '14px',
      margin: 0
    }
  };

export default OrdersPage;