import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Package, 
  Search, 
  RefreshCw, 
  Filter, 
  Clock, 
  User, 
  MapPin, 
  Eye,
  X,
  ChevronDown,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';

const Today = () => {
  const [orders, setOrders] = useState([]);
  const [productFilter, setProductFilter] = useState('all');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [tempSelectedDate, setTempSelectedDate] = useState(new Date());
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [roleInitialized, setRoleInitialized] = useState(false);
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [isAllSelected, setIsAllSelected] = useState(false);
  const [bulkCollectionDate, setBulkCollectionDate] = useState('');
  const [currentDate, setCurrentDate] = useState(new Date());
  const navigate = useNavigate();

  // Format date for display
  const formatDate = (date) => {
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  };

  const handleDateSelect = (date) => {
  setCurrentDate(new Date(date));
  setShowDatePicker(false);
};

const openDatePicker = () => {
  setTempSelectedDate(currentDate);
  setShowDatePicker(true);
};
  
const handleClick = () => {
  // Format today's date as DD-MM-YYYY
  const today = dayjs().format('DD-MM-YYYY');
  
  // Navigate to /mohorders with today's date only
  navigate(`/mohorders?date=${today}`);
};



  // Navigation between dates
  const navigateToPreviousDay = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() - 1);
    setCurrentDate(newDate);
  };

  const navigateToNextDay = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + 1);
    setCurrentDate(newDate);
  };

  const navigateToToday = () => {
    setCurrentDate(new Date());
  };

  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedOrders([]);
    } else {
      setSelectedOrders(filteredOrders.map(order => order._id));
    }
    setIsAllSelected(!isAllSelected);
  };

  const handleBulkCollectionDateUpdate = async () => {
    if (!bulkCollectionDate) {
      alert('Please select a collection date');
      return;
    }

    try {
      const currentRole = userRole || sessionStorage.getItem('userRole') || 'jpmc';
      const promises = selectedOrders.map(orderId => 
        fetch(`http://localhost:5050/api/orders/${orderId}/collection-date`, {
          method: 'PUT',
          headers: { 
            'Content-Type': 'application/json',
            'X-User-Role': currentRole
          },
          body: JSON.stringify({ collectionDate: bulkCollectionDate })
        })
      );

      const responses = await Promise.all(promises);
      const results = await Promise.all(responses.map(res => res.json()));

      setOrders(orders.map(order => {
        const updatedOrder = results.find(r => r._id === order._id);
        return updatedOrder ? updatedOrder : order;
      }));

      setSelectedOrders([]);
      setIsAllSelected(false);
      setBulkCollectionDate('');
      
      alert(`Successfully updated ${results.length} orders!`);
    } catch (error) {
      console.error('Error updating bulk collection dates:', error);
      alert(`Error: ${error.message}`);
    }
  };

  const toggleOrderSelection = (orderId) => {
    setSelectedOrders(prev => 
      prev.includes(orderId) 
        ? prev.filter(id => id !== orderId)
        : [...prev, orderId]
    );
  };

  useEffect(() => {
    setSelectedOrders([]);
    setIsAllSelected(false);
  }, [orders]);

  // Initialize role on component mount
  useEffect(() => {
    getUserRole();
  }, []);

  // Fetch orders when role or date changes
  useEffect(() => {
    if (roleInitialized && userRole) {
      fetchOrdersForDate();
    }
  }, [userRole, roleInitialized, currentDate]);

useEffect(() => {
  filterOrders();
}, [orders, searchTerm, statusFilter, productFilter]);

  const getUserRole = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const roleFromUrl = urlParams.get('role');
    
    let currentRole = 'jpmc'; // default
    
    if (roleFromUrl) {
      currentRole = roleFromUrl.toLowerCase();
      sessionStorage.setItem('userRole', currentRole);
    } else {
      const roleFromStorage = sessionStorage.getItem('userRole');
      if (roleFromStorage) {
        currentRole = roleFromStorage.toLowerCase();
      }
    }
    
    setUserRole(currentRole);
    setRoleInitialized(true);
    return currentRole;
  };

  const fetchOrdersForDate = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const currentRole = userRole || sessionStorage.getItem('userRole') || 'jpmc';
      
      const response = await fetch('http://localhost:5050/api/orders', {
        headers: {
          'Content-Type': 'application/json',
          'X-User-Role': currentRole
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch orders: ${response.statusText}`);
      }
      
      const allOrders = await response.json();
      
      // Filter orders for the selected date
      const selectedDate = new Date(currentDate);
      selectedDate.setHours(0, 0, 0, 0);
      
      const filteredOrders = allOrders.filter(order => {
        try {
          const dateField = order.creationDate || order.dateTimeSubmission;
          if (!dateField) return false;
          
          let orderDate;
          if (typeof dateField === 'string') {
            if (dateField.includes('T')) {
              orderDate = new Date(dateField);
            } else if (dateField.includes('/')) {
              const parts = dateField.split('/');
              if (parts.length === 3) {
                orderDate = new Date(parts[2], parts[0] - 1, parts[1]);
              } else {
                return false;
              }
            } else {
              orderDate = new Date(dateField);
            }
          } else if (dateField instanceof Date) {
            orderDate = dateField;
          }
          
          if (!orderDate || isNaN(orderDate.getTime())) return false;
          
          orderDate.setHours(0, 0, 0, 0);
          return orderDate.getTime() === selectedDate.getTime();
        } catch (error) {
          console.warn('Could not parse date:', dateField, error);
          return false;
        }
      });
      
      setOrders(filteredOrders);
    } catch (err) {
      setError(err.message);
      console.error('Full error:', err);
    } finally {
      setLoading(false);
    }
  };

const filterOrders = () => {
  let filtered = [...orders];

  // Apply product filter
  if (productFilter !== 'all') {
    filtered = filtered.filter(order => order.product === productFilter);
  }

  // Apply search filter
  if (searchTerm) {
    filtered = filtered.filter(order =>
      order.receiverName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.patientNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.doTrackingNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.medicationName?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }

  // Apply status filter
  if (statusFilter !== 'all') {
    filtered = filtered.filter(order => 
      order.goRushStatus?.toLowerCase() === statusFilter.toLowerCase()
    );
  }

  setFilteredOrders(filtered);
};

  const getStatusCounts = () => {
    const counts = {
      all: orders.length,
      pending: 0,
      processing: 0,
      completed: 0,
    };

    orders.forEach(order => {
      const status = order.goRushStatus?.toLowerCase();
      if (counts.hasOwnProperty(status)) {
        counts[status]++;
      }
    });

    return counts;
  };

  const updateCollectionDate = async (orderId, collectionDate) => {
    try {
      const currentRole = userRole || sessionStorage.getItem('userRole') || 'jpmc';
      
      const response = await fetch(
        `http://localhost:5050/api/orders/${orderId}/collection-date`,
        {
          method: 'PUT',
          headers: { 
            'Content-Type': 'application/json',
            'X-User-Role': currentRole
          },
          body: JSON.stringify({ collectionDate })
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to update collection date: ${response.statusText}`);
      }

      const updatedOrder = await response.json();
      
      setOrders(orders.map(order => 
        order._id === updatedOrder._id ? updatedOrder : order
      ));
      setSelectedOrder(updatedOrder);
      
      alert('Collection date updated successfully!');
    } catch (error) {
      console.error('Error updating collection date:', error);
      alert(`Error: ${error.message}`);
    }
  };

  const changeRole = (newRole) => {
    sessionStorage.setItem('userRole', newRole);
    setUserRole(newRole);
    setRoleInitialized(true);
  };

  const statusCounts = getStatusCounts();

  const getStatusStyle = (status) => {
    const baseStyle = {
      padding: '4px 8px',
      borderRadius: '12px',
      fontSize: '12px',
      fontWeight: '500',
      textTransform: 'capitalize'
    };
    
    switch (status?.toLowerCase()) {
      case 'completed':
        return { ...baseStyle, backgroundColor: '#dcfce7', color: '#166534' };
      case 'pending':
        return { ...baseStyle, backgroundColor: '#fef3c7', color: '#a16207' };
      case 'processing':
        return { ...baseStyle, backgroundColor: '#dbeafe', color: '#1d4ed8' };
      default:
        return { ...baseStyle, backgroundColor: '#f3f4f6', color: '#6b7280' };
    }
  };

  const getDeliveryTypeStyle = (type) => {
    const baseStyle = {
      padding: '4px 8px',
      borderRadius: '12px',
      fontSize: '12px',
      fontWeight: '500',
      textTransform: 'capitalize'
    };

    switch (type?.toLowerCase()) {
      case 'standard':
        return { ...baseStyle, backgroundColor: '#e0f2fe', color: '#0369a1' };
      case 'express':
        return { ...baseStyle, backgroundColor: '#fef9c3', color: '#ca8a04' };
      case 'immediate':
        return { ...baseStyle, backgroundColor: '#fee2e2', color: '#b91c1c' };
      default:
        return { ...baseStyle, backgroundColor: '#f3f4f6', color: '#6b7280' };
    }
  };

  const getStatIconStyle = (type) => {
    const baseStyle = {
      width: '40px',
      height: '40px',
      borderRadius: '8px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    };
    
    switch (type) {
      case 'total':
        return { ...baseStyle, backgroundColor: '#dbeafe' };
      case 'pending':
        return { ...baseStyle, backgroundColor: '#fef3c7' };
      case 'processing':
        return { ...baseStyle, backgroundColor: '#dbeafe' };
      case 'completed':
        return { ...baseStyle, backgroundColor: '#dcfce7' };
      default:
        return { ...baseStyle, backgroundColor: '#f3f4f6' };
    }
  };

  if (loading || !roleInitialized) {
    return (
      <div style={{ padding: '20px', fontFamily: 'system-ui, sans-serif' }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          minHeight: '400px',
          flexDirection: 'column',
          gap: '16px'
        }}>
          <RefreshCw style={{ width: '32px', height: '32px', color: '#2563eb', animation: 'spin 1s linear infinite' }} />
          <span style={{ fontSize: '16px', color: '#6b7280' }}>Loading orders...</span>
        </div>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', backgroundColor: '#f8fafc', minHeight: '100vh' }}>
      {/* Header */}
<div style={{ 
  backgroundColor: 'white', 
  borderBottom: '1px solid #e2e8f0', 
  padding: '16px 24px',
  boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
}}>
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
    <div>
      <h1 style={{ 
        margin: 0, 
        fontSize: '24px', 
        fontWeight: '600', 
        color: '#1f2937',
        display: 'flex',
        alignItems: 'center',
        gap: '12px'
      }}>
        <Calendar style={{ width: '28px', height: '28px', color: '#2563eb' }} />
        <span 
          onClick={openDatePicker}
          style={{ 
            cursor: 'pointer',
            textDecoration: 'underline',
            textUnderlineOffset: '4px',
            ':hover': { color: '#2563eb' }
          }}
        >
          Orders for {formatDate(currentDate)}
        </span>
      </h1>
    </div>
    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
<button 
      onClick={handleClick}
      style={{
        padding: '8px 16px',
        backgroundColor: '#1890ff',
        color: 'white',
        border: 'none',
        borderRadius: '6px',
        fontSize: '14px',
        fontWeight: '500',
        cursor: 'pointer',
        transition: 'background-color 0.2s'
      }}
      onMouseEnter={(e) => e.target.style.backgroundColor = '#1677ff'}
      onMouseLeave={(e) => e.target.style.backgroundColor = '#1890ff'}
    >
      Create MOH Forms
    </button>
      <button
        onClick={navigateToToday}
        style={{
          padding: '8px 16px',
          backgroundColor: '#f3f4f6',
          border: 'none',
          borderRadius: '6px',
          fontSize: '14px',
          fontWeight: '500',
          cursor: 'pointer'
        }}
      >
        Today
      </button>
      
      
      <button
        onClick={fetchOrdersForDate}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '8px 16px',
          backgroundColor: '#2563eb',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          fontSize: '14px',
          fontWeight: '500',
          cursor: 'pointer',
          transition: 'background-color 0.2s'
        }}
        onMouseEnter={(e) => e.target.style.backgroundColor = '#1d4ed8'}
        onMouseLeave={(e) => e.target.style.backgroundColor = '#2563eb'}
      >
        <RefreshCw style={{ width: '16px', height: '16px' }} />
        Refresh
      </button>
    </div>
  </div>
</div>

      <div style={{ padding: '24px' }}>
        {error && (
          <div style={{
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '8px',
            padding: '16px',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <AlertCircle style={{ width: '20px', height: '20px', color: '#dc2626' }} />
            <div>
              <p style={{ margin: 0, fontWeight: '500', color: '#991b1b' }}>
                Failed to load orders: {error}
              </p>
              <button 
                onClick={fetchOrdersForDate}
                style={{
                  marginTop: '8px',
                  padding: '6px 12px',
                  backgroundColor: '#dc2626',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  fontSize: '14px',
                  cursor: 'pointer'
                }}
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {/* Statistics */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
          gap: '20px',
          marginBottom: '24px'
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '8px',
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '14px', fontWeight: '500', color: '#6b7280' }}>
                  Total Orders
                </h3>
                <p style={{ margin: '4px 0 0', fontSize: '24px', fontWeight: '600', color: '#1f2937' }}>
                  {statusCounts.all}
                </p>
              </div>
              <div style={getStatIconStyle('total')}>
                <Package style={{ width: '20px', height: '20px', color: '#2563eb' }} />
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div style={{
          backgroundColor: 'white',
          padding: '20px',
          borderRadius: '8px',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
          marginBottom: '24px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: '#1f2937' }}>
              Search & Filter
            </h3>
            <button
              onClick={() => setShowFilters(!showFilters)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 12px',
                backgroundColor: '#f3f4f6',
                border: 'none',
                borderRadius: '6px',
                fontSize: '14px',
                cursor: 'pointer'
              }}
            >
              <Filter style={{ width: '16px', height: '16px' }} />
              Filters
              <ChevronDown style={{ 
                width: '16px', 
                height: '16px',
                transform: showFilters ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.2s'
              }} />
            </button>
          </div>

          {showFilters && (
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: '200px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>
                  Search Orders
                </label>
                <div style={{ position: 'relative' }}>
                  <Search style={{ 
                    position: 'absolute', 
                    left: '12px', 
                    top: '50%', 
                    transform: 'translateY(-50%)',
                    width: '16px', 
                    height: '16px', 
                    color: '#6b7280' 
                  }} />
                  <input
                    type="text"
                    placeholder="Search by name, patient #, tracking..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 10px 10px 40px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
                    <div style={{ minWidth: '200px' }}>
      <label style={{ display: 'block', marginTop: 10, fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>
        Product Type
      </label>
      <select
        value={productFilter}
        onChange={(e) => setProductFilter(e.target.value)}
        style={{
          width: '100%',
          padding: '10px',
          border: '1px solid #d1d5db',
          borderRadius: '6px',
          fontSize: '14px',
          boxSizing: 'border-box',
          backgroundColor: 'white'
        }}
      >
        <option value="all">All Products</option>
        <option value="pharmacyjpmc">JPMC Pharmacy</option>
        <option value="pharmacymoh">MOH Pharmacy</option>
      </select>
    </div>
              </div>
            </div>
          )}
        </div>

        {selectedOrders.length > 0 && (
          <div style={{
            backgroundColor: '#e0f2fe',
            padding: '12px 24px',
            marginBottom: '16px',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontWeight: '500' }}>
                {selectedOrders.length} order{selectedOrders.length !== 1 ? 's' : ''} selected
              </span>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div>
                <label style={{ marginRight: '8px', fontSize: '14px' }}>Collection Date:</label>
                <input
                  type="date"
                  value={bulkCollectionDate}
                  onChange={(e) => setBulkCollectionDate(e.target.value)}
                  style={{
                    padding: '8px',
                    border: '1px solid #d1d5db',
                    borderRadius: '4px'
                  }}
                />
              </div>
              
              <button
                onClick={handleBulkCollectionDateUpdate}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#2563eb',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: '500',
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#1d4ed8'}
                onMouseLeave={(e) => e.target.style.backgroundColor = '#2563eb'}
              >
                Apply to Selected
              </button>
              
              <button
                onClick={() => {
                  setSelectedOrders([]);
                  setIsAllSelected(false);
                }}
                style={{
                  padding: '8px 16px',
                  backgroundColor: 'transparent',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#f3f4f6'}
                onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Orders Table */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
          overflow: 'hidden'
        }}>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: '#1f2937' }}>
                Orders ({filteredOrders.length})
              </h3>
              <p style={{ margin: 0, fontSize: '14px', color: '#6b7280' }}>
                {filteredOrders.length} of {orders.length} orders shown
              </p>
            </div>
          </div>

          {filteredOrders.length > 0 ? (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead style={{ backgroundColor: '#f8fafc' }}>
                  <tr>
                    <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#374151', textTransform: 'uppercase', width: '40px' }}>
                      <input
                        type="checkbox"
                        checked={isAllSelected}
                        onChange={toggleSelectAll}
                        style={{ cursor: 'pointer' }}
                      />
                    </th>
                    <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#374151', textTransform: 'uppercase' }}>
                      Date/Time
                    </th>
                    <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#374151', textTransform: 'uppercase' }}>
                      Tracking #
                    </th>
                    <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#374151', textTransform: 'uppercase' }}>
                      Patient
                    </th>
                    <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#374151', textTransform: 'uppercase' }}>
                      Phone
                    </th>
                    <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#374151', textTransform: 'uppercase' }}>
                      Payment
                    </th>
                    <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#374151', textTransform: 'uppercase' }}>
                      Type
                    </th>
                    <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#374151', textTransform: 'uppercase' }}>
                      Product
                    </th>
                    <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#374151', textTransform: 'uppercase' }}>
                      Collection Date
                    </th>
                    <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#374151', textTransform: 'uppercase' }}>
                      Go Rush Status
                    </th>
                    <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#374151', textTransform: 'uppercase' }}>
                      Pharmacy Status
                    </th>
                    <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#374151', textTransform: 'uppercase' }}>
                      Actions
                    </th>                  
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((order, index) => (
                    <tr 
                      key={order._id} 
                      style={{ 
                        borderBottom: '1px solid #e2e8f0',
                        transition: 'background-color 0.2s'
                      }}
                      onMouseEnter={(e) => e.target.closest('tr').style.backgroundColor = '#f9fafb'}
                      onMouseLeave={(e) => e.target.closest('tr').style.backgroundColor = 'transparent'}
                    >
                      <td style={{ padding: '12px', width: '40px' }}>
                        <input
                          type="checkbox"
                          checked={selectedOrders.includes(order._id)}
                          onChange={() => toggleOrderSelection(order._id)}
                          style={{ cursor: 'pointer' }}
                        />
                      </td>
                      <td style={{ padding: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Clock style={{ width: '14px', height: '14px', color: '#6b7280' }} />
                          <span style={{ fontSize: '13px', fontWeight: '500' }}>
                            {order.dateTimeSubmission || order.creationDate || 'N/A'}
                          </span>
                        </div>
                      </td>
                      <td style={{ padding: '12px' }}>
                        <span style={{ 
                          fontFamily: 'monospace', 
                          fontSize: '13px', 
                          backgroundColor: '#f1f5f9',
                          padding: '2px 6px',
                          borderRadius: '4px'
                        }}>
                          {order.doTrackingNumber || 'N/A'}
                        </span>
                      </td>
                      <td style={{ padding: '12px' }}>
                        <div>
                          <p style={{ margin: 0, fontWeight: '500', fontSize: '14px' }}>
                            {order.receiverName || 'N/A'}
                          </p>
                          <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#6b7280' }}>
                            #{order.patientNumber || 'N/A'}
                          </p>
                        </div>
                      </td>
                      <td style={{ padding: '12px' }}>
                        <span style={{ fontSize: '13px' }}>
                          {order.receiverPhoneNumber || 'N/A'}
                        </span>
                      </td>
                      <td style={{ padding: '12px' }}>
                        <div>
                          <p style={{ margin: 0, fontSize: '13px' }}>
                            {order.paymentMethod || 'N/A'}
                          </p>
                          <p style={{ margin: '4px 0 0', fontSize: '12px', fontWeight: '600', color: '#059669' }}>
                            ${order.paymentAmount || '0.00'}
                          </p>
                        </div>
                      </td>
                       <td style={{ padding: '12px' }}>
                          <span style={getDeliveryTypeStyle(order.jobMethod)}>
                            {order.jobMethod || 'N/A'}
                          </span>
                      </td>
                      <td style={{ padding: '12px' }}>
                          <p style={{ margin: 0, fontSize: '13px' }}>
                            {order.product || 'N/A'}
                          </p>
                      </td>
                      <td style={{ padding: '12px' }}>
  <p style={{ margin: 0, fontSize: '13px' }}>
    {order.collectionDate
      ? new Intl.DateTimeFormat('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric'
        }).format(new Date(order.collectionDate))
      : 'Not Yet Set'}
  </p>
</td>

                      <td style={{ padding: '12px' }}>
                        <span style={getStatusStyle(order.goRushStatus)}>
                          {order.goRushStatus || 'Unknown'}
                        </span>
                      </td>
                      <td style={{ padding: '12px' }}>
                        <span style={getStatusStyle(order.pharmacyStatus)}>
                          {order.pharmacyStatus || 'Unknown'}
                        </span>
                      </td>
                      <td style={{ padding: '12px' }}>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button
                            onClick={() => setSelectedOrder(order)}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                              padding: '6px 12px',
                              backgroundColor: '#2563eb',
                              color: 'white',
                              border: 'none',
                              borderRadius: '4px',
                              fontSize: '12px',
                              cursor: 'pointer'
                            }}
                          >
                            <Eye style={{ width: '12px', height: '12px' }} />
                            View
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={{ 
              padding: '60px 20px', 
              textAlign: 'center',
              color: '#6b7280'
            }}>
              <Package style={{ width: '48px', height: '48px', margin: '0 auto 16px', color: '#d1d5db' }} />
              <h3 style={{ margin: '0 0 8px', fontSize: '16px', fontWeight: '600' }}>
                No orders found
              </h3>
              <p style={{ margin: 0, fontSize: '14px' }}>
                {searchTerm || statusFilter !== 'all' 
                  ? 'Try adjusting your search or filter criteria' 
                  : 'There are no orders placed today'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }} onClick={() => setSelectedOrder(null)}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            width: '100%',
            maxWidth: '800px',
            maxHeight: '90vh',
            overflow: 'auto',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
          }} onClick={(e) => e.stopPropagation()}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '20px 24px',
              borderBottom: '1px solid #e2e8f0'
            }}>
              <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '600', color: '#1f2937' }}>
                Order Details - {selectedOrder.doTrackingNumber || 'N/A'}
              </h2>
              <button 
                onClick={() => setSelectedOrder(null)} 
                style={{
                  padding: '8px',
                  backgroundColor: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  borderRadius: '4px',
                  transition: 'background-color 0.2s'
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#f3f4f6'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                  >
                  <X style={{ width: '20px', height: '20px', color: '#6b7280' }} />
                  </button>
                  </div>
                          <div style={{ padding: '24px' }}>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: '1fr 1fr', 
            gap: '24px',
            marginBottom: '24px'
          }}>
            {/* Patient Information */}
            <div>
              <h3 style={{ 
                margin: '0 0 16px', 
                fontSize: '16px', 
                fontWeight: '600',
                color: '#1f2937',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <User style={{ width: '16px', height: '16px' }} />
                Patient Information
              </h3>
              <div style={{ 
                backgroundColor: '#f9fafb', 
                borderRadius: '6px', 
                padding: '16px'
              }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div>
                    <p style={{ 
                      margin: '0 0 4px', 
                      fontSize: '12px', 
                      color: '#6b7280',
                      fontWeight: '500'
                    }}>
                      Full Name
                    </p>
                    <p style={{ margin: 0, fontSize: '14px', fontWeight: '500' }}>
                      {selectedOrder.receiverName || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p style={{ 
                      margin: '0 0 4px', 
                      fontSize: '12px', 
                      color: '#6b7280',
                      fontWeight: '500'
                    }}>
                      Patient Number
                    </p>
                    <p style={{ margin: 0, fontSize: '14px' }}>
                      {selectedOrder.patientNumber || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p style={{ 
                      margin: '0 0 4px', 
                      fontSize: '12px', 
                      color: '#6b7280',
                      fontWeight: '500'
                    }}>
                      Phone Number
                    </p>
                    <p style={{ margin: 0, fontSize: '14px' }}>
                      {selectedOrder.receiverPhoneNumber || 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Delivery Information */}
            <div>
              <h3 style={{ 
                margin: '0 0 16px', 
                fontSize: '16px', 
                fontWeight: '600',
                color: '#1f2937',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <MapPin style={{ width: '16px', height: '16px' }} />
                Delivery Information
              </h3>
              <div style={{ 
                backgroundColor: '#f9fafb', 
                borderRadius: '6px', 
                padding: '16px'
              }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div>
                    <p style={{ 
                      margin: '0 0 4px', 
                      fontSize: '12px', 
                      color: '#6b7280',
                      fontWeight: '500'
                    }}>
                      Address
                    </p>
                    <p style={{ margin: 0, fontSize: '14px' }}>
                      {selectedOrder.receiverAddress || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p style={{ 
                      margin: '0 0 4px', 
                      fontSize: '12px', 
                      color: '#6b7280',
                      fontWeight: '500'
                    }}>
                      Collection Date
                    </p>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <input
                        type="date"
                        value={selectedOrder.collectionDate || ''}
                        onChange={(e) => updateCollectionDate(selectedOrder._id, e.target.value)}
                        style={{
                          padding: '6px 8px',
                          border: '1px solid #d1d5db',
                          borderRadius: '4px',
                          fontSize: '14px'
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Order Details */}
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ 
              margin: '0 0 16px', 
              fontSize: '16px', 
              fontWeight: '600',
              color: '#1f2937',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <Package style={{ width: '16px', height: '16px' }} />
              Order Details
            </h3>
            <div style={{ 
              backgroundColor: '#f9fafb', 
              borderRadius: '6px', 
              padding: '16px'
            }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <p style={{ 
                    margin: '0 0 4px', 
                    fontSize: '12px', 
                    color: '#6b7280',
                    fontWeight: '500'
                  }}>
                    Tracking Number
                  </p>
                  <p style={{ margin: 0, fontSize: '14px', fontWeight: '500' }}>
                    {selectedOrder.doTrackingNumber || 'N/A'}
                  </p>
                </div>
                <div>
                  <p style={{ 
                    margin: '0 0 4px', 
                    fontSize: '12px', 
                    color: '#6b7280',
                    fontWeight: '500'
                  }}>
                    Medication
                  </p>
                  <p style={{ margin: 0, fontSize: '14px' }}>
                    {selectedOrder.medicationName || 'N/A'}
                  </p>
                </div>
                <div>
                  <p style={{ 
                    margin: '0 0 4px', 
                    fontSize: '12px', 
                    color: '#6b7280',
                    fontWeight: '500'
                  }}>
                    Go Rush Status
                  </p>
                  <span style={getStatusStyle(selectedOrder.goRushStatus)}>
                    {selectedOrder.goRushStatus || 'Unknown'}
                  </span>
                </div>
                <div>
                  <p style={{ 
                    margin: '0 0 4px', 
                    fontSize: '12px', 
                    color: '#6b7280',
                    fontWeight: '500'
                  }}>
                    Pharmacy Status
                  </p>
                  <span style={getStatusStyle(selectedOrder.pharmacyStatus)}>
                    {selectedOrder.pharmacyStatus || 'Unknown'}
                  </span>
                </div>
                <div>
                  <p style={{ 
                    margin: '0 0 4px', 
                    fontSize: '12px', 
                    color: '#6b7280',
                    fontWeight: '500'
                  }}>
                    Payment Method
                  </p>
                  <p style={{ margin: 0, fontSize: '14px' }}>
                    {selectedOrder.paymentMethod || 'N/A'} • ${selectedOrder.paymentAmount || '0.00'}
                  </p>
                </div>
                <div>
                  <p style={{ 
                    margin: '0 0 4px', 
                    fontSize: '12px', 
                    color: '#6b7280',
                    fontWeight: '500'
                  }}>
                    Delivery Type
                  </p>
                  <p style={{ margin: 0, fontSize: '14px' }}>
                    {selectedOrder.jobMethod || 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
            <button
              style={{
                padding: '10px 16px',
                backgroundColor: '#f3f4f6',
                border: 'none',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#e5e7eb'}
              onMouseLeave={(e) => e.target.style.backgroundColor = '#f3f4f6'}
              onClick={() => setSelectedOrder(null)}
            >
              Close
            </button>
            <button
              style={{
                padding: '10px 16px',
                backgroundColor: '#2563eb',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'background-color 0.2s'
              }}
              onClick={() => {
      navigate(`/orders/${selectedOrder._id}`);
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#1d4ed8'}
              onMouseLeave={(e) => e.target.style.backgroundColor = '#2563eb'}
            >
              <ExternalLink style={{ width: '16px', height: '16px' }} />
              Open Full Details
            </button>
          </div>
        </div>
      </div>
    </div>
  )}
  {showDatePicker && (
  <div style={{
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000
  }} onClick={() => setShowDatePicker(false)}>
    <div style={{
      backgroundColor: 'white',
      borderRadius: '8px',
      padding: '20px',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
    }} onClick={(e) => e.stopPropagation()}>
      <h3 style={{ marginTop: 0 }}>Select a date</h3>
      <input
        type="date"
        value={tempSelectedDate.toISOString().split('T')[0]}
        onChange={(e) => setTempSelectedDate(new Date(e.target.value))}
        style={{
          padding: '8px',
          border: '1px solid #d1d5db',
          borderRadius: '4px',
          fontSize: '16px',
          marginBottom: '16px'
        }}
      />
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
        <button
          onClick={() => setShowDatePicker(false)}
          style={{
            padding: '8px 16px',
            backgroundColor: '#f3f4f6',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Cancel
        </button>
        <button
          onClick={() => handleDateSelect(tempSelectedDate)}
          style={{
            padding: '8px 16px',
            backgroundColor: '#2563eb',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Select Date
        </button>
      </div>
    </div>
  </div>
)}
</div>
);
};

export default Today;