import React, { useState, useEffect } from 'react';
import { 
  Calendar, Package, ChevronRight, ExternalLink, RefreshCw, Check, 
  Clock, User, MapPin, Phone, X, CreditCard, FileText, 
  Building, DollarSign, Users as UsersIcon, Trash2, 
  Edit3, Save, XCircle, Download, Filter, Plus, Minus,
  ChevronDown, ChevronUp
} from 'lucide-react';
import { format, parseISO, isToday, isTomorrow } from 'date-fns';
import PasswordModal from '../components/PasswordModal';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

const styles = {
  container: {
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '24px',
    fontFamily: 'system-ui, -apple-system, sans-serif',
    backgroundColor: '#f9fafb',
    minHeight: '100vh'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px',
    paddingBottom: '16px',
    borderBottom: '1px solid #e5e7eb'
  },
  title: {
    fontSize: '28px',
    margin: 0,
    color: '#111827',
    fontWeight: '600'
  },
  userRoleBadge: {
    padding: '8px 16px',
    borderRadius: '20px',
    backgroundColor: '#3b82f6',
    color: 'white',
    fontSize: '14px',
    fontWeight: '500'
  },
  selectPrompt: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '40px',
    textAlign: 'center',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    marginBottom: '24px'
  },
  promptText: {
    fontSize: '18px',
    color: '#6b7280',
    margin: 0
  },
  dateSelectorContainer: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '16px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    marginBottom: '24px',
    overflowX: 'auto'
  },
  dateSelector: {
    display: 'flex',
    gap: '12px',
    paddingBottom: '8px'
  },
  dateButton: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '16px 24px',
    borderRadius: '8px',
    background: '#f3f4f6',
    border: 'none',
    cursor: 'pointer',
    minWidth: '140px',
    transition: 'all 0.2s',
    '&:hover': {
      transform: 'translateY(-2px)'
    }
  },
  activeDateButton: {
    background: '#3b82f6',
    color: 'white',
    boxShadow: '0 4px 6px -1px rgba(59, 130, 246, 0.5)'
  },
  noDateButton: {
    background: '#f59e0b',
    color: 'white',
    '&.active': {
      boxShadow: '0 4px 6px -1px rgba(245, 158, 11, 0.5)'
    }
  },
  dateLabel: {
    fontWeight: '600',
    marginBottom: '4px',
    fontSize: '14px'
  },
  orderCount: {
    fontSize: '12px',
    opacity: '0.9'
  },
  ordersContainer: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '24px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
  },
  controlsContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px',
    flexWrap: 'wrap',
    gap: '16px'
  },
  dateTitle: {
    fontSize: '20px',
    margin: 0,
    color: '#111827',
    fontWeight: '600'
  },
  actionsContainer: {
    display: 'flex',
    gap: '12px',
    alignItems: 'center'
  },
  filterButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 16px',
    backgroundColor: '#f3f4f6',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'all 0.2s',
    '&:hover': {
      backgroundColor: '#e5e7eb'
    }
  },
  exportButtons: {
    display: 'flex',
    gap: '8px'
  },
  exportButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 16px',
    backgroundColor: '#10b981',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'all 0.2s',
    '&:hover': {
      backgroundColor: '#059669'
    }
  },
  filterPanel: {
    backgroundColor: '#f9fafb',
    borderRadius: '8px',
    padding: '16px',
    marginBottom: '24px',
    border: '1px solid #e5e7eb',
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
    gap: '16px'
  },
  filterGroup: {
    marginBottom: '0'
  },
  filterLabel: {
    display: 'block',
    marginBottom: '8px',
    fontSize: '14px',
    fontWeight: '500',
    color: '#374151'
  },
  filterSelect: {
    width: '100%',
    padding: '8px 12px',
    borderRadius: '6px',
    border: '1px solid #d1d5db',
    backgroundColor: 'white',
    fontSize: '14px'
  },
  searchInput: {
    width: '100%',
    padding: '8px 12px',
    borderRadius: '6px',
    border: '1px solid #d1d5db',
    backgroundColor: 'white',
    fontSize: '14px'
  },
  bulkActions: {
    backgroundColor: '#f0f9ff',
    borderRadius: '8px',
    padding: '12px 16px',
    marginBottom: '16px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    border: '1px solid #bae6fd'
  },
  bulkSelectionInfo: {
    fontWeight: '500',
    color: '#0369a1'
  },
  bulkStatusActions: {
    display: 'flex',
    gap: '8px'
  },
  bulkStatusSelect: {
    padding: '8px 12px',
    borderRadius: '6px',
    border: '1px solid #d1d5db',
    backgroundColor: 'white',
    fontSize: '14px'
  },
  clearSelectionButton: {
    padding: '8px 12px',
    backgroundColor: '#f3f4f6',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    '&:hover': {
      backgroundColor: '#e5e7eb'
    }
  },
  selectAllContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '16px',
    padding: '8px',
    backgroundColor: '#f9fafb',
    borderRadius: '6px'
  },
  groupHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 16px',
    backgroundColor: '#f3f4f6',
    borderRadius: '8px',
    marginBottom: '12px',
    cursor: 'pointer'
  },
  groupTitle: {
    margin: 0,
    fontSize: '16px',
    fontWeight: '600',
    color: '#111827'
  },
  groupToggle: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '24px',
    height: '24px',
    backgroundColor: '#e5e7eb',
    borderRadius: '4px'
  },
  ordersList: {
    display: 'grid',
    gap: '16px',
    gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))'
  },
  orderCard: {
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    padding: '16px',
    transition: 'all 0.2s',
    backgroundColor: 'white',
    '&:hover': {
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
    }
  },
  selectedOrderCard: {
    borderColor: '#3b82f6',
    backgroundColor: '#f0f7ff'
  },
  orderHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '12px',
    flexWrap: 'wrap',
    gap: '8px'
  },
  orderTime: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '14px',
    color: '#6b7280'
  },
  productBadge: {
    padding: '2px 8px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: '500',
    textTransform: 'uppercase'
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
    marginBottom: '12px'
  },
  customerInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '8px',
    fontSize: '14px',
    color: '#374151'
  },
  patientNumber: {
    backgroundColor: '#f3f4f6',
    padding: '2px 6px',
    borderRadius: '4px',
    fontFamily: 'monospace',
    fontSize: '13px'
  },
  orderFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '8px'
  },
  trackingNumber: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    fontFamily: 'monospace',
    backgroundColor: '#f3f4f6',
    padding: '4px 8px',
    borderRadius: '4px',
    fontSize: '13px'
  },
  actions: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap'
  },
  statusSelect: {
    padding: '6px 10px',
    borderRadius: '4px',
    border: '1px solid #d1d5db',
    background: 'white',
    cursor: 'pointer',
    fontSize: '14px'
  },
  viewButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    backgroundColor: '#3b82f6',
    color: 'white',
    border: 'none',
    padding: '6px 12px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
    transition: 'background-color 0.2s'
  },
  editButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    backgroundColor: '#10b981',
    color: 'white',
    border: 'none',
    padding: '6px 12px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
    transition: 'background-color 0.2s'
  },
  deleteButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    backgroundColor: '#ef4444',
    color: 'white',
    border: 'none',
    padding: '6px 12px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
    transition: 'background-color 0.2s'
  },
  editSection: {
    backgroundColor: '#f9fafb',
    padding: '12px',
    borderRadius: '6px',
    marginTop: '12px',
    border: '1px solid #e5e7eb'
  },
  dateInput: {
    padding: '6px 10px',
    borderRadius: '4px',
    border: '1px solid #d1d5db',
    background: 'white',
    fontSize: '14px',
    minWidth: '150px',
    marginTop: '8px'
  },
  editActions: {
    display: 'flex',
    gap: '8px',
    marginTop: '12px'
  },
  saveButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    backgroundColor: '#059669',
    color: 'white',
    border: 'none',
    padding: '6px 12px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
    transition: 'background-color 0.2s'
  },
  cancelButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    backgroundColor: '#6b7280',
    color: 'white',
    border: 'none',
    padding: '6px 12px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
    transition: 'background-color 0.2s'
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px',
    textAlign: 'center'
  },
  emptyText: {
    marginTop: '16px',
    fontSize: '16px',
    color: '#6b7280'
  },
  loading: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '200px',
    fontSize: '16px',
    color: '#666'
  },
  popup: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000
  },
  popupContent: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '24px',
    width: '90%',
    maxWidth: '800px',
    maxHeight: '90vh',
    overflowY: 'auto',
    position: 'relative'
  },
  popupHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '20px'
  },
  popupTitle: {
    fontSize: '24px',
    fontWeight: '600',
    color: '#111827',
    margin: 0
  },
  closeButton: {
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer',
    padding: '4px',
    borderRadius: '4px',
    color: '#6b7280',
    '&:hover': {
      backgroundColor: '#f3f4f6'
    }
  },
  popupSection: {
    marginBottom: '24px'
  },
  sectionTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#374151',
    marginBottom: '16px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  infoGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
    gap: '16px'
  },
  infoItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  },
  infoLabel: {
    fontSize: '12px',
    color: '#6b7280',
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  infoValue: {
    fontSize: '14px',
    color: '#111827',
    fontWeight: '400'
  },
      dateGroupContainer: {
      marginBottom: '24px',
      border: '1px solid #e5e7eb',
      borderRadius: '8px',
      overflow: 'hidden'
    },
    pharmacyTypeGroups: {
      padding: '0 16px 16px 16px'
    },
    pharmacyTypeGroup: {
      marginTop: '16px',
      border: '1px solid #e5e7eb',
      borderRadius: '6px',
      overflow: 'hidden'
    },
    pharmacyTypeHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '12px 16px',
      backgroundColor: '#f9fafb',
      cursor: 'pointer',
      borderBottom: '1px solid #e5e7eb'
    },
    pharmacyTypeTitle: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    },
    pharmacyTypeBadge: {
      padding: '4px 12px',
      borderRadius: '12px',
      fontSize: '14px',
      fontWeight: '600',
      textTransform: 'uppercase'
    },
    pharmacyTypeToggle: {
      color: '#6b7280'
    }
};

const CollectionDatesPage = () => {
  const [dates, setDates] = useState([]);
    const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [day, setDay] = useState(null);
  const [trackingSearch, setTrackingSearch] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [orders, setOrders] = useState([]);
  const [ordersWithoutDates, setOrdersWithoutDates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
    const [expandedPharmacyTypes, setExpandedPharmacyTypes] = useState({});
  const [showPopup, setShowPopup] = useState(false);
  const [editingOrderId, setEditingOrderId] = useState(null);
  const [newCollectionDate, setNewCollectionDate] = useState('');
  const [userRole, setUserRole] = useState(null);
  const [showPasswordModal, setShowPasswordModal] = useState(true);
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState({});
  const [showFilters, setShowFilters] = useState(false);
  const [productFilter, setProductFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const navigate = useNavigate();
  

    const togglePharmacyType = (dateString, pharmacyType) => {
    setExpandedPharmacyTypes(prev => ({
      ...prev,
      [`${dateString}-${pharmacyType}`]: !prev[`${dateString}-${pharmacyType}`]
    }));
  };

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

useEffect(() => {
  filterOrders(); // Apply filters when search/filter criteria change
}, [searchTerm, statusFilter, productFilter, orders, ordersWithoutDates, selectedDate]);

const currentOrders = () => {
  return filteredOrders.length > 0 ? filteredOrders : 
    (selectedDate === 'no-date' 
      ? Object.values(ordersWithoutDates).flat() 
      : orders);
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

const renderDateGroup = (dateString, dateOrders) => {
    const groupedOrders = groupOrdersByPharmacyType(dateOrders);
    
    return (
      <div key={dateString} style={styles.dateGroupContainer}>
        <div 
          style={styles.groupHeader}
          onClick={() => toggleGroup(dateString)}
        >
          <h3 style={styles.groupTitle}>
            Created on: {format(parseISO(dateString), 'EEEE, MMMM d')}
          </h3>
          <div style={styles.groupToggle}>
            {expandedGroups[dateString] ? <Minus size={18} /> : <Plus size={18} />}
          </div>
        </div>
        
        {expandedGroups[dateString] && (  // Only show if explicitly expanded
          <div style={styles.pharmacyTypeGroups}>
            {Object.entries(groupedOrders).map(([pharmacyType, orders]) => (
              orders.length > 0 && (
                <div key={`${dateString}-${pharmacyType}`} style={styles.pharmacyTypeGroup}>
                  <div 
                    style={styles.pharmacyTypeHeader}
                    onClick={() => togglePharmacyType(dateString, pharmacyType)}
                  >
                    <div style={styles.pharmacyTypeTitle}>
                      <span style={{
                        ...styles.pharmacyTypeBadge,
                        backgroundColor: pharmacyType === 'MOH' ? '#d1fae5' : 
                                        pharmacyType === 'JPMC' ? '#dbeafe' : '#e5e7eb',
                        color: pharmacyType === 'MOH' ? '#065f46' : 
                               pharmacyType === 'JPMC' ? '#1e40af' : '#4b5563'
                      }}>
                        {pharmacyType} ({orders.length})
                      </span>
                    </div>
                    <div style={styles.pharmacyTypeToggle}>
                      {expandedPharmacyTypes[`${dateString}-${pharmacyType}`] ? 
                        <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </div>
                  </div>
                  
                  {expandedPharmacyTypes[`${dateString}-${pharmacyType}`] && (
                    <div style={styles.ordersList}>
                      {orders.map(renderOrderCard)}
                    </div>
                  )}
                </div>
              )
            ))}
          </div>
        )}
      </div>
    );
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

const filterOrders = () => {
  let filtered = selectedDate === 'no-date' 
    ? Object.values(ordersWithoutDates).flat()
    : [...orders];

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
      order.goRushStatus?.toLowerCase() === statusFilter.toLowerCase() ||
      order.pharmacyStatus?.toLowerCase() === statusFilter.toLowerCase()
    );
  }

  setFilteredOrders(filtered);
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
    // Format the date correctly before sending to the backend
    let formattedDate = '';
    if (newCollectionDate) {
      // Parse the input date (assuming format is YYYY-MM-DD from date input)
      const dateParts = newCollectionDate.split('-');
      if (dateParts.length === 3) {
        const year = dateParts[0];
        const month = dateParts[1];
        const day = dateParts[2];
        formattedDate = `${day}-${month}-${year}`; // Format as DD-MM-YYYY for backend
      } else {
        throw new Error('Invalid date format');
      }
    }

    const response = await fetch(`https://grpharmacyappserver.onrender.com/api/orders/${orderId}/collection-date`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        collectionDate: newCollectionDate ? formattedDate : null,
        collectionStatus: newCollectionDate ? 'scheduled' : 'pending'
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
    alert(`Error updating collection date: ${error.message}`);
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

  const toggleGroup = (dateString) => {
    setExpandedGroups(prev => ({
      ...prev,
      [dateString]: !prev[dateString]
    }));
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
    'ready-collect': { bg: '#dcfce7', text: '#065f46', icon: Package },
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
      'Product': order.product || 'N/A',
      'Created On': order.dateTimeSubmission,
      'Payment Method': order.paymentMethod || 'N/A',
      'Payment Amount': order.paymentAmount ? `$${order.paymentAmount}` : 'N/A'
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Orders');
    
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(blob, `orders_${selectedDate || 'all'}_${format(new Date(), 'yyyyMMdd')}.xlsx`);
  };

  const getStatusStyle = (status) => {
    if (!status) return { ...styles.statusBadge, ...styles.statusPending };

    switch (status.toLowerCase()) {
      case 'ready-collect':
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

  const renderOrderCard = (order) => {
    const isJPMC = order.product === 'pharmacyjpmc';
    const isMOH = order.product === 'pharmacymoh';
    
    return (
      <div
        key={order._id}
        style={{
          ...styles.orderCard,
          ...(selectedOrders.includes(order._id) ? styles.selectedOrderCard : {}),
          borderLeft: `4px solid ${
            isJPMC ? '#3b82f6' : 
            isMOH ? '#10b981' : 
            '#6b7280'
          }`
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
            <span style={{
              ...styles.productBadge,
              backgroundColor: isJPMC ? '#dbeafe' : isMOH ? '#d1fae5' : '#e5e7eb',
              color: isJPMC ? '#1e40af' : isMOH ? '#065f46' : '#4b5563'
            }}>
              {isJPMC ? 'JPMC' : isMOH ? 'MOH' : 'Other'}
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

            {(userRole === 'jpmc' || userRole === 'gorush') && editingOrderId !== order._id && (
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
  };

    const groupOrdersByPharmacyType = (orders) => {
    return orders.reduce((acc, order) => {
      const type = order.product === 'pharmacymoh' ? 'MOH' : 
                  order.product === 'pharmacyjpmc' ? 'JPMC' : 'Other';
      if (!acc[type]) {
        acc[type] = [];
      }
      acc[type].push(order);
      return acc;
    }, {});
  };

  const renderOrderPopup = () => {
    if (!selectedOrder) return null;

    const isJPMC = selectedOrder.product === 'pharmacyjpmc';
    const isMOH = selectedOrder.product === 'pharmacymoh';

    return (
      <div style={styles.popup} onClick={closePopup}>
        <div style={styles.popupContent} onClick={(e) => e.stopPropagation()}>
          <div style={styles.popupHeader}>
            <div>
              <h2 style={styles.popupTitle}>Order Details</h2>
              <div style={{
                ...styles.productBadge,
                backgroundColor: isJPMC ? '#dbeafe' : isMOH ? '#d1fae5' : '#e5e7eb',
                color: isJPMC ? '#1e40af' : isMOH ? '#065f46' : '#4b5563',
                marginTop: '4px'
              }}>
                {isJPMC ? 'JPMC Pharmacy' : isMOH ? 'MOH Pharmacy' : 'Other Product'}
              </div>
            </div>
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
    <div style={styles.header}>
      <h1 style={styles.title}>Collection Dates</h1>
      <div style={styles.userRoleBadge}>
        {userRole === 'gorush' ? 'GoRush User' : 'Pharmacy User'}
      </div>
    </div>

    {!selectedDate && (
      <div style={styles.selectPrompt}>
        <p style={styles.promptText}>Please select a collection date to view orders</p>
      </div>
    )}

    <div style={styles.dateSelectorContainer}>
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
    </div>

    {selectedDate && (
      <div style={styles.ordersContainer}>
        <div style={styles.controlsContainer}>
          <h2 style={styles.dateTitle}>
            {selectedDate === 'no-date'
              ? 'Orders Without Collection Dates'
              : getDateLabel(selectedDate)}
          </h2>

          <div style={styles.actionsContainer}>
            <button
              onClick={() => setShowFilters(!showFilters)}
              style={styles.filterButton}
            >
              <Filter size={16} /> Filters
            </button>

            <div style={styles.exportButtons}>
              <button
                onClick={exportToExcel}
                style={styles.exportButton}
              >
                <Download size={16} /> Excel
              </button>
            </div>
          </div>
        </div>

        {showFilters && (
          <div style={styles.filterPanel}>
            <div style={styles.filterGroup}>
              <label style={styles.filterLabel}>Product Type</label>
              <select
                value={productFilter}
                onChange={(e) => setProductFilter(e.target.value)}
                style={styles.filterSelect}
              >
                <option value="all">All Products</option>
                <option value="pharmacyjpmc">JPMC Pharmacy</option>
                <option value="pharmacymoh">MOH Pharmacy</option>
              </select>
            </div>

            <div style={styles.filterGroup}>
              <label style={styles.filterLabel}>Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                style={styles.filterSelect}
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="ready-collect">Ready to Collect</option>
                <option value="collected">Collected</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div style={styles.filterGroup}>
              <label style={styles.filterLabel}>Search</label>
              <input
                type="text"
                placeholder="Search orders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={styles.searchInput}
              />
            </div>
          </div>
        )}

        {selectedOrders.length > 0 && userRole === 'gorush' && (
          <div style={styles.bulkActions}>
            <div style={styles.bulkSelectionInfo}>
              {selectedOrders.length} orders selected
            </div>
            <div style={styles.bulkStatusActions}>
              <select
                value=""
                onChange={(e) => handleBulkStatusUpdate(e.target.value)}
                style={styles.bulkStatusSelect}
              >
                <option value="">Update Status</option>
                <option value="pending">Pending</option>
                <option value="collected">Collected</option>
                <option value="cancelled">Cancelled</option>
              </select>
              <button
                onClick={() => setSelectedOrders([])}
                style={styles.clearSelectionButton}
              >
                Clear Selection
              </button>
            </div>
          </div>
        )}

        {selectedDate === 'no-date' ? (
          Object.entries(ordersWithoutDates).length > 0 ? (
            <div>
              {userRole === 'gorush' && (
                <div style={styles.selectAllContainer}>
                  <input
                    type="checkbox"
                    checked={selectAll}
                    onChange={handleSelectAll}
                    style={{ cursor: 'pointer' }}
                  />
                  <span>Select all orders</span>
                </div>
              )}
              {Object.entries(ordersWithoutDates).map(([dateString, dateOrders]) =>
                renderDateGroup(dateString, dateOrders)
              )}
            </div>
          ) : (
            <div style={styles.emptyState}>
              <Package size={48} color="#9ca3af" />
              <p style={styles.emptyText}>No orders without collection dates</p>
            </div>
          )
        ) : filteredOrders.length > 0 ? (
          <div>
            {userRole === 'gorush' && (
              <div style={styles.selectAllContainer}>
                <input
                  type="checkbox"
                  checked={selectAll}
                  onChange={handleSelectAll}
                  style={{ cursor: 'pointer' }}
                />
                <span>Select all orders</span>
              </div>
            )}
            {renderDateGroup(selectedDate, filteredOrders)}
          </div>
        ) : (
          <div style={styles.emptyState}>
            <Package size={48} color="#9ca3af" />
            <p style={styles.emptyText}>No orders for this date</p>
          </div>
        )}
      </div>
    )}

    {showPopup && renderOrderPopup()}
  </div>
);
        };


export default CollectionDatesPage;