import React, { useState, useEffect } from 'react';
import { Eye, FileText, Calendar, Package, User, ChevronDown, ChevronUp, Search, Download, RefreshCw, AlertCircle } from 'lucide-react';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import dayjs from 'dayjs';

const styles = {
  layout: {
    minHeight: '100vh',
    backgroundColor: '#f8f9fa',
    padding: '1rem',
  },
  container: {
    maxWidth: '90rem',
    margin: '0 auto',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: '0.5rem',
    boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    padding: '1.5rem',
    marginBottom: '1.5rem',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '1rem',
  },
  title: {
    fontSize: '1.875rem',
    fontWeight: 'bold',
    color: '#111827',
    display: 'flex',
    alignItems: 'center',
  },
  subtitle: {
    color: '#6b7280',
    marginTop: '0.25rem',
  },
  button: {
    backgroundColor: '#2563eb',
    color: 'white',
    padding: '0.5rem 1rem',
    borderRadius: '0.5rem',
    fontWeight: '500',
    transition: 'background-color 0.2s',
    '&:hover': {
      backgroundColor: '#1d4ed8',
    },
  },
  exportButton: {
    backgroundColor: '#059669',
    color: 'white',
    padding: '0.75rem 1.5rem',
    borderRadius: '0.5rem',
    fontWeight: '500',
    transition: 'background-color 0.2s',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    '&:hover': {
      backgroundColor: '#047857',
    },
    '&:disabled': {
      opacity: '0.5',
      cursor: 'not-allowed',
    },
  },
  loadingSpinner: {
    animation: 'spin 1s linear infinite',
    borderWidth: '2px',
    borderStyle: 'solid',
    borderColor: '#ffffff transparent transparent transparent',
    borderRadius: '50%',
    width: '1rem',
    height: '1rem',
  },
  summaryGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(1, 1fr)',
    gap: '1rem',
    '@media (minWidth: 640px)': {
      gridTemplateColumns: 'repeat(4, 1fr)',
    },
  },
  summaryCard: {
    padding: '1rem',
    borderRadius: '0.5rem',
  },
  tableContainer: {
    overflowX: 'auto',
  },
  table: {
    width: '100%',
  },
  tableHeader: {
    backgroundColor: '#f9fafb',
  },
  tableHeaderCell: {
    padding: '0.75rem 1.5rem',
    textAlign: 'left',
    fontSize: '0.75rem',
    fontWeight: '500',
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  tableRow: {
    backgroundColor: 'white',
    '&:hover': {
      backgroundColor: '#f9fafb',
    },
  },
  tableCell: {
    padding: '0.75rem 1.5rem',
    fontSize: '0.875rem',
    color: '#6b7280',
    borderBottom: '1px solid #e5e7eb',
  },
  backButton: {
    display: 'flex',
    alignItems: 'center',
    color: '#2563eb',
    fontWeight: '500',
    marginBottom: '0.5rem',
    '&:hover': {
      color: '#1d4ed8',
    },
  },
  errorCard: {
    backgroundColor: '#fef2f2',
    border: '1px solid #fee2e2',
    borderRadius: '0.5rem',
    padding: '1.5rem',
  },
  loadingOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 50,
  },
  manifestGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(1, 1fr)',
    gap: '1.5rem',
    '@media (minWidth: 768px)': {
      gridTemplateColumns: 'repeat(2, 1fr)',
    },
    '@media (minWidth: 1024px)': {
      gridTemplateColumns: 'repeat(3, 1fr)',
    },
  },
  manifestItem: {
    backgroundColor: 'white',
    borderRadius: '0.5rem',
    boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    border: '1px solid #e5e7eb',
    transition: 'box-shadow 0.2s',
    '&:hover': {
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    },
  },
  searchContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    '@media (minWidth: 640px)': {
      flexDirection: 'row',
    },
  },
  searchInput: {
    flex: 1,
    position: 'relative',
  },
  searchIcon: {
    position: 'absolute',
    left: '0.75rem',
    top: '50%',
    transform: 'translateY(-50%)',
    color: '#9ca3af',
  },
  input: {
    width: '100%',
    paddingLeft: '2.5rem',
    paddingRight: '1rem',
    paddingTop: '0.5rem',
    paddingBottom: '0.5rem',
    border: '1px solid #d1d5db',
    borderRadius: '0.5rem',
    '&:focus': {
      outline: 'none',
      ring: '2px',
      ringColor: '#3b82f6',
      borderColor: '#3b82f6',
    },
  },
  sortContainer: {
    display: 'flex',
    gap: '0.5rem',
  },
  select: {
    paddingLeft: '0.75rem',
    paddingRight: '0.75rem',
    paddingTop: '0.5rem',
    paddingBottom: '0.5rem',
    border: '1px solid #d1d5db',
    borderRadius: '0.5rem',
    '&:focus': {
      outline: 'none',
      ring: '2px',
      ringColor: '#3b82f6',
      borderColor: '#3b82f6',
    },
  },
  sortButton: {
    padding: '0.5rem',
    border: '1px solid #d1d5db',
    borderRadius: '0.5rem',
    '&:hover': {
      backgroundColor: '#f3f4f6',
    },
  },
  emptyState: {
    backgroundColor: 'white',
    borderRadius: '0.5rem',
    boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    padding: '3rem',
    textAlign: 'center',
  },
  emptyIcon: {
    margin: '0 auto 1rem auto',
    color: '#9ca3af',
  },
  emptyTitle: {
    fontSize: '1.125rem',
    fontWeight: '500',
    color: '#111827',
    marginBottom: '0.5rem',
  },
  emptyText: {
    color: '#6b7280',
  },
};

const ManifestViewer = () => {
  const [manifests, setManifests] = useState([]);
    const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedManifest, setSelectedManifest] = useState(null);
  const [viewingDetails, setViewingDetails] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [exporting, setExporting] = useState(false);

  const API_BASE_URL = 'https://grpharmacyappserver.onrender.com';

  useEffect(() => {
    fetchManifests();
  }, []);

  const fetchManifests = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${API_BASE_URL}/api/gr_dms/forms`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        setManifests(data.forms || []);
      } else {
        setError(data.error || 'Failed to fetch manifests');
      }
    } catch (err) {
      setError('Error connecting to server: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchManifestDetails = async (formId) => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${API_BASE_URL}/api/gr_dms/forms/${formId}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        setSelectedManifest(data.form);
        setViewingDetails(true);
      } else {
        setError(data.error || 'Failed to fetch manifest details');
      }
    } catch (err) {
      setError('Error fetching manifest details: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  

const formatDateTimeExtraction = (dateString) => {
  if (!dateString) return 'N/A';
  
  // First try parsing as ISO string
  let date = dayjs(dateString);
  
  // If that fails, try common alternative formats
  if (!date.isValid()) {
    // Try MongoDB date format (if it's an object with $date)
    if (typeof dateString === 'object' && dateString.$date) {
      date = dayjs(dateString.$date);
    }
    // Try parsing as DD-MM-YYYY string
    else if (typeof dateString === 'string' && dateString.includes('-')) {
      date = dayjs(dateString, 'DD-MM-YYYY');
    }
  }
  
  return date.isValid() ? date.format('DD.MM.YY') : 'N/A';
};

const getPhoneNumber = (row) => {
  // Check direct properties first
  if (row.phoneNumber) return row.phoneNumber;
  if (row.receiverPhoneNumber) return row.receiverPhoneNumber;
  if (row.receiverPhone) return row.receiverPhone;
  
  // Check nested in rawData if exists
  if (row.rawData) {
    if (row.rawData.phoneNumber) return row.rawData.phoneNumber;
    if (row.rawData.receiverPhoneNumber) return row.rawData.receiverPhoneNumber;
    if (row.rawData.receiverPhone) return row.rawData.receiverPhone;
    if (row.rawData.receiver?.phoneNumber) return row.rawData.receiver.phoneNumber;
  }
  
  return 'N/A';
};

  const getDeliveryCodePrefix = (jobMethod) => {
    const methodMap = {
      'express': 'EXP',
      'standard': 'STD',
      'urgent': 'URG',
      'same_day': 'SD',
      'next_day': 'ND',
      'ttg': 'TTG',
      'kb': 'KB',
      'self_collect': 'SELF'
    };
    return methodMap[jobMethod?.toLowerCase()] || 'STD';
  };

const exportToExcel = async () => {
  if (!selectedManifest?.previewData?.rows) {
    alert('No data available to export');
    return;
  }

  try {
    setExporting(true);
    
    const workbook = XLSX.utils.book_new();
    const method = selectedManifest.mohForm || 'Standard';
    const prefix = getDeliveryCodePrefix(method);
    const rows = selectedManifest.previewData.rows;
    
    const sheetData = rows.map((row, index) => {
      // Enhanced getValue function with better fallbacks
      const getValue = (path, defaultValue = 'N/A') => {
        try {
          // First check if the value exists directly on the row
          if (row[path] !== undefined && row[path] !== null) {
            return row[path];
          }
          
          // Check if we have rawData
          if (row.rawData) {
            // Try direct path first
            if (row.rawData[path] !== undefined && row.rawData[path] !== null) {
              return row.rawData[path];
            }
            
            // Try nested paths if needed
            const parts = path.split('.');
            let value = row.rawData;
            
            for (const part of parts) {
              if (value[part] === undefined || value[part] === null) {
                return defaultValue;
              }
              value = value[part];
            }
            
            return value || defaultValue;
          }
          
          return defaultValue;
        } catch (e) {
          return defaultValue;
        }
      };

      return {
        'Date of Form': formatDateTimeExtraction(
          getValue('creationDate') || 
          getValue('creationDate') ||
          selectedManifest.formDate
        ),
        'No.': row.number || `${prefix}${String(index + 1).padStart(3, '0')}`,
        'Go Rush Status': getValue('goRushStatus', 'Standard'),
        'Tracking Number': getValue('trackingNumber') || getValue('doTrackingNumber'),
        'Patient Name': getValue('patientName') || getValue('receiverName'),
        'Address': getValue('address') || getValue('receiverAddress'),
        'Area': getValue('area') || getValue('receiverArea'),
        'BruHIMs Number': getValue('patientNumber') || getValue('bruhimsNumber') || getValue('patientNo'),
        'IC No.': getValue('icPassNum') || getValue('icNo') || getValue('icNumber') || getValue('receiverIcNumber'),
        'Appointment Place': getValue('appointmentPlace') || getValue('appointmentLocation'),
        'Phone Number': getValue('receiverPhoneNumber') || getValue('phoneNumber') || getValue('receiverPhone'),
        'Additional Phone Number': getValue('additionalPhoneNumber') || getValue('altPhoneNumber'),
        'Delivery Code': getValue('deliveryCode') || prefix,
        'Remarks': getValue('remarks') // Simply get the remarks field directly
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(sheetData);
    worksheet['!cols'] = [
      { wch: 12 }, { wch: 8 }, { wch: 12 }, { wch: 15 }, 
      { wch: 20 }, { wch: 30 }, { wch: 12 }, { wch: 15 },
      { wch: 12 }, { wch: 18 }, { wch: 15 }, { wch: 15 },
      { wch: 10 }, { wch: 20 }
    ];
    
    XLSX.utils.book_append_sheet(
      workbook, 
      worksheet, 
      method.substring(0, 31) || 'Manifest'
    );

    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { 
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
    });
    
    const fileName = `MOH_Orders_${selectedManifest.batchNo || 'Manifest'}_${dayjs().format('YYYYMMDD')}`;
    saveAs(blob, `${fileName}.xlsx`);
    
  } catch (error) {
    console.error('Export error:', error);
    alert('Failed to export to Excel. Please try again.');
  } finally {
    setExporting(false);
  }
};

  const handleViewDetails = (manifest) => {
    fetchManifestDetails(manifest._id);
  };

  const handleBackToList = () => {
    setViewingDetails(false);
    setSelectedManifest(null);
    setError(null);
  };

  const highlightSearchTerm = (text) => {
  if (!searchTerm || !text) return text;
  
  const regex = new RegExp(`(${searchTerm})`, 'gi');
  return text.toString().split(regex).map((part, i) => 
    i % 2 === 1 ? <span key={i} style={{ backgroundColor: '#ffeb3b' }}>{part}</span> : part
  );
};

const filteredAndSortedManifests = manifests
  .filter(manifest => {
    const searchLower = searchTerm.toLowerCase().trim();
    
    // Skip if empty search
    if (!searchLower) return true;
    
    // Check manifest-level fields
    if (
      (manifest.formName && manifest.formName.toLowerCase().includes(searchLower)) ||
      (manifest.batchNo && manifest.batchNo.toLowerCase().includes(searchLower)) ||
      (manifest.mohForm && manifest.mohForm.toLowerCase().includes(searchLower))
    ) {
      return true;
    }
    
    // Deep search in previewData rows
    if (manifest.previewData?.rows) {
      return manifest.previewData.rows.some(row => {
        // Check multiple possible tracking number fields
        const trackingNumbers = [
          row.trackingNumber,
          row.doTrackingNumber,
          row.rawData?.trackingNumber,
          row.rawData?.doTrackingNumber,
          row.rawData?.job?.tracking_number
        ].filter(Boolean); // Remove empty values
        
        return trackingNumbers.some(tn => 
          tn.toString().toLowerCase().includes(searchLower)
        );
      });
    }
    
    return false;
  })
  .sort((a, b) => {
    let aValue = a[sortBy];
    let bValue = b[sortBy];
    
    if (sortBy === 'createdAt' || sortBy === 'formDate') {
      aValue = new Date(aValue || 0);
      bValue = new Date(bValue || 0);
    }
    
    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  if (loading && !viewingDetails) {
    return (
      <div style={styles.layout}>
        <div style={styles.container}>
          <div style={styles.card}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ 
                ...styles.loadingSpinner,
                width: '3rem',
                height: '3rem',
                margin: '0 auto 1rem auto'
              }}></div>
              <p style={styles.subtitle}>Loading manifests...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error && !viewingDetails) {
    return (
      <div style={styles.layout}>
        <div style={styles.container}>
          <div style={styles.errorCard}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
              <AlertCircle size={20} style={{ color: '#dc2626', marginRight: '0.5rem' }} />
              <h2 style={{ color: '#dc2626', fontWeight: '600' }}>Error</h2>
            </div>
            <p style={{ color: '#dc2626', marginBottom: '1.5rem' }}>{error}</p>
            <button 
              onClick={fetchManifests}
              style={{
                ...styles.button,
                backgroundColor: '#dc2626',
                '&:hover': {
                  backgroundColor: '#b91c1c',
                }
              }}
            >
              <RefreshCw size={16} style={{ marginRight: '0.5rem' }} />
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (viewingDetails && selectedManifest) {
    return (
      <div style={styles.layout}>
        <div style={styles.container}>
          {/* Header with Export Button */}
          <div style={styles.card}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ flex: 1 }}>
                <button 
                  onClick={handleBackToList}
                  style={styles.backButton}
                >
                  ← Back to Manifests
                </button>
                <h1 style={{ ...styles.title, marginBottom: '0.25rem' }}>{selectedManifest.formName}</h1>
                <p style={styles.subtitle}>Created on {formatDate(selectedManifest.createdAt)}</p>
              </div>
              
              <button
                onClick={exportToExcel}
                disabled={exporting}
                style={{
                  ...styles.exportButton,
                  ...(exporting && { backgroundColor: '#059669' })
                }}
              >
                {exporting ? (
                  <>
                    <div style={styles.loadingSpinner}></div>
                    Exporting...
                  </>
                ) : (
                  <>
                    <Download size={16} />
                    Export to Excel
                  </>
                )}
              </button>
            </div>
          </div>

          {error && (
            <div style={styles.errorCard}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <AlertCircle size={20} style={{ color: '#dc2626', marginRight: '0.5rem' }} />
                <p style={{ color: '#dc2626' }}>{error}</p>
              </div>
            </div>
          )}

          {/* Manifest Details */}
          {selectedManifest.previewData && (
            <>
              {/* Summary Cards */}
              {selectedManifest.previewData.summary && (
                <div style={styles.card}>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem' }}>Summary</h2>
                  <div style={styles.summaryGrid}>
                    <div style={{ ...styles.summaryCard, backgroundColor: '#eff6ff' }}>
                      <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#2563eb', marginBottom: '0.25rem' }}>
                        {selectedManifest.previewData.summary.total}
                      </div>
                      <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Total Orders</div>
                    </div>
                    <div style={{ ...styles.summaryCard, backgroundColor: '#ecfdf5' }}>
                      <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#059669', marginBottom: '0.25rem' }}>
                        {selectedManifest.previewData.summary.deliveryMethod}
                      </div>
                      <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Delivery Method</div>
                    </div>
                    <div style={{ ...styles.summaryCard, backgroundColor: '#f5f3ff' }}>
                      <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#7c3aed', marginBottom: '0.25rem' }}>
                        {selectedManifest.previewData.summary.batch}
                      </div>
                      <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Batch Info</div>
                    </div>
                    <div style={{ ...styles.summaryCard, backgroundColor: '#fffbeb' }}>
                      <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#d97706', marginBottom: '0.25rem' }}>
                        {selectedManifest.previewData.summary.formDate}
                      </div>
                      <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Form Date</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Orders Table */}
              {selectedManifest.previewData.rows && (
                <div style={{ ...styles.card, padding: 0 }}>
                  <div style={{ padding: '1.5rem', borderBottom: '1px solid #e5e7eb' }}>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: '600' }}>
                      Orders ({selectedManifest.previewData.rows.length})
                    </h2>
                  </div>
                  <div style={styles.tableContainer}>
                    <table style={styles.table}>
                      <thead style={styles.tableHeader}>
                        <tr>
                          <th style={styles.tableHeaderCell}>#</th>
                          <th style={styles.tableHeaderCell}>Patient Name</th>
                          <th style={styles.tableHeaderCell}>Tracking Number</th>
                          <th style={styles.tableHeaderCell}>Address</th>
                          <th style={styles.tableHeaderCell}>Phone</th>
                          <th style={styles.tableHeaderCell}>Code</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedManifest.previewData.rows.map((row, index) => (
                          <tr key={row.key || index} style={styles.tableRow}>
                            <td style={styles.tableCell}>{row.number || index + 1}</td>
                            <td style={{ ...styles.tableCell, fontWeight: '500', color: '#111827' }}>
                              {row.patientName || row.receiverName || 'N/A'}
                            </td>
                            <td style={{ ...styles.tableCell, fontFamily: 'monospace' }}>
                              {row.trackingNumber || row.doTrackingNumber || 'N/A'}
                            </td>
                            <td style={{ ...styles.tableCell, maxWidth: '16rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {row.address || row.receiverAddress || 'N/A'}
                            </td>

<td style={styles.tableCell}>
  {getPhoneNumber(row)}
</td>
                            <td style={styles.tableCell}>
                              <span style={{ 
                                display: 'inline-flex',
                                alignItems: 'center',
                                paddingLeft: '0.625rem',
                                paddingRight: '0.625rem',
                                paddingTop: '0.25rem',
                                paddingBottom: '0.25rem',
                                borderRadius: '9999px',
                                fontSize: '0.75rem',
                                fontWeight: '500',
                                backgroundColor: '#dbeafe',
                                color: '#1e40af'
                              }}>
                                {row.deliveryCode || getDeliveryCodePrefix(selectedManifest.mohForm)}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}

          {loading && (
            <div style={styles.loadingOverlay}>
              <div style={styles.card}>
                <div style={{ 
                  ...styles.loadingSpinner,
                  width: '2rem',
                  height: '2rem',
                  margin: '0 auto 1rem auto'
                }}></div>
                <p style={styles.subtitle}>Loading details...</p>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div style={styles.layout}>
      <div style={styles.container}>
        {/* Header */}
        <div style={styles.card}>
          <div style={styles.header}>
            <div>
              <h1 style={styles.title}>
                <FileText size={32} style={{ color: '#2563eb', marginRight: '0.75rem' }} />
                Saved Manifests
              </h1>
              <p style={styles.subtitle}>View and manage your saved delivery manifests</p>
            </div>
            <button 
              onClick={fetchManifests}
              style={styles.button}
            >
              <RefreshCw size={16} style={{ marginRight: '0.5rem' }} />
              Refresh
            </button>
          </div>

          {/* Search and Filters */}
          <div style={styles.searchContainer}>
            <div style={styles.searchInput}>
              <Search style={styles.searchIcon} size={20} />
<input
  type="text"
  placeholder="Search by form name, batch number, method, or tracking number..."
  value={searchTerm}
  onChange={(e) => setSearchTerm(e.target.value)}
  style={styles.input}
/>
            </div>
            <div style={styles.sortContainer}>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                style={styles.select}
              >
                <option value="createdAt">Sort by Date</option>
                <option value="formName">Sort by Name</option>
                <option value="batchNo">Sort by Batch</option>
                <option value="formDate">Sort by Form Date</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '1rem' }}>
          Showing {filteredAndSortedManifests.length} of {manifests.length} manifests
        </div>

        {/* Error Display */}
        {error && (
          <div style={styles.errorCard}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <AlertCircle size={20} style={{ color: '#dc2626', marginRight: '0.5rem' }} />
              <p style={{ color: '#dc2626' }}>{error}</p>
            </div>
          </div>
        )}

        {/* Manifests Grid */}
        {filteredAndSortedManifests.length === 0 ? (
          <div style={styles.emptyState}>
            <FileText size={48} style={styles.emptyIcon} />
            <h3 style={styles.emptyTitle}>No manifests found</h3>
            <p style={styles.emptyText}>
              {searchTerm ? 'Try adjusting your search terms.' : 'No manifests have been saved yet.'}
            </p>
          </div>
        ) : (
          <div style={styles.manifestGrid}>
            {filteredAndSortedManifests.map((manifest) => (
              <div key={manifest._id} style={styles.manifestItem}>
                <div style={{ padding: '1.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1rem' }}>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#111827', flex: 1 }}>
                      {manifest.formName || 'Untitled Manifest'}
                    </h3>
                    <span style={{ 
                      display: 'inline-flex',
                      alignItems: 'center',
                      paddingLeft: '0.625rem',
                      paddingRight: '0.625rem',
                      paddingTop: '0.25rem',
                      paddingBottom: '0.25rem',
                      borderRadius: '9999px',
                      fontSize: '0.75rem',
                      fontWeight: '500',
                      backgroundColor: '#d1fae5',
                      color: '#065f46'
                    }}>
                      Saved
                    </span>
                  </div>
                  
                  <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '1rem' }}>
                    Created {formatDate(manifest.createdAt)}
                  </p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', fontSize: '0.875rem', color: '#6b7280' }}>
                      <Package size={16} style={{ color: '#9ca3af', marginRight: '0.5rem' }} />
                      <span style={{ fontWeight: '500' }}>Batch:</span> {manifest.batchNo || 'N/A'}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', fontSize: '0.875rem', color: '#6b7280' }}>
                      <Calendar size={16} style={{ color: '#9ca3af', marginRight: '0.5rem' }} />
                      <span style={{ fontWeight: '500' }}>Form Date:</span> {manifest.formDate}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', fontSize: '0.875rem', color: '#6b7280' }}>
                      <FileText size={16} style={{ color: '#9ca3af', marginRight: '0.5rem' }} />
                      <span style={{ fontWeight: '500' }}>Method:</span> {manifest.mohForm || 'Standard'}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', fontSize: '0.875rem', color: '#6b7280' }}>
                      <User size={16} style={{ color: '#9ca3af', marginRight: '0.5rem' }} />
                      <span style={{ fontWeight: '500' }}>Orders:</span> {manifest.numberOfForms || 0}
                    </div>
                  </div>

{manifest.previewData?.rows
  .filter(row => {
    const trackingNumbers = [
      row.trackingNumber,
      row.doTrackingNumber,
      row.rawData?.trackingNumber,
      row.rawData?.doTrackingNumber
    ].filter(Boolean);
    
    return trackingNumbers.some(tn => 
      tn.toString().toLowerCase().includes(searchTerm.toLowerCase())
    );
  })
  .slice(0, 3)
  .map((row, idx) => {
    // Find which tracking number matched
    const matchedTrackingNumber = [
      row.trackingNumber,
      row.doTrackingNumber,
      row.rawData?.trackingNumber,
      row.rawData?.doTrackingNumber
    ].find(tn => tn && tn.toString().toLowerCase().includes(searchTerm.toLowerCase()));
    
    return (
      <div key={idx} style={{ 
        fontSize: '0.875rem', 
        color: '#6b7280',
        backgroundColor: '#f3f4f6',
        padding: '0.5rem',
        borderRadius: '0.25rem'
      }}>
        <div style={{ fontWeight: '500' }}>
          Tracking #{idx + 1}: {highlightSearchTerm(matchedTrackingNumber)}
        </div>
        <div style={{ fontSize: '0.75rem', marginTop: '0.25rem' }}>
          Patient: {row.patientName || row.receiverName || 'N/A'}
        </div>
      </div>
    );
  })}

                  <button 
                    onClick={() => handleViewDetails(manifest)}
                    style={{
                      width: '100%',
                      backgroundColor: '#2563eb',
                      color: 'white',
                      padding: '0.5rem 1rem',
                      borderRadius: '0.5rem',
                      fontWeight: '500',
                      transition: 'background-color 0.2s',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      '&:hover': {
                        backgroundColor: '#1d4ed8',
                      }
                    }}
                  >
                    <Eye size={16} style={{ marginRight: '0.5rem' }} />
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ManifestViewer;