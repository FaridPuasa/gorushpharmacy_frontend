import React, { useState, useEffect } from 'react';
import { Calendar, Package, ChevronRight, ExternalLink, RefreshCw, Check, Clock, User, MapPin, Phone, X, CreditCard, FileText, Building, DollarSign, Users, Trash2, Edit3, Save, XCircle, Download } from 'lucide-react';
import { format, parseISO, isToday, isTomorrow } from 'date-fns';
import PasswordModal from '../components/PasswordModal';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const CollectionDatesPage = () => {
  const [dates, setDates] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [orders, setOrders] = useState([]);
  const [ordersWithoutDates, setOrdersWithoutDates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [editingOrderId, setEditingOrderId] = useState(null);
  const [newCollectionDate, setNewCollectionDate] = useState('');
  const [userRole, setUserRole] = useState(null);
  const [showPasswordModal, setShowPasswordModal] = useState(true);
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (userRole) {
      fetchCollectionDates();
      fetchOrdersWithoutCollectionDates();
    }
  }, [userRole]);

  useEffect(() => {
    if (selectedDate && selectedDate !== 'no-date') {
      fetchOrdersForDate(selectedDate);
    }
  }, [selectedDate]);

  useEffect(() => {
    if (selectedOrders.length > 0 && selectedOrders.length === currentOrders().length) {
      setSelectAll(true);
    } else {
      setSelectAll(false);
    }
  }, [selectedOrders]);

  const currentOrders = () => {
    return selectedDate === 'no-date' 
      ? Object.values(ordersWithoutDates).flat() 
      : orders;
  };

  const fetchCollectionDates = async () => {
    setLoading(true);
    try {
      const response = await fetch('https://grpharmacyappserver.onrender.com/api/collection-dates', {
        headers: {
          'X-User-Role': userRole
        }
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setDates(data);
    } catch (error) {
      console.error('Error fetching dates:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrdersWithoutCollectionDates = async () => {
    try {
      const response = await fetch('https://grpharmacyappserver.onrender.com/api/orders', {
        headers: {
          'X-User-Role': userRole
        }
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const allOrders = await response.json();
      
      const data = allOrders.filter(order => 
        !order.collectionDate || 
        order.collectionDate === '' || 
        order.collectionDate === null
      );
      
      const grouped = data.reduce((acc, order) => {
        const dateKey = format(parseISO(order.creationDate), 'yyyy-MM-dd');
        if (!acc[dateKey]) {
          acc[dateKey] = [];
        }
        acc[dateKey].push(order);
        return acc;
      }, {});
      
      setOrdersWithoutDates(grouped);
    } catch (error) {
      console.error('Error fetching orders without collection dates:', error);
      setOrdersWithoutDates({});
    }
  };

  const fetchOrdersForDate = async (dateString) => {
    try {
      const response = await fetch(
        `https://grpharmacyappserver.onrender.com/api/orders/collection-dates?date=${dateString}`,
        {
          headers: {
            'X-User-Role': userRole
          }
        }
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setOrders(data);
      setSelectedOrders([]);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  const handleDateChange = (dateString) => {
    setSelectedDate(dateString);
    setEditingOrderId(null);
    setNewCollectionDate('');
    setSelectedOrders([]);
  };

  const handleUpdateStatus = async (orderId, statusType, status) => {
    if ((statusType === 'goRushStatus' && userRole !== 'gorush') || 
        (statusType === 'pharmacyStatus' && userRole !== 'jpmc' && userRole !== 'moh')) {
      alert('You do not have permission to update this status');
      return;
    }

    const endpoint = statusType === 'pharmacyStatus'
      ? `https://grpharmacyappserver.onrender.com/api/orders/${orderId}/pharmacy-status`
      : `https://grpharmacyappserver.onrender.com/api/orders/${orderId}/go-rush-status`;

    try {
      const response = await fetch(endpoint, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Role': userRole
        },
        body: JSON.stringify({ status }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update status');
      }

      refreshCurrentView();
    } catch (error) {
      console.error('Error updating status:', error);
      alert(`Error updating status: ${error.message}`);
    }
  };

  const handleBulkStatusUpdate = async (status) => {
    if (!status || selectedOrders.length === 0 || userRole !== 'gorush') return;
    
    try {
      const response = await fetch('https://grpharmacyappserver.onrender.com/api/orders/bulk-go-rush-status', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Role': userRole
        },
        body: JSON.stringify({
          orderIds: selectedOrders,
          status: status
        }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('Bulk update successful:', result);
      
      refreshCurrentView();
      setSelectedOrders([]);
      
    } catch (error) {
      console.error('Error during bulk update:', error);
      alert('Error updating orders. Please try again.');
    }
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedOrders(currentOrders().map(order => order._id));
      setSelectAll(true);
    } else {
      setSelectedOrders([]);
      setSelectAll(false);
    }
  };

  const handleEditCollectionDate = (orderId, currentDate) => {
    setEditingOrderId(orderId);
    setNewCollectionDate(currentDate || '');
  };

  const handleSaveCollectionDate = async (orderId) => {
    try {
      const response = await fetch(`https://grpharmacyappserver.onrender.com/api/orders/${orderId}/collection-date`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          collectionDate: newCollectionDate || null
        }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      setEditingOrderId(null);
      setNewCollectionDate('');
      refreshCurrentView();
      fetchCollectionDates();
    } catch (error) {
      console.error('Error updating collection date:', error);
      alert('Error updating collection date. Please try again.');
    }
  };

  const handleCancelEdit = () => {
    setEditingOrderId(null);
    setNewCollectionDate('');
  };

  const refreshCurrentView = () => {
    if (selectedDate === 'no-date') {
      fetchOrdersWithoutCollectionDates();
    } else if (selectedDate) {
      fetchOrdersForDate(selectedDate);
    }
  };

  const handleViewOrder = (order) => {
    setSelectedOrder(order);
    setShowPopup(true);
  };

  const closePopup = () => {
    setShowPopup(false);
    setSelectedOrder(null);
  };

  const getDateLabel = (dateString) => {
    if (dateString === 'no-date') return 'No Collection Date';
    const date = parseISO(dateString);
    if (isToday(date)) return 'Today';
    if (isTomorrow(date)) return 'Tomorrow';
    return format(date, 'EEEE, MMMM d');
  };

const statusStyles = {
  pending: { bg: '#fef3c7', text: '#92400e', icon: Clock },
  'ready-collect': { bg: '#dcfce7', text: '#065f46', icon: Package }, // New status
  ready: { bg: '#dbeafe', text: '#1e40af', icon: Package },
  collected: { bg: '#dcfce7', text: '#166534', icon: Check },
  completed: { bg: '#dcfce7', text: '#065f46', icon: Check },
  cancelled: { bg: '#fee2e2', text: '#991b1b', icon: X },
  'in progress': { bg: '#fef3c7', text: '#854d0e', icon: RefreshCw }
};

  const exportToExcel = () => {
    const ordersToExport = selectedDate === 'no-date' 
      ? Object.values(ordersWithoutDates).flat() 
      : orders;

    if (ordersToExport.length === 0) {
      alert('No orders to export');
      return;
    }

    const data = ordersToExport.map(order => ({
      'Tracking Number': order.doTrackingNumber,
      'Patient Name': order.receiverName,
      'Patient Number': order.patientNumber,
      'Phone Number': order.receiverPhoneNumber,
      'Address': order.receiverAddress || 'N/A',
      'Collection Date': order.collectionDate ? format(parseISO(order.collectionDate), 'yyyy-MM-dd') : 'Not set',
      'Pharmacy Status': order.pharmacyStatus || 'pending',
      'GoRush Status': order.goRushStatus || 'pending',
      'Created On': order.dateTimeSubmission,
      'Payment Method': order.paymentMethod || 'N/A',
      'Payment Amount': order.paymentAmount ? `$${order.paymentAmount}` : 'N/A'
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Orders');
    
    // Generate Excel file
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(blob, `orders_${selectedDate || 'all'}_${format(new Date(), 'yyyyMMdd')}.xlsx`);
  };


const getStatusStyle = (status) => {
  if (!status) return { ...styles.statusBadge, ...styles.statusPending };

  switch (status.toLowerCase()) {
    case 'ready-collect':  // New case
    case 'ready':
      return { ...styles.statusBadge, ...styles.statusReady };
    case 'collected':
    case 'completed':
      return { ...styles.statusBadge, ...styles.statusCollected };
    case 'cancelled':
      return { ...styles.statusBadge, ...styles.statusCancelled };
    case 'in progress':
      return { 
        ...styles.statusBadge, 
        backgroundColor: '#fef3c7',
        color: '#92400e'
      };
    default:
      return { ...styles.statusBadge, ...styles.statusPending };
  }
};

  const getTotalOrdersWithoutDates = () => {
    return Object.values(ordersWithoutDates).reduce((total, orders) => total + orders.length, 0);
  };

  const renderStatusBadge = (status, type) => {
    const statusConfig = statusStyles[status?.toLowerCase()] || statusStyles.pending;
    const Icon = statusConfig.icon || Clock;
    
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        padding: '4px 8px',
        borderRadius: '12px',
        backgroundColor: statusConfig.bg,
        color: statusConfig.text,
        fontSize: '12px',
        fontWeight: '500'
      }}>
        <Icon size={14} />
        <span>{type}: {status || 'pending'}</span>
      </div>
    );
  };

  const renderOrderCard = (order) => (
    <div
  key={order._id}
  style={{
    ...styles.orderCard,
    ...(selectedOrders.includes(order._id) ? styles.selectedOrderCard : {})
  }}
>
      <div style={styles.orderHeader}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {userRole === 'gorush' && (
            <input
              type="checkbox"
              checked={selectedOrders.includes(order._id)}
              onChange={(e) => {
                if (e.target.checked) {
                  setSelectedOrders([...selectedOrders, order._id]);
                } else {
                  setSelectedOrders(selectedOrders.filter(id => id !== order._id));
                }
              }}
              style={{ cursor: 'pointer' }}
            />
          )}
          <span style={styles.orderTime}>
            <Clock size={16} />
            {order.dateTimeSubmission}
          </span>
        </div>
        <div style={{ display: 'flex', gap: '5px' }}>
          {renderStatusBadge(order.pharmacyStatus, 'Pharmacy')}
          {renderStatusBadge(order.goRushStatus, 'GoRush')}
        </div>
      </div>

      <div style={styles.orderDetails}>
        <div style={styles.customerInfo}>
          <User size={16} />
          <span>{order.receiverName}</span>
          <span style={styles.patientNumber}>{order.patientNumber}</span>
        </div>
        
        <div style={styles.customerInfo}>
          <Phone size={16} />
          <span>{order.receiverPhoneNumber}</span>
        </div>
        
        {order.receiverAddress && (
          <div style={styles.customerInfo}>
            <MapPin size={16} />
            <span>{order.receiverAddress}</span>
          </div>
        )}
      </div>
      
      {editingOrderId === order._id && (
        <div style={styles.editSection}>
          <div style={styles.customerInfo}>
            <Calendar size={16} />
            <span>Collection Date:</span>
          </div>
          <input
            type="date"
            value={newCollectionDate}
            onChange={(e) => setNewCollectionDate(e.target.value)}
            style={styles.dateInput}
          />
          <div style={styles.editActions}>
            <button
              onClick={() => handleSaveCollectionDate(order._id)}
              style={styles.saveButton}
            >
              <Save size={14} />
              Save
            </button>
            <button
              onClick={handleCancelEdit}
              style={styles.cancelButton}
            >
              <XCircle size={14} />
              Cancel
            </button>
          </div>
        </div>
      )}
      
      <div style={styles.orderFooter}>
        <span style={styles.trackingNumber}>
          <Package size={16} />
          {order.doTrackingNumber}
        </span>
        
        <div style={styles.actions}>
          <div style={{ position: 'relative' }}>
<select
  value={order.pharmacyStatus || 'pending'}
  onChange={(e) => handleUpdateStatus(order._id, 'pharmacyStatus', e.target.value)}
  style={{
    ...styles.statusSelect,
    opacity: (userRole === 'jpmc' || userRole === 'moh') ? 1 : 0.6,
    cursor: (userRole === 'jpmc' || userRole === 'moh') ? 'pointer' : 'not-allowed'
  }}
  disabled={userRole !== 'jpmc' && userRole !== 'moh'}
>
  <option value="pending">Pending</option>
  <option value="ready-collect">Ready to be Collected</option>
  <option value="cancelled">Cancelled</option>
</select>
            {userRole !== 'jpmc' && userRole !== 'moh' && (
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                cursor: 'not-allowed'
              }} title="Only pharmacy users can edit this status"></div>
            )}
          </div>

          <div style={{ position: 'relative' }}>
            <select
              value={order.goRushStatus || 'pending'}
              onChange={(e) => handleUpdateStatus(order._id, 'goRushStatus', e.target.value)}
              style={{
                ...styles.statusSelect,
                opacity: userRole === 'gorush' ? 1 : 0.6,
                cursor: userRole === 'gorush' ? 'pointer' : 'not-allowed'
              }}
              disabled={userRole !== 'gorush'}
            >
              <option value="pending">Pending</option>
              <option value="collected">Collected</option>
              <option value="cancelled">Cancelled</option>
            </select>
            {userRole !== 'gorush' && (
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                cursor: 'not-allowed'
              }} title="Only GoRush users can edit this status"></div>
            )}
          </div>
          
          <button
            onClick={() => handleViewOrder(order)}
            style={styles.viewButton}
            onMouseEnter={(e) => e.currentTarget.style.background = '#2563eb'}
            onMouseLeave={(e) => e.currentTarget.style.background = '#3b82f6'}
          >
            View <ChevronRight size={16} />
          </button>

          {userRole === 'jpmc' && editingOrderId !== order._id && (
            <button
              onClick={() => handleEditCollectionDate(order._id, order.collectionDate)}
              style={styles.editButton}
              onMouseEnter={(e) => e.currentTarget.style.background = '#059669'}
              onMouseLeave={(e) => e.currentTarget.style.background = '#10b981'}
            >
              <Edit3 size={14} />
              Edit Date
            </button>
          )}
        </div>
      </div>
    </div>
  );

  const renderOrderPopup = () => {
    if (!selectedOrder) return null;

    return (
      <div style={styles.popup} onClick={closePopup}>
        <div style={styles.popupContent} onClick={(e) => e.stopPropagation()}>
          <div style={styles.popupHeader}>
            <h2 style={styles.popupTitle}>Order Details</h2>
            <button style={styles.closeButton} onClick={closePopup}>
              <X size={24} />
            </button>
          </div>

          <div style={styles.popupSection}>
            <div style={styles.sectionTitle}>
              <Package size={20} />
              Order Information
            </div>
            <div style={styles.infoGrid}>
              <div style={styles.infoItem}>
                <span style={styles.infoLabel}>Tracking Number</span>
                <span style={styles.infoValue}>{selectedOrder.doTrackingNumber}</span>
              </div>
              <div style={styles.infoItem}>
                <span style={styles.infoLabel}>Created On</span>
                <span style={styles.infoValue}>
                  {selectedOrder.dateTimeSubmission}
                </span>
              </div>
              <div style={styles.infoItem}>
                <span style={styles.infoLabel}>Collection Date</span>
                <span style={styles.infoValue}>
                  {selectedOrder.collectionDate ? format(parseISO(selectedOrder.collectionDate), 'yyyy-MM-dd') : 'Not set'}
                </span>
              </div>
              <div style={styles.infoItem}>
                <span style={styles.infoLabel}>Delivery Type</span>
                <span style={styles.infoValue}>{selectedOrder.jobMethod || 'N/A'}</span>
              </div>
              <div style={styles.infoItem}>
                <span style={styles.infoLabel}>Pharmacy Status</span>
                <span style={getStatusStyle(selectedOrder.pharmacyStatus)}>
                  {selectedOrder.pharmacyStatus || 'pending'}
                </span>
              </div>
              <div style={styles.infoItem}>
                <span style={styles.infoLabel}>GoRush Status</span>
                <span style={getStatusStyle(selectedOrder.goRushStatus)}>
                  {selectedOrder.goRushStatus || 'pending'}
                </span>
              </div>
            </div>
          </div>

          <div style={styles.popupSection}>
            <div style={styles.sectionTitle}>
              <User size={20} />
              Patient Information
            </div>
            <div style={styles.infoGrid}>
              <div style={styles.infoItem}>
                <span style={styles.infoLabel}>Patient Name</span>
                <span style={styles.infoValue}>{selectedOrder.receiverName}</span>
              </div>
              <div style={styles.infoItem}>
                <span style={styles.infoLabel}>Patient Number</span>
                <span style={styles.infoValue}>{selectedOrder.patientNumber}</span>
              </div>
              <div style={styles.infoItem}>
                <span style={styles.infoLabel}>Date of Birth</span>
                <span style={styles.infoValue}>
                  {selectedOrder.dateOfBirth || 'N/A'}
                </span>
              </div>
              <div style={styles.infoItem}>
                <span style={styles.infoLabel}>IC Number</span>
                <span style={styles.infoValue}>{selectedOrder.icPassNum || 'N/A'}</span>
              </div>
              <div style={styles.infoItem}>
                <span style={styles.infoLabel}>Passport</span>
                <span style={styles.infoValue}>{selectedOrder.passport || 'N/A'}</span>
              </div>
              <div style={styles.infoItem}>
                <span style={styles.infoLabel}>Paying Patient</span>
                <span style={styles.infoValue}>{selectedOrder.payingPatient || 'N/A'}</span>
              </div>
            </div>
          </div>

          <div style={styles.popupSection}>
            <div style={styles.sectionTitle}>
              <Phone size={20} />
              Contact Information
            </div>
            <div style={styles.infoGrid}>
              <div style={styles.infoItem}>
                <span style={styles.infoLabel}>Customer Phone</span>
                <span style={styles.infoValue}>{selectedOrder.receiverPhoneNumber}</span>
              </div>
              <div style={styles.infoItem}>
                <span style={styles.infoLabel}>Additional Phone</span>
                <span style={styles.infoValue}>{selectedOrder.additionalPhoneNumber || 'N/A'}</span>
              </div>
              <div style={styles.infoItem}>
                <span style={styles.infoLabel}>Customer Address</span>
                <span style={styles.infoValue}>{selectedOrder.receiverAddress || 'N/A'}</span>
              </div>
              <div style={styles.infoItem}>
                <span style={styles.infoLabel}>Appointment Place</span>
                <span style={styles.infoValue}>{selectedOrder.appointmentPlace || 'N/A'}</span>
              </div>
            </div>
          </div>

          <div style={styles.popupSection}>
            <div style={styles.sectionTitle}>
              <CreditCard size={20} />
              Payment Information
            </div>
            <div style={styles.infoGrid}>
              <div style={styles.infoItem}>
                <span style={styles.infoLabel}>Payment Method</span>
                <span style={styles.infoValue}>{selectedOrder.paymentMethod || 'N/A'}</span>
              </div>
              <div style={styles.infoItem}>
                <span style={styles.infoLabel}>Payment Amount</span>
                <span style={styles.infoValue}>
                  {selectedOrder.paymentAmount ? `$${selectedOrder.paymentAmount}` : 'N/A'}
                </span>
              </div>
            </div>
          </div>

          {selectedOrder.remarks && (
            <div style={styles.popupSection}>
              <div style={styles.sectionTitle}>
                <FileText size={20} />
                Patient Remarks
              </div>
              <div style={styles.infoValue}>
                {selectedOrder.remarks}
              </div>
            </div>
          )}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'flex-end',
            marginTop: '20px',
            gap: '10px'
          }}>
            <button
              onClick={() => {
                navigate(`/orders/${selectedOrder._id}`);
                closePopup();
              }}
              style={{
                padding: '10px 16px',
                backgroundColor: '#3b82f6',
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
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#2563eb'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#3b82f6'}
            >
              <ExternalLink size={16} />
              View Full Details
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (showPasswordModal) {
    return (
      <PasswordModal 
        onSuccess={(role) => {
          setUserRole(role);
          setShowPasswordModal(false);
        }} 
      />
    );
  }

  if (loading) return <div style={styles.loading}>Loading collection dates...</div>;

  return (
    <div style={styles.container}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={styles.title}>Collection Dates</h1>
        <div style={{ 
          padding: '6px 12px', 
          borderRadius: '4px', 
          backgroundColor: userRole === 'gorush' ? '#3b82f6' : '#10b981',
          color: 'white',
          fontSize: '14px',
          fontWeight: '500'
        }}>
          {userRole === 'gorush' ? 'GoRush User' : 'Pharmacy User'}
        </div>
      </div>
      
      {!selectedDate ? (
        <div style={styles.selectPrompt}>
          <p style={styles.promptText}>Please select a collection date to view orders</p>
        </div>
      ) : null}

      <div style={styles.dateSelector}>
        {dates.map((date) => (
          <button
            key={date.dateString}
            style={{
              ...styles.dateButton,
              ...(selectedDate === date.dateString ? styles.activeDateButton : {})
            }}
            onClick={() => handleDateChange(date.dateString)}
          >
            <span style={styles.dateLabel}>{getDateLabel(date.dateString)}</span>
            <span style={styles.orderCount}>{date.count} orders</span>
          </button>
        ))}
        
        <button
          style={{
            ...styles.dateButton,
            ...(selectedDate === 'no-date' ? styles.noDateButton : {})
          }}
          onClick={() => handleDateChange('no-date')}
        >
          <span style={styles.dateLabel}>No Collection Date</span>
          <span style={styles.orderCount}>{getTotalOrdersWithoutDates()} orders</span>
        </button>
      </div>

      {selectedDate && (
        <div style={styles.ordersContainer}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '20px',
          }}>
  <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
    <h2 style={styles.dateTitle}>
      {selectedDate === 'no-date'
        ? 'Orders Without Collection Dates'
        : getDateLabel(selectedDate)}
    </h2>
    <div style={{ display: 'flex', gap: '10px' }}>
      <button 
        onClick={exportToExcel}
        style={{
          ...styles.exportButton,
          backgroundColor: '#10b981'
        }}
      >
        <Download size={16} /> Excel
      </button>
    </div>
  </div>


            {selectedOrders.length > 0 && userRole === 'gorush' && (
              <div style={{ display: 'flex', gap: '10px' }}>
                <select
                  value=""
                  onChange={(e) => handleBulkStatusUpdate(e.target.value)}
                  style={styles.statusSelect}
                >
                  <option value="">Update Selected</option>
                  <option value="pending">Pending</option>
                  <option value="collected">Collected</option>
                  <option value="cancelled">Cancelled</option>
                </select>
                <button
                  onClick={() => setSelectedOrders([])}
                  style={styles.cancelButton}
                >
                  Clear Selection
                </button>
              </div>
            )}
          </div>

          {selectedDate === 'no-date' ? (
            Object.entries(ordersWithoutDates).length > 0 ? (
              <div>
                {userRole === 'gorush' && (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    marginBottom: '10px',
                  }}>
                    <input
                      type="checkbox"
                      checked={selectAll}
                      onChange={handleSelectAll}
                      style={{ cursor: 'pointer' }}
                    />
                    <span>Select all orders</span>
                  </div>
                )}
                {Object.entries(ordersWithoutDates).map(([dateString, dateOrders]) => (
                  <div key={dateString}>
                    <h3 style={{ margin: '15px 0 10px', fontSize: '16px' }}>
                      Created on: {format(parseISO(dateString), 'EEEE, MMMM d')}
                    </h3>
                    <div style={styles.ordersList}>
                      {dateOrders.map(renderOrderCard)}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ textAlign: 'center', color: '#666' }}>
                No orders without collection dates
              </p>
            )
          ) : orders.length > 0 ? (
            <div>
              {userRole === 'gorush' && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  marginBottom: '10px',
                }}>
                  <input
                    type="checkbox"
                    checked={selectAll}
                    onChange={handleSelectAll}
                    style={{ cursor: 'pointer' }}
                  />
                  <span>Select all orders</span>
                </div>
              )}
              <div style={styles.ordersList}>{orders.map(renderOrderCard)}</div>
            </div>
          ) : (
            <p style={{ textAlign: 'center', color: '#666' }}>
              No orders for this date
            </p>
          )}
        </div>
      )}

      {showPopup && renderOrderPopup()}
    </div>
  );
};



const styles = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '20px',
    fontFamily: 'system-ui, -apple-system, sans-serif'
  },
  title: {
    fontSize: '24px',
    marginBottom: '20px',
    color: '#111827',
    fontWeight: '600'
  },
  selectPrompt: {
    textAlign: 'center',
    padding: '40px 20px',
    background: 'white',
    borderRadius: '10px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    marginBottom: '20px'
  },
  promptText: {
    fontSize: '18px',
    color: '#666',
    marginBottom: '20px'
  },
  dateSelector: {
    display: 'flex',
    gap: '10px',
    marginBottom: '20px',
    overflowX: 'auto',
    paddingBottom: '10px',
    flexWrap: 'wrap'
  },
  dateButton: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '15px 20px',
    borderRadius: '8px',
    background: '#f5f5f5',
    border: 'none',
    cursor: 'pointer',
    minWidth: '120px',
    transition: 'all 0.2s'
  },
  activeDateButton: {
    background: '#3b82f6',
    color: 'white'
  },
  noDateButton: {
    background: '#fbbf24',
    color: 'white'
  },
  dateLabel: {
    fontWeight: '500',
    marginBottom: '5px'
  },
  orderCount: {
    fontSize: '12px',
    opacity: '0.8'
  },
  ordersContainer: {
    background: 'white',
    borderRadius: '10px',
    padding: '20px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
  },
  dateTitle: {
    fontSize: '20px',
    marginBottom: '20px',
    color: '#111827'
  },
  ordersList: {
    display: 'grid',
    gap: '15px'
  },
  orderCard: {
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    padding: '15px',
    transition: 'all 0.2s'
  },
  selectedOrderCard: {
    borderColor: '#3b82f6',
    backgroundColor: '#f0f7ff'
  },
  orderHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '10px'
  },
  orderTime: {
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    fontSize: '14px',
    color: '#666'
  },
  statusBadge: {
    padding: '4px 10px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '500',
    textTransform: 'capitalize'
  },
  statusPending: {
    background: '#fef3c7',
    color: '#92400e'
  },
  statusReady: {
    background: '#dbeafe',
    color: '#1e40af'
  },
  statusCollected: {
    background: '#dcfce7',
    color: '#166534'
  },
  statusCancelled: {
    background: '#fee2e2',
    color: '#991b1b'
  },
  orderDetails: {
    marginBottom: '10px'
  },
  customerInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '5px',
    fontSize: '14px'
  },
  patientNumber: {
    background: '#f3f4f6',
    padding: '2px 6px',
    borderRadius: '4px',
    fontFamily: 'monospace'
  },
  orderFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '10px'
  },
  trackingNumber: {
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    fontFamily: 'monospace',
    background: '#f3f4f6',
    padding: '4px 8px',
    borderRadius: '4px',
    fontSize: '13px'
  },
  actions: {
    display: 'flex',
    gap: '10px',
    flexWrap: 'wrap'
  },
  statusSelect: {
    padding: '6px 10px',
    borderRadius: '4px',
    border: '1px solid #d1d5db',
    background: 'white',
    cursor: 'pointer'
  },
  viewButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    background: '#3b82f6',
    color: 'white',
    border: 'none',
    padding: '6px 12px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px'
  },
  editButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    background: '#10b981',
    color: 'white',
    border: 'none',
    padding: '6px 12px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px'
  },
  deleteButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    background: '#ef4444',
    color: 'white',
    border: 'none',
    padding: '6px 12px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px'
  },
  saveButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    background: '#059669',
    color: 'white',
    border: 'none',
    padding: '6px 12px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px'
  },
  cancelButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    background: '#6b7280',
    color: 'white',
    border: 'none',
    padding: '6px 12px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px'
  },
  dateInput: {
    padding: '6px 10px',
    borderRadius: '4px',
    border: '1px solid #d1d5db',
    background: 'white',
    fontSize: '14px',
    minWidth: '150px'
  },
  editSection: {
    background: '#f9fafb',
    padding: '10px',
    borderRadius: '6px',
    marginTop: '10px',
    border: '1px solid #e5e7eb'
  },
  editActions: {
    display: 'flex',
    gap: '8px',
    marginTop: '10px'
  },
  confirmDialog: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1001
  },
  confirmContent: {
    background: 'white',
    borderRadius: '10px',
    padding: '25px',
    maxWidth: '400px',
    width: '90%',
    textAlign: 'center'
  },
  confirmTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#111827',
    marginBottom: '15px'
  },
  confirmText: {
    fontSize: '14px',
    color: '#666',
    marginBottom: '20px'
  },
  confirmActions: {
    display: 'flex',
    gap: '10px',
    justifyContent: 'center'
  },
  loading: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '200px',
    fontSize: '16px',
    color: '#666'
  },
  error: {
    color: '#dc2626',
    padding: '20px',
    textAlign: 'center'
  },
  popup: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000
  },
  popupContent: {
    background: 'white',
    borderRadius: '10px',
    padding: '30px',
    maxWidth: '600px',
    width: '90%',
    maxHeight: '80vh',
    overflowY: 'auto',
    position: 'relative'
  },
  popupHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px'
  },
  popupTitle: {
    fontSize: '24px',
    fontWeight: '600',
    color: '#111827'
  },
  closeButton: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '5px',
    borderRadius: '4px',
    color: '#666'
  },
  popupSection: {
    marginBottom: '20px'
  },
  sectionTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#374151',
    marginBottom: '10px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  infoGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '15px'
  },
  infoItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px'
  },
  infoLabel: {
    fontSize: '12px',
    color: '#666',
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  infoValue: {
    fontSize: '14px',
    color: '#111827',
    fontWeight: '400'
  },
  groupedSection: {
    background: '#f9fafb',
    padding: '15px',
    borderRadius: '8px',
    marginBottom: '20px'
  },
  groupTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#374151',
    marginBottom: '15px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
    exportButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    color: 'white',
    border: 'none',
    padding: '8px 12px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
    transition: 'background-color 0.2s',
    '&:hover': {
      opacity: 0.9
    }
  }
};

export default CollectionDatesPage;