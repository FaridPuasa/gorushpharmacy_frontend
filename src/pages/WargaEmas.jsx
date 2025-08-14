import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, User, FileText, Phone, RotateCw, Calendar, MapPin, Package, Clock } from 'lucide-react';

const WargaEmas = () => {
const navigate = useNavigate();
  const [searchType, setSearchType] = useState('patientNumber');
  const [searchValue, setSearchValue] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [reorderModalIsOpen, setReorderModalIsOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [reorderForm, setReorderForm] = useState({
    jobMethod: 'Standard',
    paymentMethod: 'Cash',
    remarks: ''
  });
  const [reorderLoading, setReorderLoading] = useState(false);
  const [reorderError, setReorderError] = useState(null);
  const [reorderSuccess, setReorderSuccess] = useState(false);

  const handleViewDetails = (orderId) => {
    navigate(`/orders/${orderId}`);
  };



  const handleReorderClick = (order) => {
    setSelectedOrder(order);
    setReorderForm({
      jobMethod: order.jobMethod || 'Standard',
      paymentMethod: order.paymentMethod || 'Cash',
      remarks: ''
    });
    setReorderModalIsOpen(true);
    setReorderSuccess(false);
  };

  const handleReorderSubmit = async (e) => {
    e.preventDefault();
    setReorderLoading(true);
    setReorderError(null);

    try {
      const response = await fetch('https://grpharmacyappserver.onrender.com/api/orders/reorder-webhook-only', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Role': sessionStorage.getItem('userRole') || 'jpmc'
        },
        body: JSON.stringify({
          originalOrderId: selectedOrder._id,
          ...reorderForm
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create reorder');
      }

      const data = await response.json();
      setReorderSuccess(true);
    } catch (err) {
      console.error('Reorder error:', err);
      setReorderError(err.message);
    } finally {
      setReorderLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    
    if (!searchValue.trim()) {
      setError('Please enter a search value');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`https://grpharmacyappserver.onrender.com/api/orders/search?${searchType}=${searchValue}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Role': sessionStorage.getItem('userRole') || 'jpmc'
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to search orders' }));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      setSearchResults(data);
    } catch (err) {
      console.error('Search error:', err);
      setError(err.message);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };


  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={styles.card}>
          <h1 style={styles.title}>
            <Search size={20} />
            Order Search
          </h1>
          
          <div style={styles.searchForm}>
            <div style={styles.searchInputGroup}>
              <select
                value={searchType}
                onChange={(e) => setSearchType(e.target.value)}
                style={styles.searchInput}
              >
                <option value="patientNumber">Patient Number</option>
                <option value="icPassNum">IC/Passport Number</option>
                <option value="receiverPhoneNumber">Phone Number</option>
              </select>
              
              <input
                type="text"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                placeholder={`Enter ${searchType === 'patientNumber' ? 'Patient Number' : 
                             searchType === 'icPassNum' ? 'IC/Passport Number' : 'Phone Number'}`}
                style={styles.searchInput}
              />
              
              <button 
                type="submit" 
                style={styles.searchButton}
                disabled={loading}
                onClick={handleSearch}
              >
                <Search size={16} />
                {loading ? 'Searching...' : 'Search'}
              </button>
            </div>
          </div>

          {error && (
            <div style={styles.errorAlert}>
              {error}
            </div>
          )}

          <div style={styles.resultsContainer}>
            {loading ? (
              <div style={styles.loadingState}>
                <div style={styles.loadingSpinner}></div>
                <p>Searching orders...</p>
              </div>
            ) : searchResults.length > 0 ? (
              <>
                <div style={styles.resultsHeader}>
                  Found {searchResults.length} order{searchResults.length !== 1 ? 's' : ''}
                </div>
                {searchResults.map((order) => (
                  <div 
                    key={order._id} 
                    style={styles.orderCard}
                  >
                    <div style={styles.cardHeader}>
                      <div style={styles.orderInfo}>
                        <div style={styles.iconBadge}>
                          <FileText size={18} />
                        </div>
                        <div>
                          <div style={styles.orderId}>{order.doTrackingNumber}</div>
                          <div style={styles.orderDate}>
                            <Calendar size={14} />
                            {formatDate(order.creationDate)}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div style={styles.cardContent}>
                      <div style={styles.patientSection}>
                        <div style={styles.patientInfo}>
                          <User size={16} style={styles.sectionIcon} />
                          <div>
                            <div style={styles.patientName}>{order.receiverName || 'N/A'}</div>
                            <div style={styles.patientId}>Patient #{order.patientNumber || 'N/A'}</div>
                          </div>
                        </div>
                      </div>

                      <div style={styles.detailsGrid}>
                        <div style={styles.detailItem}>
                          <FileText size={14} style={styles.detailIcon} />
                          <div style={styles.detailContent}>
                            <div style={styles.detailLabel}>IC/Passport</div>
                            <div style={styles.detailValue}>{order.icPassNum || order.passport || 'N/A'}</div>
                          </div>
                        </div>
                        
                        <div style={styles.detailItem}>
                          <Phone size={14} style={styles.detailIcon} />
                          <div style={styles.detailContent}>
                            <div style={styles.detailLabel}>Phone</div>
                            <div style={styles.detailValue}>{order.receiverPhoneNumber || 'N/A'}</div>
                          </div>
                        </div>

                        <div style={styles.detailItem}>
                          <Package size={14} style={styles.detailIcon} />
                          <div style={styles.detailContent}>
                            <div style={styles.detailLabel}>Product</div>
                            <div style={styles.detailValue}>{order.product || 'N/A'}</div>
                          </div>
                        </div>
                        
                        <div style={styles.detailItem}>
                          <MapPin size={14} style={styles.detailIcon} />
                          <div style={styles.detailContent}>
                            <div style={styles.detailLabel}>Area</div>
                            <div style={styles.detailValue}>{order.area || 'N/A'}</div>
                          </div>
                        </div>
                      </div>
                      
                      {order.receiverAddress && (
                        <div style={styles.addressSection}>
                          <div style={styles.addressHeader}>
                            <MapPin size={14} />
                            <span>Delivery Address</span>
                          </div>
                          <div style={styles.addressText}>{order.receiverAddress}</div>
                        </div>
                      )}
                    </div>

                    <div style={styles.cardActions}>
                                  <button 
            style={styles.viewDetailsButton}
            onClick={() => handleViewDetails(order._id)}
          >
            View Details
          </button>
                      <button 
                        style={styles.reorderButton}
                        onClick={() => handleReorderClick(order)}
                      >
                        <RotateCw size={16} />
                        Reorder Medicine
                      </button>
                    </div>
                  </div>
                ))}
              </>
            ) : (
              <div style={styles.emptyState}>
                <div style={styles.emptyIcon}>
                  <Search size={48} />
                </div>
                <h3 style={styles.emptyTitle}>
                  {searchValue ? 'No orders found' : 'Ready to search'}
                </h3>
                <p style={styles.emptyMessage}>
                  {searchValue ? 'Try adjusting your search criteria' : 'Enter search criteria above to find orders'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Reorder Modal */}
      {reorderModalIsOpen && (
        <div style={styles.modalOverlay} onClick={() => setReorderModalIsOpen(false)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <div style={styles.modalIconBadge}>
                <RotateCw size={20} />
              </div>
              <h2 style={styles.modalTitle}>Reorder Medicine</h2>
            </div>
            
            {selectedOrder && (
              <div>
                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>Patient Name</label>
                  <input
                    type="text"
                    value={selectedOrder.receiverName || 'N/A'}
                    readOnly
                    style={styles.formInputReadonly}
                  />
                </div>
                
                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>Patient Number</label>
                  <input
                    type="text"
                    value={selectedOrder.patientNumber || 'N/A'}
                    readOnly
                    style={styles.formInputReadonly}
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>Product</label>
                  <input
                    type="text"
                    value={selectedOrder.product || 'N/A'}
                    readOnly
                    style={styles.formInputReadonly}
                  />
                </div>
                
                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>Job Method</label>
                  <select
                    value={reorderForm.jobMethod}
                    onChange={(e) => setReorderForm({...reorderForm, jobMethod: e.target.value})}
                    style={styles.formSelect}
                    required
                  >
                    <option value="Standard">Standard</option>
                    <option value="Express">Express</option>
                    <option value="Immediate">Immediate</option>
                  </select>
                </div>
                
                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>Payment Method</label>
                  <select
                    value={reorderForm.paymentMethod}
                    onChange={(e) => setReorderForm({...reorderForm, paymentMethod: e.target.value})}
                    style={styles.formSelect}
                    required
                  >
                    <option value="Cash">Cash</option>
                    <option value="Bill Payment (BIBD)">Bill Payment (BIBD)</option>
                    <option value="Bank Transfer (BIBD)">Bank Transfer (BIBD)</option>
                    <option value="Bill Payment (Baiduri)">Bill Payment (Baiduri)</option>
                  </select>
                </div>
                
                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>Remarks</label>
                  <textarea
                    value={reorderForm.remarks}
                    onChange={(e) => setReorderForm({...reorderForm, remarks: e.target.value})}
                    style={styles.formTextarea}
                    rows="3"
                    placeholder="Optional remarks..."
                  />
                </div>
                
                {reorderError && (
                  <div style={styles.errorMessage}>{reorderError}</div>
                )}
                
                {reorderSuccess && (
                  <div style={styles.successMessage}>
                    Reorder created successfully!
                  </div>
                )}
                
                <div style={styles.modalButtons}>
                  <button 
                    type="button" 
                    onClick={() => setReorderModalIsOpen(false)}
                    style={styles.cancelButton}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    disabled={reorderLoading}
                    style={styles.submitButton}
                    onClick={handleReorderSubmit}
                  >
                    {reorderLoading ? (
                      <>
                        <div style={styles.buttonSpinner}></div>
                        Processing...
                      </>
                    ) : (
                      'Submit Reorder'
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  page: {
    minHeight: '100vh',
    backgroundColor: '#f8fafc',
    padding: '2rem',
  },
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '1rem',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: '12px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
    border: '1px solid #e2e8f0',
    padding: '2rem',
    marginBottom: '2rem',
  },
  title: {
    fontSize: '1.75rem',
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: '2rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem'
  },
  searchForm: {
    marginBottom: '2rem'
  },
  searchInputGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    flexWrap: 'wrap'
  },
  searchInput: {
    flex: 1,
    minWidth: '200px',
    padding: '0.75rem 1rem',
    borderRadius: '8px',
    border: '1px solid #d1d5db',
    fontSize: '0.875rem',
    transition: 'border-color 0.2s ease',
    '&:focus': {
      outline: 'none',
      borderColor: '#3b82f6',
      boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)'
    }
  },
  searchButton: {
    padding: '0.75rem 1.5rem',
    borderRadius: '8px',
    backgroundColor: '#3b82f6',
    color: 'white',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontWeight: '500',
    transition: 'background-color 0.2s ease',
    '&:hover': {
      backgroundColor: '#2563eb'
    },
    '&:disabled': {
      backgroundColor: '#9ca3af',
      cursor: 'not-allowed'
    }
  },
  errorAlert: {
    padding: '0.75rem 1rem',
    backgroundColor: '#fef2f2',
    color: '#dc2626',
    border: '1px solid #fecaca',
    borderRadius: '8px',
    marginBottom: '1rem',
    fontSize: '0.875rem'
  },
  resultsContainer: {
    marginTop: '2rem'
  },
  resultsHeader: {
    fontSize: '0.875rem',
    color: '#6b7280',
    marginBottom: '1rem',
    fontWeight: '500'
  },
  loadingState: {
    textAlign: 'center',
    padding: '3rem 0',
    color: '#6b7280'
  },
  loadingSpinner: {
    width: '2rem',
    height: '2rem',
    border: '3px solid #e5e7eb',
    borderTop: '3px solid #3b82f6',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    margin: '0 auto 1rem'
  },
  orderCard: {
    backgroundColor: 'white',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
    marginBottom: '1.5rem',
    transition: 'all 0.2s ease',
    overflow: 'hidden',
    '&:hover': {
      boxShadow: '0 8px 25px rgba(0, 0, 0, 0.1)',
      transform: 'translateY(-2px)'
    }
  },
  cardHeader: {
    padding: '1.5rem 1.5rem 1rem',
    borderBottom: '1px solid #f1f5f9',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
    gap: '1rem'
  },
  orderInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem'
  },
  iconBadge: {
    width: '3rem',
    height: '3rem',
    borderRadius: '10px',
    backgroundColor: '#dbeafe',
    color: '#2563eb',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  orderId: {
    fontSize: '1.125rem',
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: '0.25rem'
  },
  orderDate: {
    fontSize: '0.875rem',
    color: '#64748b',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem'
  },
  cardContent: {
    padding: '0 1.5rem 1rem'
  },
  patientSection: {
    marginBottom: '1.5rem',
    padding: '1rem',
    backgroundColor: '#f8fafc',
    borderRadius: '8px'
  },
  patientInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem'
  },
  sectionIcon: {
    color: '#64748b'
  },
  patientName: {
    fontSize: '1rem',
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: '0.25rem'
  },
  patientId: {
    fontSize: '0.875rem',
    color: '#64748b',
    fontFamily: 'monospace'
  },
  detailsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '1rem',
    marginBottom: '1.5rem'
  },
  detailItem: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '0.75rem'
  },
  detailIcon: {
    color: '#64748b',
    marginTop: '0.125rem'
  },
  detailContent: {
    flex: 1
  },
  detailLabel: {
    fontSize: '0.75rem',
    fontWeight: '600',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: '0.025em',
    marginBottom: '0.25rem'
  },
  detailValue: {
    fontSize: '0.875rem',
    color: '#1e293b',
    fontWeight: '500',
    wordBreak: 'break-word'
  },
  addressSection: {
    padding: '1rem',
    backgroundColor: '#f1f5f9',
    borderRadius: '8px',
    border: '1px solid #e2e8f0'
  },
  addressHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '0.75rem',
    fontWeight: '600',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: '0.025em',
    marginBottom: '0.5rem'
  },
  addressText: {
    fontSize: '0.875rem',
    color: '#1e293b',
    lineHeight: '1.5'
  },
  cardActions: {
    padding: '1rem 1.5rem 1.5rem',
    borderTop: '1px solid #f1f5f9'
  },
  actionButtons: {
    display: 'flex',
    gap: '0.75rem'
  },
    viewDetailsButton: {
    flex: 1,
    padding: '0.75rem 1rem',
    backgroundColor: '#3b82f6',
    color: 'white',
    marginBottom: '10px',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    fontWeight: '600',
    fontSize: '0.875rem',
    transition: 'background-color 0.2s ease',
    '&:hover': {
      backgroundColor: '#2563eb'
    }
  },
  reorderButton: {
    flex: 1,
    padding: '0.75rem 1rem',
    backgroundColor: '#059669',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    fontWeight: '600',
    fontSize: '0.875rem',
    transition: 'background-color 0.2s ease',
    '&:hover': {
      backgroundColor: '#047857'
    }
  },
  emptyState: {
    textAlign: 'center',
    padding: '4rem 2rem',
    color: '#64748b'
  },
  emptyIcon: {
    color: '#cbd5e1',
    marginBottom: '1rem'
  },
  emptyTitle: {
    fontSize: '1.25rem',
    fontWeight: '600',
    color: '#374151',
    marginBottom: '0.5rem'
  },
  emptyMessage: {
    fontSize: '0.875rem',
    color: '#6b7280'
  },
  // Modal styles
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '1rem',
    zIndex: 1000
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: '12px',
    boxShadow: '0 20px 25px rgba(0, 0, 0, 0.25)',
    maxWidth: '500px',
    width: '100%',
    maxHeight: '90vh',
    overflowY: 'auto'
  },
  modalHeader: {
    padding: '1.5rem 1.5rem 1rem',
    borderBottom: '1px solid #e2e8f0',
    display: 'flex',
    alignItems: 'center',
    gap: '1rem'
  },
  modalIconBadge: {
    width: '2.5rem',
    height: '2.5rem',
    borderRadius: '8px',
    backgroundColor: '#d1fae5',
    color: '#059669',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  modalTitle: {
    fontSize: '1.25rem',
    fontWeight: '600',
    color: '#1e293b'
  },
  formGroup: {
    marginBottom: '1rem',
    padding: '0 1.5rem'
  },
  formLabel: {
    display: 'block',
    marginBottom: '0.5rem',
    fontSize: '0.875rem',
    fontWeight: '600',
    color: '#374151'
  },
  formInput: {
    width: '100%',
    padding: '0.75rem',
    borderRadius: '8px',
    border: '1px solid #d1d5db',
    fontSize: '0.875rem',
    transition: 'border-color 0.2s ease',
    '&:focus': {
      outline: 'none',
      borderColor: '#059669',
      boxShadow: '0 0 0 3px rgba(5, 150, 105, 0.1)'
    }
  },
  formInputReadonly: {
    width: '100%',
    padding: '0.75rem',
    borderRadius: '8px',
    border: '1px solid #d1d5db',
    fontSize: '0.875rem',
    backgroundColor: '#f9fafb',
    color: '#6b7280'
  },
  formSelect: {
    width: '100%',
    padding: '0.75rem',
    borderRadius: '8px',
    border: '1px solid #d1d5db',
    fontSize: '0.875rem',
    backgroundColor: 'white',
    transition: 'border-color 0.2s ease',
    '&:focus': {
      outline: 'none',
      borderColor: '#059669',
      boxShadow: '0 0 0 3px rgba(5, 150, 105, 0.1)'
    }
  },
  formTextarea: {
    width: '100%',
    padding: '0.75rem',
    borderRadius: '8px',
    border: '1px solid #d1d5db',
    fontSize: '0.875rem',
    resize: 'vertical',
    minHeight: '80px',
    transition: 'border-color 0.2s ease',
    '&:focus': {
      outline: 'none',
      borderColor: '#059669',
      boxShadow: '0 0 0 3px rgba(5, 150, 105, 0.1)'
    }
  },
  modalButtons: {
    padding: '1rem 1.5rem 1.5rem',
    display: 'flex',
    gap: '0.75rem',
    justifyContent: 'flex-end'
  },
  cancelButton: {
    padding: '0.75rem 1.5rem',
    backgroundColor: '#f3f4f6',
    color: '#374151',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '500',
    transition: 'background-color 0.2s ease',
    '&:hover': {
      backgroundColor: '#e5e7eb'
    }
  },
  submitButton: {
    padding: '0.75rem 1.5rem',
    backgroundColor: '#059669',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '500',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    transition: 'background-color 0.2s ease',
    '&:hover': {
      backgroundColor: '#047857'
    },
    '&:disabled': {
      backgroundColor: '#9ca3af',
      cursor: 'not-allowed'
    }
  },
  buttonSpinner: {
    width: '1rem',
    height: '1rem',
    border: '2px solid rgba(255, 255, 255, 0.3)',
    borderTop: '2px solid white',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  },
  successMessage: {
    padding: '0.75rem 1rem',
    backgroundColor: '#d1fae5',
    color: '#065f46',
    borderRadius: '8px',
    margin: '0 1.5rem',
    fontSize: '0.875rem',
    fontWeight: '500'
  },
  errorMessage: {
    padding: '0.75rem 1rem',
    backgroundColor: '#fee2e2',
    color: '#991b1b',
    borderRadius: '8px',
    margin: '0 1.5rem 1rem',
    fontSize: '0.875rem',
    fontWeight: '500'
  }
};

export default WargaEmas;