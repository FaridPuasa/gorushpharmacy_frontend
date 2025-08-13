import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { 
 Phone, User, Package, MapPin, FileText, 
  Building, AlertCircle, Shield 
} from 'lucide-react';


const styles = {
  page: {
    minHeight: '100vh',
    backgroundColor: '#f9fafb',
    padding: '2rem',
  },
  container: {
    maxWidth: '1024px',
    margin: '0 auto',
    padding: '1rem',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: '0.5rem',
    boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
    border: '1px solid #e5e7eb',
    padding: '1.5rem',
    marginBottom: '1.5rem',
  },
  cardTitle: {
    fontSize: '1.125rem',
    fontWeight: '600',
    color: '#111827',
    marginBottom: '1rem',
    display: 'flex',
    alignItems: 'center',
  },
  label: {
    color: '#6b7280',
    fontSize: '0.875rem',
  },
  value: {
    fontWeight: '500',
    color: '#111827',
  },
  valueGreen: {
    fontWeight: '500',
    color: '#16a34a',
    fontSize: '1.125rem',
  },
  row: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0.5rem 0',
    borderBottom: '1px solid #f3f4f6',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: '1fr',
    gap: '1.5rem',
  },
  grid2: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '1.5rem',
    '@media (maxWidth: 768px)': {
      gridTemplateColumns: '1fr',
    }
  },
  remarks: {
    backgroundColor: '#f9fafb',
    borderRadius: '0.5rem',
    padding: '1rem',
    color: '#374151',
    lineHeight: '1.6',
  },
  notice: {
    backgroundColor: '#fef3c7',
    border: '1px solid #f59e0b',
    borderRadius: '0.5rem',
    padding: '0.75rem 1rem',
    marginBottom: '1rem',
    display: 'flex',
    alignItems: 'center',
    fontSize: '0.875rem',
    color: '#92400e',
  },
  logEntry: {
    borderLeft: '4px solid #3b82f6',
    padding: '1rem',
    marginBottom: '1rem',
    backgroundColor: '#f8fafc',
    borderRadius: '0.5rem',
  },
  remarkEntry: {
    borderLeft: '4px solid #10b981',
    padding: '1rem',
    marginBottom: '1rem',
    backgroundColor: '#f0fdf4',
    borderRadius: '0.5rem',
  },
  inputGroup: {
    display: 'flex',
    gap: '0.75rem',
    marginBottom: '1rem',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  input: {
    padding: '0.5rem 0.75rem',
    borderRadius: '0.375rem',
    border: '1px solid #d1d5db',
    fontSize: '0.875rem',
    flex: '1',
    minWidth: '200px',
  },
  select: {
    padding: '0.5rem 0.75rem',
    borderRadius: '0.375rem',
    border: '1px solid #d1d5db',
    fontSize: '0.875rem',
    minWidth: '150px',
  },
  button: {
    padding: '0.5rem 1rem',
    borderRadius: '0.375rem',
    fontSize: '0.875rem',
    fontWeight: '500',
    cursor: 'pointer',
    border: 'none',
    transition: 'all 0.2s ease',
  },
  buttonPrimary: {
    backgroundColor: '#3b82f6',
    color: 'white',
    '&:hover': {
      backgroundColor: '#2563eb',
    }
  },
  buttonSuccess: {
    backgroundColor: '#10b981',
    color: 'white',
    '&:hover': {
      backgroundColor: '#059669',
    }
  },
  badge: {
    backgroundColor: '#eff6ff',
    color: '#1d4ed8',
    padding: '0.25rem 0.75rem',
    borderRadius: '9999px',
    fontSize: '0.875rem',
    fontWeight: '500',
  },
  statusContainer: {
    display: 'flex',
    gap: '1rem',
    marginBottom: '1rem',
    flexWrap: 'wrap'
  },
  statusCard: {
    flex: 1,
    minWidth: '200px',
    backgroundColor: 'white',
    borderRadius: '0.5rem',
    padding: '1rem',
    border: '1px solid #e5e7eb',
    boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
  },
  statusHeader: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '0.5rem',
    fontSize: '0.875rem',
    fontWeight: '600',
    color: '#374151'
  },
  statusBadge: {
    padding: '0.25rem 0.5rem',
    borderRadius: '0.25rem',
    fontSize: '0.875rem',
    fontWeight: '500',
    display: 'inline-block'
  },
  statusSelect: {
    width: '100%',
    padding: '0.375rem 0.5rem',
    borderRadius: '0.25rem',
    border: '1px solid #d1d5db',
    fontSize: '0.875rem',
    marginTop: '0.5rem'
  },
  statusButton: {
    width: '100%',
    padding: '0.375rem 0.5rem',
    borderRadius: '0.25rem',
    border: 'none',
    fontSize: '0.875rem',
    fontWeight: '500',
    cursor: 'pointer',
    marginTop: '0.5rem'
  },
  editButton: {
  padding: '0.25rem 0.5rem',
  borderRadius: '0.25rem',
  backgroundColor: '#f3f4f6',
  color: '#4b5563',
  border: 'none',
  cursor: 'pointer',
  fontSize: '0.75rem',
  marginLeft: '0.5rem',
  '&:hover': {
    backgroundColor: '#e5e7eb'
  }
},
paymentInput: {
  width: '100px',
  padding: '0.25rem 0.5rem',
  borderRadius: '0.25rem',
  border: '1px solid #d1d5db'
},
paymentButton: {
  padding: '0.25rem 0.5rem',
  borderRadius: '0.25rem',
  border: 'none',
  cursor: 'pointer',
  marginLeft: '0.25rem'
},
paymentSave: {
  backgroundColor: '#3b82f6',
  color: 'white'
},
paymentCancel: {
  backgroundColor: '#f3f4f6',
  color: '#4b5563'
}
};

// Configuration object - replace with your actual API key
const config = {
  DETRACK_API_KEY: '"Ude778d93ebd628e6c942a4c4f359643e9cefc1949b17d433'
};

const OrderDetails = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState(null);
  const [detrackData, setDetrackData] = useState(null);
  const [detrackLoading, setDetrackLoading] = useState(false);
  const [detrackError, setDetrackError] = useState(null);

  const [editingPayment, setEditingPayment] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');
  
  // Form states
  const [logNote, setLogNote] = useState('');
  const [logCategory, setLogCategory] = useState('');
  const [logCreatedBy, setLogCreatedBy] = useState('');
  const [pharmacyRemark, setPharmacyRemark] = useState('');
  const [pharmacyUser, setPharmacyUser] = useState('');

  const statusColors = {
    pending: { bg: '#e0e7ff', text: '#3730a3' },
    'in progress': { bg: '#fef3c7', text: '#92400e' },
    ready: { bg: '#dbeafe', text: '#1e40af' },
    collected: { bg: '#dcfce7', text: '#166534' },
    completed: { bg: '#dcfce7', text: '#065f46' },
    cancelled: { bg: '#fee2e2', text: '#991b1b' }
  };

  // Helper function to get request headers with user role
  const getRequestHeaders = () => {
    const role = sessionStorage.getItem('userRole') || 'jpmc';
    return {
      'Content-Type': 'application/json',
      'X-User-Role': role
    };
  };

  useEffect(() => {
    // Get user role from sessionStorage
    const role = sessionStorage.getItem('userRole') || 'jpmc';
    setUserRole(role);
    
    const fetchOrder = async () => {
      try {
        setLoading(true);
        const response = await fetch(`https://grpharmacyappserver.onrender.com/api/orders/${id}`, {
          method: 'GET',
          headers: getRequestHeaders()
        });
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: 'Failed to fetch order' }));
          throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        setOrder(data);

         if (data.doTrackingNumber) {
        fetchDetrackData(data.doTrackingNumber);
      }
      } catch (err) {
        console.error('Error fetching order:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id]);

  const formatMilestoneStatus = (status) => {
  const statusMap = {
    'info_recv': 'Information Received',
    'dispatched': 'Dispatched',
    'at_warehouse': 'At Warehouse',
    'out_for_delivery': 'Out for Delivery',
    'delivered': 'Delivered',
    'failed': 'Delivery Failed',
    'cancelled': 'Cancelled'
  };
  
  return statusMap[status] || status;
};

const fetchDetrackData = async (trackingNumber) => {
  if (!trackingNumber) return;
  
  setDetrackLoading(true);
  setDetrackError(null);
  
  try {
    const response = await fetch(`https://grpharmacyappserver.onrender.com/api/detrack/${trackingNumber}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Failed to fetch DeTrack data' }));
      throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
    }
    
    const apiResponse = await response.json();
    
    // Handle the nested data structure
    const data = apiResponse.data || apiResponse;
    setDetrackData(data);
    
    // REMOVED the automatic log creation part
    
  } catch (err) {
    console.error('Error fetching DeTrack data:', err);
    setDetrackError(err.message);
  } finally {
    setDetrackLoading(false);
  }
};

useEffect(() => {
  if (order) {
    setPaymentAmount(order.paymentAmount || '');
  }
}, [order]);

const handleUpdatePaymentAmount = async () => {
  try {
    // First update our database
    const response = await fetch(`https://grpharmacyappserver.onrender.com/api/orders/${id}/payment`, {
      method: 'PUT',
      headers: getRequestHeaders(),
      body: JSON.stringify({ 
        paymentAmount: parseFloat(paymentAmount),
        doTrackingNumber: order.doTrackingNumber
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Failed to update payment amount' }));
      throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
    }
    
    const responseData = await response.json();
    
    // Handle different response structures from backend
    let updatedOrder;
    if (responseData.order) {
      // Response has nested structure (with DeTrack update info)
      updatedOrder = responseData.order;
    } else {
      // Response is the order directly (no tracking number case)
      updatedOrder = responseData;
    }
    
    // Update both the order and paymentAmount states
    setOrder(updatedOrder);
    setPaymentAmount(updatedOrder.paymentAmount || '');
    setEditingPayment(false);
    
    // Show appropriate success message based on DeTrack update status
    if (responseData.detrackUpdate === false) {
      alert(`Payment amount updated successfully! Note: ${responseData.message || 'DeTrack update had issues but order was saved.'}`);
    } else {
      alert('Payment amount updated successfully!');
    }
    
  } catch (err) {
    console.error('Error updating payment amount:', err);
    alert(`Error updating payment amount: ${err.message}`);
    // Reset to original value on error
    setPaymentAmount(order.paymentAmount || '');
    setEditingPayment(false);
  }
};

// Updated handleStatusUpdate function for the frontend
const handleStatusUpdate = async (statusType, newStatus) => {
  try {
    const endpoint = statusType === 'goRush' ? 'go-rush-status' : 'pharmacy-status';
    
    // First update our database
    const response = await fetch(`https://grpharmacyappserver.onrender.com/api/orders/${id}/${endpoint}`, {
      method: 'PUT',
      headers: getRequestHeaders(),
      body: JSON.stringify({ 
        status: newStatus,
        currentStatus: newStatus.toLowerCase() === 'cancelled' ? 'Cancelled' : undefined
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Failed to update status' }));
      throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
    }
    
    const updatedOrder = await response.json();
    setOrder(updatedOrder);

    // If status was changed to cancelled and we have a tracking number, call backend to update DeTrack
    if (newStatus.toLowerCase() === 'cancelled' && order.doTrackingNumber) {
      try {
        console.log('Attempting to cancel DeTrack job:', order.doTrackingNumber);
        
        const detrackResponse = await fetch(
          `https://grpharmacyappserver.onrender.com/api/detrack/${order.doTrackingNumber}/cancel`, 
          {
            method: 'PUT',
            headers: getRequestHeaders()
          }
        );
        
        if (!detrackResponse.ok) {
          const errorData = await detrackResponse.json().catch(() => ({ error: 'Unknown error' }));
          console.error('Failed to update DeTrack status:', errorData);
          
          // Show a warning but don't fail the entire operation
          alert(`Order was cancelled successfully, but DeTrack update had issues: ${errorData.error || 'Unknown error'}\n\nThe order is still cancelled in our system.`);
        } else {
          const detrackData = await detrackResponse.json();
          console.log('DeTrack cancellation result:', detrackData);
          
          if (detrackData.detrackError) {
            alert(`Order cancelled successfully.\n\nNote: ${detrackData.message}`);
          } else {
            // Show success message only if everything worked
            alert('Order cancelled successfully and DeTrack has been updated.');
          }
        }

        // Refresh order data after cancellation attempt
        const updatedOrderResponse = await fetch(`https://grpharmacyappserver.onrender.com/api/orders/${id}`, {
          method: 'GET',
          headers: getRequestHeaders()
        });
        
        if (updatedOrderResponse.ok) {
          const updatedOrderData = await updatedOrderResponse.json();
          setOrder(updatedOrderData);
        }

      } catch (detrackError) {
        console.error('Error updating DeTrack status:', detrackError);
        // Show a user-friendly warning
        alert(`Order was cancelled successfully in our system.\n\nHowever, there was an issue updating the delivery service: ${detrackError.message}\n\nPlease contact the delivery service directly if needed.`);
      }
    } else {
      // For non-cancellation status updates, show simple success
      alert(`Status updated to: ${newStatus}`);
    }
  } catch (err) {
    console.error('Error updating status:', err);
    alert(`Error updating status: ${err.message}`);
  }
};

  const handleAddLog = async () => {
    if (!logNote.trim() || !logCategory || !logCreatedBy.trim()) {
      alert('Please fill all fields');
      return;
    }

    try {
      const response = await fetch(`https://grpharmacyappserver.onrender.com/api/orders/${id}/logs`, {
        method: 'POST',
        headers: getRequestHeaders(),
        body: JSON.stringify({
          note: logNote,
          category: logCategory,
          createdBy: logCreatedBy
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to add log' }));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }
      
      const newLog = await response.json();
      setOrder(prev => ({
        ...prev,
        logs: [newLog.log, ...(prev.logs || [])]
      }));
      
      setLogNote('');
      setLogCategory('');
      setLogCreatedBy('');
    } catch (err) {
      console.error('Error adding log:', err);
      alert(`Error adding log: ${err.message}`);
    }
  };

  const handleAddPharmacyRemark = async () => {
    if (!pharmacyRemark.trim() || !pharmacyUser.trim()) {
      alert('Please fill all fields');
      return;
    }

    try {
      const response = await fetch(`https://grpharmacyappserver.onrender.com/api/orders/${id}/pharmacy-remarks`, {
        method: 'POST',
        headers: getRequestHeaders(),
        body: JSON.stringify({
          remark: pharmacyRemark,
          createdBy: pharmacyUser
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to add remark' }));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }
      
      const newRemark = await response.json();
      setOrder(prev => ({
        ...prev,
        pharmacyRemarks: [newRemark.remark, ...(prev.pharmacyRemarks || [])]
      }));
      
      setPharmacyRemark('');
      setPharmacyUser('');
    } catch (err) {
      console.error('Error adding pharmacy remark:', err);
      alert(`Error adding pharmacy remark: ${err.message}`);
    }
  };

  if (loading) return (
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={styles.card}>Loading order details...</div>
      </div>
    </div>
  );

  if (error) return (
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={{ ...styles.card, color: '#dc2626' }}>
          <h2>Error Loading Order</h2>
          <p>{error}</p>
          <p style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '1rem' }}>
            Current user role: {userRole || 'Not set'}
          </p>
        </div>
      </div>
    </div>
  );

  if (!order) return (
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={styles.card}>Order not found</div>
      </div>
    </div>
  );

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        {/* Header */}
        <div style={styles.card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h1 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#111827', marginBottom: '0.5rem' }}>Order Details</h1>
              <p style={styles.label}>Order ID: {order._id}</p>
              <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem' }}>
                User Role: {userRole} | Product: {order.product || 'legacy'}
              </p>
            </div>
            <div style={styles.badge}>
              {order.doTrackingNumber || 'No tracking number'}
            </div>
          </div>
        </div>
        
        <div style={styles.statusContainer}>
          {/* Go Rush Status Card */}
          {(userRole === 'gorush' || userRole === 'go-rush') && (
  <div style={styles.statusCard}>
    <div style={styles.statusHeader}>
      <Package style={{ width: '1rem', height: '1rem', marginRight: '0.5rem' }} />
      Go Rush Status
    </div>
    <div style={{
      ...styles.statusBadge,
      backgroundColor: statusColors[order.goRushStatus?.toLowerCase()]?.bg || '#f3f4f6',
      color: statusColors[order.goRushStatus?.toLowerCase()]?.text || '#6b7280'
    }}>
      {order.goRushStatus || 'pending'}
    </div>
    <select
      value={order.goRushStatus || 'pending'}
      onChange={(e) => handleStatusUpdate('goRush', e.target.value)}
      style={styles.statusSelect}
    >
      <option value="pending">Pending</option>
      <option value="collected">Collected</option>
      <option value="cancelled">Cancelled</option>
    </select>
  </div>
)}


          {/* Pharmacy Status Card */}
          <div style={styles.statusCard}>
            <div style={styles.statusHeader}>
              <Building style={{ width: '1rem', height: '1rem', marginRight: '0.5rem' }} />
              Pharmacy Status
            </div>
            <div style={{
              ...styles.statusBadge,
              backgroundColor: statusColors[order.pharmacyStatus?.toLowerCase()]?.bg || '#f3f4f6',
              color: statusColors[order.pharmacyStatus?.toLowerCase()]?.text || '#6b7280'
            }}>
              {order.pharmacyStatus || 'pending'}
            </div>
            {(userRole === 'jpmc' || userRole === 'moh') && (
              <>
                <select
                  value={order.pharmacyStatus || 'pending'}
                  onChange={(e) => handleStatusUpdate('pharmacy', e.target.value)}
                  style={styles.statusSelect}
                >
                  <option value="pending">Pending</option>
                  <option value="ready">Ready to be Collected</option>
                  <option value="cancelled">Cancelled</option>
                </select>

              </>
            )}
          </div>
        </div>

        {/* Grid */}
        <div style={styles.grid2}>
          {/* Order Info */}
          <div style={styles.card}>
            <h2 style={styles.cardTitle}>
              <FileText style={{ width: '1.25rem', height: '1.25rem', marginRight: '0.5rem', color: '#2563eb' }} /> 
              Order Information
            </h2>
            <div>
              <div style={styles.row}>
                <span style={styles.label}>Tracking Number:</span>
                <span style={styles.value}>{order.doTrackingNumber || 'N/A'}</span>
              </div>
              <div style={styles.row}>
                <span style={styles.label}>Created On:</span>
                <span style={styles.value}>{order.creationDate}</span>
              </div>
              <div style={styles.row}>
                <span style={styles.label}>Payment Method:</span>
                <span style={styles.value}>{order.paymentMethod || 'N/A'}</span>
              </div>
              <div style={styles.row}>
                <span style={styles.label}>Delivery Type:</span>
                <span style={styles.value}>{order.jobMethod || 'N/A'}</span>
              </div>
<div style={styles.row}>
  <span style={styles.label}>Payment Amount:</span>
  {!order ? (
    <span style={styles.value}>Loading...</span>
  ) : editingPayment ? (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
      <input
        type="number"
        value={paymentAmount}
        onChange={(e) => setPaymentAmount(e.target.value)}
        style={styles.paymentInput}
      />
      <button
        onClick={handleUpdatePaymentAmount}
        style={{ ...styles.paymentButton, ...styles.paymentSave }}
      >
        Save
      </button>
      <button
        onClick={() => {
          setEditingPayment(false);
          setPaymentAmount(order.paymentAmount || '');
        }}
        style={{ ...styles.paymentButton, ...styles.paymentCancel }}
      >
        Cancel
      </button>
    </div>
  ) : (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
      <span style={styles.valueGreen}>
        {order.paymentAmount ? `$${order.paymentAmount}` : 'N/A'}
      </span>
      {(userRole === 'gorush') && (
        <button
          onClick={() => setEditingPayment(true)}
          style={styles.editButton}
        >
          Edit
        </button>
      )}
    </div>
  )}
</div>
            </div>
          </div>

          {/* Patient Info */}
          <div style={styles.card}>
            <h2 style={styles.cardTitle}>
              <User style={{ width: '1.25rem', height: '1.25rem', marginRight: '0.5rem', color: '#16a34a' }} /> 
              Patient Information
            </h2>
            <div>
              <div style={styles.row}>
                <span style={styles.label}>Patient Name:</span>
                <span style={styles.value}>{order.receiverName || 'N/A'}</span>
              </div>
              <div style={styles.row}>
                <span style={styles.label}>Date of Birth:</span>
                <span style={styles.value}>{order.dateOfBirth || 'N/A'}</span>
              </div>
              <div style={styles.row}>
                <span style={styles.label}>IC Number:</span>
                <span style={styles.value}>{order.icPassNum || 'N/A'}</span>
              </div>
              <div style={styles.row}>
                <span style={styles.label}>Patient Number:</span>
                <span style={styles.value}>{order.patientNumber || 'N/A'}</span>
              </div>
              <div style={styles.row}>
                <span style={styles.label}>Paying Patient:</span>
                <span style={styles.value}>{order.payingPatient || 'N/A'}</span>
              </div>
              <div style={{ ...styles.row, borderBottom: 'none' }}>
                <span style={styles.label}>Passport:</span>
                <span style={styles.value}>{order.passport || 'N/A'}</span>
              </div>
            </div>
          </div>

          {/* Contact Info */}
          <div style={styles.card}>
            <h2 style={styles.cardTitle}>
              <Phone style={{ width: '1.25rem', height: '1.25rem', marginRight: '0.5rem', color: '#9333ea' }} /> 
              Contact Information
            </h2>
            <div>
              <div style={styles.row}>
                <span style={styles.label}>Customer Phone:</span>
                <span style={styles.value}>{order.receiverPhoneNumber || 'N/A'}</span>
              </div>
              <div style={{ ...styles.row, borderBottom: 'none' }}>
                <span style={styles.label}>Additional Phone:</span>
                <span style={styles.value}>{order.additionalPhoneNumber || 'N/A'}</span>
              </div>
            </div>
          </div>

          {/* Address Info */}
          <div style={styles.card}>
            <h2 style={styles.cardTitle}>
              <MapPin style={{ width: '1.25rem', height: '1.25rem', marginRight: '0.5rem', color: '#dc2626' }} /> 
              Address & Appointment
            </h2>
            <div>
              <div style={styles.row}>
                <span style={styles.label}>Customer Address:</span>
                <span style={styles.value}>{order.receiverAddress || 'N/A'}</span>
              </div>
              <div style={{ ...styles.row, borderBottom: 'none' }}>
                <span style={styles.label}>Appointment Place:</span>
                <span style={styles.value}>{order.appointmentPlace || 'N/A'}</span>
              </div>
              <div style={{ ...styles.row, borderBottom: 'none' }}>
                <span style={styles.label}>Appointment District:</span>
                <span style={styles.value}>{order.appointmentDistrict || 'N/A'}</span>
              </div>
              <div style={{ ...styles.row, borderBottom: 'none' }}>
                <span style={styles.label}>Pharmacy:</span>
                <span style={styles.value}>{order.sendOrderTo || 'N/A'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Patient Remarks */}
        {order.remarks && (
          <div style={styles.card}>
            <h2 style={styles.cardTitle}>
              <FileText style={{ width: '1.25rem', height: '1.25rem', marginRight: '0.5rem', color: '#f97316' }} /> 
              Patient Remarks
            </h2>
            <div style={styles.remarks}>
              <p>{order.remarks}</p>
            </div>
          </div>
        )}

        {detrackLoading && (
  <div style={styles.card}>
    <p>Loading delivery status...</p>
  </div>
)}

{detrackError && (
  <div style={{ ...styles.card, color: '#dc2626' }}>
    <p>Error loading delivery status: {detrackError}</p>
  </div>
)}

{userRole === 'gorush' && detrackData && (
  <div style={styles.card}>
    <h2 style={styles.cardTitle}>
      <MapPin style={{ width: '1.25rem', height: '1.25rem', marginRight: '0.5rem', color: '#3b82f6' }} /> 
      Delivery Status
    </h2>

    <div style={{ marginTop: '1rem' }}>
      <div style={styles.row}>
        <span style={styles.label}>Tracking Status:</span>
        <span style={styles.value}>{detrackData.tracking_status || 'N/A'}</span>
      </div>
      <div style={styles.row}>
        <span style={styles.label}>Tracking Link:</span>
        <span style={styles.value}>
          {detrackData.tracking_link ? (
            <a href={detrackData.tracking_link} target="_blank" rel="noopener noreferrer">
              Track Package
            </a>
          ) : 'N/A'}
        </span>
      </div>
      <div style={styles.row}>
        <span style={styles.label}>Assigned To:</span>
        <span style={styles.value}>{detrackData.assign_to || 'Unassigned'}</span>
      </div>
      <div style={styles.row}>
        <span style={styles.label}>POD:</span>
        <span style={styles.value}>
          {detrackData.photo_1_file_url ? (
            <a href={detrackData.photo_1_file_url} target="_blank" rel="noopener noreferrer">
              View POD
            </a>
          ) : 'N/A'}
        </span>
      </div>
    </div>

    <h3 style={{ margin: '1.5rem 0 0.5rem', fontSize: '1rem', fontWeight: '600' }}>
      Delivery Milestones
    </h3>

    {detrackData.milestones && detrackData.milestones.length > 0 ? (
      <div style={{ marginTop: '0.5rem' }}>
        {detrackData.milestones.map((milestone, idx) => (
          <div key={idx} style={{ 
            padding: '0.75rem',
            marginBottom: '0.5rem',
            backgroundColor: '#f8fafc',
            borderRadius: '0.375rem',
            borderLeft: '4px solid #3b82f6'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>
                  {formatMilestoneStatus(milestone.status)}
                </div>
                <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                  {milestone.reason || 'No reason provided'}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                  {milestone.user_name || 'System'}
                </div>
                <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                  {milestone.pod_at ? new Date(milestone.pod_at).toLocaleString() : 'N/A'}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    ) : (
      <p style={{ color: '#6b7280', fontStyle: 'italic' }}>
        No milestones available
      </p>
    )}
  </div>
)}


      {(userRole === 'gorush' || userRole === 'go-rush') && (
  <div style={styles.card}>
    <h2 style={styles.cardTitle}>
      <Shield style={{ width: '1.25rem', height: '1.25rem', marginRight: '0.5rem', color: '#3b82f6' }} /> 
      Go Rush Internal Logs
    </h2>
    
    <div style={styles.notice}>
      <AlertCircle style={{ width: '1rem', height: '1rem', marginRight: '0.5rem' }} />
      <strong>Go Rush Staff Only:</strong> Internal tracking and communication
    </div>

    <div style={styles.inputGroup}>
      <input
        value={logCreatedBy}
        onChange={(e) => setLogCreatedBy(e.target.value)}
        placeholder="Your name"
        style={styles.input}
        aria-label="Log creator name"
      />
      <select
        value={logCategory}
        onChange={(e) => setLogCategory(e.target.value)}
        style={styles.select}
        aria-label="Log category"
      >
        <option value="">Select Category</option>
        <option value="Delivery Issue">Delivery Issue</option>
        <option value="Payment Query">Payment Query</option>
        <option value="Customer Feedback">Customer Feedback</option>
        <option value="Status Update">Status Update</option>
        <option value="Other">Other</option>
      </select>
      <input
        value={logNote}
        onChange={(e) => setLogNote(e.target.value)}
        placeholder="Enter internal note"
        style={styles.input}
        aria-label="Log note"
      />
      <button
        onClick={handleAddLog}
        style={{ ...styles.button, ...styles.buttonPrimary }}
      >
        Add Log
      </button>
    </div>

    {order.logs?.length > 0 ? (
      <div style={{ marginTop: '1rem' }}>
        {order.logs.map((log, idx) => (
          <div key={idx} style={styles.logEntry}>
            <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.25rem' }}>
              {new Date(log.createdAt).toLocaleString()} by <strong>{log.createdBy}</strong>
            </div>
            <div style={{ fontWeight: '600', color: '#111827', marginBottom: '0.25rem' }}>
              {log.category}
            </div>
            <div style={{ color: '#4b5563' }}>
              {log.note}
            </div>
          </div>
        ))}
      </div>
    ) : (
      <p style={{ color: '#6b7280', textAlign: 'center', fontStyle: 'italic' }}>
        No internal logs yet
      </p>
    )}
  </div>
)}

        {/* Pharmacy Remarks Section - Show for both roles but only allow JPMC/MOH to add */}
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>
            <Building style={{ width: '1.25rem', height: '1.25rem', marginRight: '0.5rem', color: '#10b981' }} /> 
            Pharmacy Remarks
          </h2>

          {(userRole === 'jpmc' || userRole === 'moh') ? (
            <>
              <div style={{ ...styles.notice, backgroundColor: '#dcfce7', borderColor: '#10b981', color: '#166534' }}>
                <AlertCircle style={{ width: '1rem', height: '1rem', marginRight: '0.5rem' }} />
                <strong>{userRole === 'jpmc' ? 'JPMC' : 'MOH'} Pharmacy Staff:</strong> Clinical notes and medication-related remarks
              </div>

              <div style={styles.inputGroup}>
                <input
                  value={pharmacyUser}
                  onChange={(e) => setPharmacyUser(e.target.value)}
                  placeholder="Pharmacist name"
                  style={styles.input}
                  aria-label="Pharmacist name"
                />
                <input
                  value={pharmacyRemark}
                  onChange={(e) => setPharmacyRemark(e.target.value)}
                  placeholder="Enter pharmacy remark"
                  style={styles.input}
                  aria-label="Pharmacy remark"
                />
                <button
                  onClick={handleAddPharmacyRemark}
                  style={{ ...styles.button, ...styles.buttonSuccess }}
                >
                  Add Remark
                </button>
              </div>
            </>
          ) : (
            <div style={{ ...styles.notice, backgroundColor: '#f3f4f6', borderColor: '#9ca3af', color: '#374151' }}>
              <AlertCircle style={{ width: '1rem', height: '1rem', marginRight: '0.5rem' }} />
              <strong>View Only:</strong> Pharmacy remarks from JPMC/MOH staff
            </div>
          )}

          {order.pharmacyRemarks?.length > 0 ? (
            <div style={{ marginTop: '1rem' }}>
              {order.pharmacyRemarks.map((remark, idx) => (
                <div key={idx} style={styles.remarkEntry}>
                  <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.25rem' }}>
                    {new Date(remark.createdAt).toLocaleString()} by <strong>{remark.createdBy}</strong>
                  </div>
                  <div style={{ color: '#374151' }}>
                    {remark.remark}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: '#6b7280', textAlign: 'center', fontStyle: 'italic' }}>
              No pharmacy remarks yet
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;