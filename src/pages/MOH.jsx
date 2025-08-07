import React, { useState, useEffect } from 'react';
import { 
  Table, 
  Tabs, 
  Card, 
  Statistic, 
  Spin, 
  Alert, 
  Tag,
  DatePicker, 
  Row, 
  Col, 
  Space,
  Typography,
  Modal,
  Input,
  Button,
  message,
  Tooltip
} from 'antd';
import { 
  ClockCircleOutlined,
  CopyOutlined,
  RocketOutlined,
  CloseCircleOutlined,
  ThunderboltOutlined,
  CarOutlined,
  MedicineBoxOutlined,
  QuestionOutlined,
  CalendarOutlined,
  EditOutlined,
  CheckCircleOutlined,
  EyeOutlined,
  DownloadOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import axios from 'axios';
import { SearchOutlined, FileExclamationOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { TabPane } = Tabs;
const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const { TextArea } = Input;

const styles = {
  layout: {
    minHeight: '100vh',
    backgroundColor: '#f8f9fa',
    padding: '24px',
  },
  container: {
    maxWidth: '1800px',
    margin: '0 auto',
  },
  header: {
    marginBottom: '32px',
  },
  headerTitle: {
    color: '#2c3e50',
    marginBottom: '8px',
  },
  headerSubtitle: {
    fontSize: '16px',
  },
  filterCard: {
    marginBottom: '24px',
    boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
  },
  statCard: {
    textAlign: 'center',
    boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
    transition: 'box-shadow 0.3s',
    '&:hover': {
      boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
    },
  },
  mainCard: {
    boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
  },
  table: {
    borderRadius: '8px',
  },
  trackingId: {
    fontWeight: '600',
    color: '#1890ff',
  },
  clearButton: {
    padding: '0 12px',
    fontSize: '14px',
    color: '#666',
    borderColor: '#d9d9d9',
    '&:hover': {
      color: '#ff4d4f',
      backgroundColor: '#fff2f0',
      borderColor: '#ffccc7',
    },
  },
  modalHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  modalIcon: {
    color: '#52c41a',
  },
  trackingInput: {
    fontFamily: 'monospace',
    fontSize: '14px',
  },
  actionButton: {
    fontWeight: '500',
    color: '#1890ff',
    '&:hover': {
      color: '#40a9ff',
      textDecoration: 'underline',
    },
  },
  tabBadge: {
    marginLeft: '4px',
  },
  savedColumn: {
  textAlign: 'center',
  padding: '8px 0',
},
  disabledButton: {
    opacity: 0.5,
    cursor: 'not-allowed',
    '&:hover': {
      opacity: 0.5
    }}
};

const PreviewModal = ({ 
  visible, 
  data, 
  onCancel, 
  onSave, 
  onDownloadExcel, 
    setSelectedDate,
    onPreviewPackingList,
  loading,
  startNumber,
    setDateRange,
  setStartNumber
}) => {
  const [batchValue, setBatchValue] = useState(1);
  const [collectionDate, setCollectionDate] = useState(null);
  const [isSettingCollectionDate, setIsSettingCollectionDate] = useState(false);

  // Use the data directly if it's from a saved form
  const safeData = data || {
    rows: [],
    summary: {},
    meta: {}
  };

  useEffect(() => {
    if (data?.meta?.batchNo) {
      setBatchValue(parseInt(data.meta.batchNo) || 1);
      if (data.meta.startNo) {
        const num = parseInt(data.meta.startNo.replace(/^\D+/g, '')) || 1;
        setStartNumber(num);
      }
    }
  }, [data]);

const handleSaveWithCollectionDate = async () => {
  if (!collectionDate && !data?.savedToDMS) {
    message.error('Please select a collection date');
    return;
  }

  setIsSettingCollectionDate(true);
  try {
    if (collectionDate && !data?.savedToDMS) {
      const orderIds = safeData.rows.map(row => row.rawData._id).filter(Boolean);
      const dateStr = collectionDate.format('DD-MM-YYYY');
      
      const config = {
        headers: {
          'X-User-Role': 'gorush' // Or whatever role should have permission
        }
      };

      const updatePromises = orderIds.map(orderId => 
        axios.put(`https://grpharmacyappserver.onrender.com/api/orders/${orderId}/collection-date`, {
          collectionDate: dateStr
        }, config).catch(e => {
          console.error(`Failed to update order ${orderId}:`, e.response?.data);
          return null;
        })
      );

      const results = await Promise.all(updatePromises);
      const successfulUpdates = results.filter(res => res?.status === 200).length;
      
      if (successfulUpdates < orderIds.length) {
        message.warning(`Updated ${successfulUpdates} of ${orderIds.length} orders (some failed)`);
      } else {
        message.success(`Updated collection date for ${successfulUpdates} orders`);
      }
    }
    
    await onSave(batchValue);
  } catch (error) {
    console.error('Error setting collection date:', error);
    if (error.response?.status === 403) {
      message.error('You do not have permission to update collection dates');
    } else {
      message.error(`Error: ${error.response?.data?.error || error.message}`);
    }
  } finally {
    setIsSettingCollectionDate(false);
  }
};

useEffect(() => {
  const urlParams = new URLSearchParams(window.location.search);
  
  // Date parameter
  const dateParam = urlParams.get('date');
  if (dateParam) {
    const parsedDate = dayjs(dateParam, 'DD-MM-YYYY');
    if (parsedDate.isValid()) {
      setSelectedDate(parsedDate);
      setDateRange(null);
    }
  }
  
  // Date range parameter
  const dateRangeParam = urlParams.get('dateRange');
  if (dateRangeParam) {
    const [start, end] = dateRangeParam.split('_');
    const startDate = dayjs(start, 'DD-MM-YYYY');
    const endDate = dayjs(end, 'DD-MM-YYYY');
    if (startDate.isValid() && endDate.isValid()) {
      setDateRange([startDate, endDate]);
      setSelectedDate(null);
    }
  }
  
  // Tab parameter
  const tabParam = urlParams.get('tab');
  if (tabParam && [
    'Standard', 'Express', 'Immediate', 'Self Collect', 
    'TTG', 'KB', 'Others', 'noCollectionDate', 'noFormCreated'
  ].includes(tabParam)) {
    setActiveTab(tabParam);
  }
  
  // Search parameter
  const searchParam = urlParams.get('search');
  if (searchParam) {
    setSearchTerm(searchParam);
  }
}, []);

  const columns = [
  {
    title: 'No.',
    dataIndex: 'number',
    key: 'number',
    width: 60,
    render: (text) => text // Just display the pre-formatted number
  },
    {
      title: 'Patient',
      dataIndex: 'patientName',
      key: 'patientName',
      render: (text) => text || 'N/A'
    },
    {
      title: 'Tracking No.',
      dataIndex: 'trackingNumber',
      key: 'trackingNumber',
      render: (text) => text || 'N/A'
    },
    {
      title: 'Address',
      dataIndex: 'address',
      key: 'address',
      ellipsis: true,
      render: (text) => text || 'N/A'
    },
    {
      title: 'Delivery Code',
      dataIndex: 'deliveryCode',
      key: 'deliveryCode',
      width: 100,
      render: (text) => text || 'N/A'
    },
  ];

  const getNumberPrefix = (jobMethod) => {
  switch(jobMethod) {
    case 'TTG': return 'T';
    case 'KB': return 'K';
    case 'Standard': return 'S';
    case 'Express': return 'E';
    case 'Immediate': return 'IMM';
    case 'Self Collect': return 'SC';
    default: return 'O'; // Others
  }
};

  return (
    <Modal
      title={data?.savedToDMS ? `Saved Manifest: ${data?.summary?.batch || ''}` : "Preview Orders"}
      visible={visible}
      width="90%"
      style={{ top: 20 }}
      onCancel={onCancel}
      footer={[
        <Button key="back" onClick={onCancel}>
          Cancel
        </Button>,
        !data?.savedToDMS && (
          <Button 
            key="save" 
            type="primary" 
            loading={loading || isSettingCollectionDate}
            onClick={handleSaveWithCollectionDate}
            icon={<CheckCircleOutlined />}
            disabled={!safeData.rows || safeData.rows.length === 0}
          >
            {collectionDate ? 'Generate Manifest' : 'Set Collection Date & Generate'}
          </Button>
        ),
        <Tooltip 
          title={!data?.savedToDMS ? "Please save the manifest first" : ""}
          placement="top"
        >
          <div>
            <Button 
              key="preview-packing" 
              type="default" 
              onClick={onPreviewPackingList}
              disabled={!data?.savedToDMS || !safeData?.rows || safeData.rows.length === 0}
              icon={<EyeOutlined />}
              style={{ 
                marginLeft: 8,
                ...(!data?.savedToDMS ? styles.disabledButton : {}) 
              }}
            >
              Preview Packing List
            </Button>
          </div>
        </Tooltip>,
        <Tooltip 
          title={!data?.savedToDMS ? "Please save the manifest first" : ""}
          placement="top"
        >
          <div>
            <Button 
              key="download" 
              type="primary" 
              onClick={onDownloadExcel}
              disabled={!data?.savedToDMS || !safeData?.rows || safeData.rows.length === 0}
              icon={<DownloadOutlined />}
              style={!data?.savedToDMS ? styles.disabledButton : {}}
            >
              Download Excel
            </Button>
          </div>
        </Tooltip>
      ]}
    >
      {!data?.savedToDMS && (
        <div style={{ marginBottom: 16 }}>
          <Text strong>Collection Date:</Text>
          <DatePicker
            value={collectionDate}
            onChange={setCollectionDate}
            style={{ width: 200, marginLeft: 8 }}
            format="DD-MM-YYYY"
            placeholder="Select collection date"
          />
          {collectionDate && (
            <Tag color="blue" style={{ marginLeft: 8 }}>
              {collectionDate.format('DD-MMM-YYYY')}
            </Tag>
          )}
        </div>
      )}

      {safeData.rows && safeData.rows.length > 0 ? (
        <>
          <Table
            columns={columns}
            dataSource={safeData.rows}
            size="small"
            scroll={{ x: true }}
            pagination={false}
            rowKey="key"
          />
          {safeData.summary && (
            <div style={{ marginTop: 16 }}>
              <Text strong>Summary:</Text>
              <ul>
                <li>Total Orders: {safeData.summary.total}</li>
                <li>Delivery Method: {safeData.summary.deliveryMethod}</li>
                {!data?.savedToDMS && (
                  <>
                    <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      Batch:
                      <select
                        value={batchValue}
                        onChange={(e) => setBatchValue(Number(e.target.value))}
                        style={{ 
                          marginLeft: 8, 
                          padding: '4px 8px',
                          border: '1px solid #d9d9d9',
                          borderRadius: '4px',
                          fontSize: '14px'
                        }}
                      >
                        <option value={1}>1</option>
                        <option value={2}>2</option>
                        <option value={3}>3</option>
                      </select>
                      <span style={{ marginLeft: '8px', color: '#666' }}>
                        (B{batchValue} {getNumberPrefix(safeData.meta?.jobMethod)}{startNumber}-{getNumberPrefix(safeData.meta?.jobMethod)}{startNumber + safeData.rows.length - 1})
                      </span>
                    </li>
                    <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      Start Number:
                      <Input
                        type="number"
                        min={1}
                        value={startNumber}
                        onChange={(e) => {
                          const newStartNumber = Number(e.target.value);
                          setStartNumber(newStartNumber);
                        }}
                        style={{ 
                          width: '80px',
                          padding: '4px 8px',
                          border: '1px solid #d9d9d9',
                          borderRadius: '4px',
                          fontSize: '14px'
                        }}
                      />
                      <span style={{ marginLeft: '8px', color: '#666' }}>
                        Will generate: {getNumberPrefix(safeData.meta?.jobMethod)}
                        {startNumber} to {getNumberPrefix(safeData.meta?.jobMethod)}
                        {startNumber + safeData.rows.length - 1}
                      </span>
                    </li>
                  </>
                )}
                {data?.savedToDMS && (
                  <li>Batch: {safeData.summary.batch}</li>
                )}
              </ul>
            </div>
          )}
        </>
      ) : (
        <Alert
          message="No orders found"
          description="This manifest doesn't contain any order data."
          type="warning"
          showIcon
        />
      )}
    </Modal>
  );
};


const MohOrdersDashboard = () => {
  const [orders, setOrders] = useState([]);
  const [urlInitialized, setUrlInitialized] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
    const [startNumber, setStartNumber] = useState(1);
  const [previewData, setPreviewData] = useState(null);
  const [pageSize, setPageSize] = useState(15);
  const [isPreviewVisible, setIsPreviewVisible] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [savedForms, setSavedForms] = useState([]);
const [formsLoading, setFormsLoading] = useState(false);
  const [savedOrders, setSavedOrders] = useState([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

const [jobMethodStats, setJobMethodStats] = useState({
  all: 0,
  Standard: 0,
  Express: 0,
  Immediate: 0,
  TTG: 0,
  KB: 0,
  Others: 0,
  Cancelled: 0,
  noCollectionDate: 0,
  noFormCreated: 0,
  StandardNoForm: 0,
  ExpressNoForm: 0,
  TTGNoForm: 0,
  KBNoForm: 0
});

  const [activeTab, setActiveTab] = useState('all');
  const [selectedDate, setSelectedDate] = useState(null);
  const [dateRange, setDateRange] = useState(null);
  const [isCollectionModalVisible, setIsCollectionModalVisible] = useState(false);
  const [collectionDate, setCollectionDate] = useState(null);
  const [trackingNumbers, setTrackingNumbers] = useState('');
  const [bulkUpdateLoading, setBulkUpdateLoading] = useState(false);
  

const fetchSavedForms = async () => {
  try {
    setFormsLoading(true);
    const response = await axios.get('https://grpharmacyappserver.onrender.com/api/gr_dms/forms');
    if (response.data.success && response.data.forms) {
      // Process the forms data to ensure it has all required fields
      const processedForms = response.data.forms.map(form => ({
        ...form,
        key: form._id, // Add key for table
        creationDate: form.creationDate || form.createdAt, // Handle different date fields
        numberOfForms: form.numberOfForms || (form.orderIds ? form.orderIds.length : 0),
        startNo: form.startNo || 'S1',
        endNo: form.endNo || `S${form.numberOfForms || (form.orderIds ? form.orderIds.length : 0)}`
      }));
      setSavedForms(processedForms);
    } else {
      setSavedForms([]);
    }
  } catch (error) {
    console.error('Error fetching saved forms:', error);
    message.error('Failed to load saved forms');
    setSavedForms([]);
  } finally {
    setFormsLoading(false);
  }
};

useEffect(() => {
  const fetchMohOrders = async () => {
    try {
      setLoading(true);
      const response = await fetch('https://grpharmacyappserver.onrender.com/api/orders?role=moh', {
        headers: {
          'X-User-Role': 'gorush'
        }
      });
      const data = await response.json();

      if (!response.ok) throw new Error(data.error || 'Failed to fetch orders');

      const filteredData = data.filter(order => order.product === 'pharmacymoh');

      setOrders(filteredData);
      setFilteredOrders(filteredData);

      // Set initially saved orders
      const savedIds = filteredData
        .filter(order => order.isSaved)
        .map(order => order._id);
      setSavedOrders(savedIds);

      calculateJobMethodStats(filteredData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchSavedOrderIds = async () => {
    try {
      const response = await axios.get('https://grpharmacyappserver.onrender.com/api/gr_dms/saved-orders');
      if (response.data.success) {
        setSavedOrders(response.data.orderIds);
      }
    } catch (error) {
      console.error('Error fetching saved orders:', error);
    }
  };

  // Call both functions on component mount
  fetchMohOrders();
  fetchSavedOrderIds();
fetchSavedForms();
}, []); // <-- only run once on mount


const updateURL = () => {
  const params = new URLSearchParams();
  
  if (selectedDate) {
    params.set('date', selectedDate.format('DD-MM-YYYY'));
  } else if (dateRange && dateRange[0] && dateRange[1]) {
    params.set('dateRange', `${dateRange[0].format('DD-MM-YYYY')}_${dateRange[1].format('DD-MM-YYYY')}`);
  }
  
  if (activeTab !== 'all') {
    params.set('tab', activeTab);
  }
  
  if (searchTerm) {
    params.set('search', searchTerm);
  }
  
  const newUrl = `${window.location.pathname}?${params.toString()}`;
  window.history.pushState({ path: newUrl }, '', newUrl);
};

useEffect(() => {
  updateURL();
}, [selectedDate, dateRange, activeTab, searchTerm]);

// Also call on initial load to set any initial params from URL
useEffect(() => {
  updateURL();
}, []);

useEffect(() => {
  filterOrdersByDate();
}, [selectedDate, dateRange, orders]); 

useEffect(() => {
  calculateJobMethodStats(filteredOrders);
}, [filteredOrders, savedOrders]);

  useEffect(() => {
  if (isPreviewVisible && previewData && selectedRows.length > 0 && !previewData.savedToDMS) {
    const updatedPreviewData = preparePreviewData(selectedRows, startNumber);
    setPreviewData(updatedPreviewData);
  }
}, [startNumber, isPreviewVisible, previewData?.savedToDMS]);


const preparePreviewData = (selectedRows, currentStartNumber) => {
  // Determine the actual job method
  const firstRow = selectedRows[0];
  let jobMethod;
  
  if (firstRow?.appointmentDistrict === "Tutong" && firstRow?.sendOrderTo === "PMMH") {
    jobMethod = 'TTG';
  } else if (firstRow?.appointmentDistrict === "Belait" && firstRow?.sendOrderTo === "SSBH") {
    jobMethod = 'KB';
  } else {
    jobMethod = firstRow?.jobMethod || 'OTH';
  }
  
  const batchNo = '1';
  
  // Determine numbering prefix based on job method
  let prefix = '';
  switch(jobMethod) {
    case 'TTG': prefix = 'T'; break;
    case 'KB': prefix = 'K'; break;
    case 'Standard': prefix = 'S'; break;
    case 'Express': prefix = 'E'; break;
    case 'Immediate': prefix = 'IMM'; break;
    case 'Self Collect': prefix = 'SC'; break;
    default: prefix = 'O'; // Others
  }

  // Generate start and end numbers
  const startNo = `${prefix}${currentStartNumber}`;
  const endNo = `${prefix}${currentStartNumber + selectedRows.length - 1}`;
  const formDate = dayjs().format('DD.MM.YY');

  return {
    rows: selectedRows.map((row, index) => ({
      key: row._id,
      number: `${prefix}${currentStartNumber + index}`,
      patientName: row.receiverName || 'N/A',
      trackingNumber: row.doTrackingNumber || 'N/A',
      address: row.receiverAddress || 'N/A',
      deliveryCode: getDeliveryCodePrefix(jobMethod),
      rawData: row
    })),
    summary: {
      total: selectedRows.length,
      deliveryMethod: jobMethod,
      batch: `B${batchNo} ${startNo}-${endNo}`,
      formDate
    },
    meta: {
      jobMethod,
      batchNo,
      startNo,
      endNo,
      formDate
    }
  };
};


const handlePreview = () => {
  if (selectedRows.length === 0) {
    message.warning('Please select at least one order to export');
    return;
  }
  
  const previewData = preparePreviewData(selectedRows, startNumber);
  setPreviewData(previewData);
  setIsPreviewVisible(true);
};

const generateHTMLPreview = (previewData) => {
  const rows = previewData.rows.map(row => `
    <tr>
      <td>${row.number}</td>
      <td>${row.patientName}</td>
      <td>${row.trackingNumber}</td>
      <td>${row.address}</td>
      <td>${row.deliveryCode}</td>
    </tr>
  `).join('');
  
  return `
    <html>
      <head>
        <title>${previewData.summary.deliveryMethod} - ${previewData.summary.batch}</title>
        <style>
          table { border-collapse: collapse; width: 100%; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; }
          .summary { margin-bottom: 20px; }
        </style>
      </head>
      <body>
        <div class="summary">
          <h2>Form Summary</h2>
          <p><strong>Total Orders:</strong> ${previewData.summary.total}</p>
          <p><strong>Delivery Method:</strong> ${previewData.summary.deliveryMethod}</p>
          <p><strong>Batch:</strong> ${previewData.summary.batch}</p>
          <p><strong>Form Date:</strong> ${previewData.summary.formDate}</p>
        </div>
        <table>
          <thead>
            <tr>
              <th>No.</th>
              <th>Patient Name</th>
              <th>Tracking Number</th>
              <th>Address</th>
              <th>Delivery Code</th>
            </tr>
          </thead>
          <tbody>
            ${rows}
          </tbody>
        </table>
      </body>
    </html>
  `;
};

const generatePackingListExcel = (previewData) => {
  if (!previewData?.rows) return;

  const wsData = [];

  // Row 1: Title - GO RUSH ORDER / PACKING LIST (will be merged C1:H3)
  wsData.push(['', '', 'GO RUSH ORDER / PACKING LIST']); // Row 1
  wsData.push([]); // Row 2
  // Get today's date in DD.MM.YY format
  const today = new Date();
  const formattedDate = today.getDate().toString().padStart(2, '0') + '.' + 
                       (today.getMonth() + 1).toString().padStart(2, '0') + '.' + 
                       today.getFullYear().toString().slice(-2);
  
  wsData.push(['DATE:', formattedDate, '', '', '', '', '', '', '', '', 'PREPARED BY:','Nadirah']);

  // Row 4: Table headers
  wsData.push([
    'TRACKING NO. #', 'NAME', 'DRY MEDICINE', 'FRIDGE STICKER', 'FRIDGE ITEM',
    'REMARKS (CUSTOMER)', 'AREA', 'BRUHIMS#', 'TRACKING #', 'PHONE #',
    'DELIVERY TYPE', 'REMARKS (INTERNAL)'
  ]);

  // Row 5+: Data rows
  previewData.rows.forEach(row => {
    wsData.push([
      row.number || 'N/A',
      row.rawData.receiverName || 'N/A',
      '',
      '',
      '',
      row.rawData.remarks || '',
      row.rawData.area || 'N/A',
      row.rawData.patientNumber || 'N/A',
      row.number || 'N/A',
      row.rawData.receiverPhoneNumber || 'N/A',
      row.rawData.jobMethod || 'N/A',
      row.rawData.internalRemarks || ''
    ]);
  });

  // Footer rows - moved to column A
  wsData.push([]);
  wsData.push(['COLLECTION DATE:', previewData.summary.collectionDate || '']);
  wsData.push(['RECEIVED BY (DRIVER):']);
  wsData.push(['PHARMACY:', previewData.summary.pharmacy || '']);

  // Generate worksheet
  const ws = XLSX.utils.aoa_to_sheet(wsData);

  // === Merges ===
  ws['!merges'] = [
    // Title: GO RUSH ORDER / PACKING LIST (C1 to H3)
    { s: { r: 0, c: 2 }, e: { r: 2, c: 7 } },
    
    // DATE (A3:B3)
    { s: { r: 2, c: 0 }, e: { r: 2, c: 1 } },
    
    // PREPARED BY (K3:L3)
    { s: { r: 2, c: 10 }, e: { r: 2, c: 11 } },
  ];

  // === Styling ===
  // Make title bold and center using inline styling
  if (!ws['C1']) ws['C1'] = {};
  ws['C1'].v = 'GO RUSH ORDER / PACKING LIST';
  ws['C1'].t = 's';
  ws['C1'].s = { 
    font: { bold: true, size: 14 }, 
    alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
    fill: { fgColor: { rgb: "FFFFFF" } }
  };

  // Column width (optional)
  ws['!cols'] = new Array(12).fill({ wch: 20 });

  // Finalize export
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Packing List");
  const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officeedocument.spreadsheetml.sheet' });
  const fileName = `Packing_List_${previewData.summary.batch || dayjs().format('YYYYMMDD')}`;
  saveAs(blob, `${fileName}.xlsx`);
};


const handlePreviewPackingList = () => {
  if (!previewData?.rows) return;
  
  // Generate the HTML content for the packing list
  const htmlContent = generatePackingListHTML(previewData);
  
  // Open a new tab with the HTML content
  const newWindow = window.open('', '_blank');
  
  // Add message listener before writing content
  const messageHandler = (event) => {
    if (event.data?.type === 'exportExcel') {
      // Use the data from the message or fallback to current previewData
      const data = event.data.data ? JSON.parse(decodeURIComponent(event.data.data)) : previewData;
      generatePackingListExcel(data);
    }
  };
  
  window.addEventListener('message', messageHandler);
  
  // Cleanup listener when window closes
  newWindow.onbeforeunload = () => {
    window.removeEventListener('message', messageHandler);
  };
  
  newWindow.document.write(htmlContent);
  newWindow.document.close();
};

const generatePackingListHTML = (previewData) => {
  // Calculate totals for each column that needs it
  const totals = {
    dryMedicine: previewData.rows.length,
    fridgeSticker: previewData.rows.length,
    fridgeItem: previewData.rows.length
  };

  const rows = previewData.rows.map(row => {
    // Determine pharmacy based on tracking number
    const pharmacy = row.number?.startsWith('T') ? 'PMMH' : 
                    row.number?.startsWith('K') ? 'SSBH' : 
                    'MOH Pharmacy';
    
    return `
    <tr>
      <td style="font-weight: bold;">${row.number || 'N/A'}</td>
      <td>${row.rawData.receiverName || 'N/A'}</td>
      <td style="text-align: center;"></td>
      <td style="text-align: center;"></td>
      <td style="text-align: center;"></td>
      <td>${row.rawData.remarks || ''}</td>
      <td>${row.rawData.area || 'N/A'}</td>
      <td>${row.rawData.patientNumber || 'N/A'}</td>
      <td>${row.rawData.doTrackingNumber || 'N/A'}</td>
      <td>${row.rawData.receiverPhoneNumber || 'N/A'}</td>
      <td>${row.rawData.jobMethod || 'N/A'}</td>
      <td>${row.rawData.internalRemarks || ''}</td>
    </tr>
    `;
  }).join('');

  // Determine default pharmacy based on first row's tracking number
  const defaultPharmacy = previewData.rows[0]?.number?.startsWith('T') ? 'PMMH' : 
                         previewData.rows[0]?.number?.startsWith('K') ? 'SSBH' : 
                         'MOH Pharmacy';

  // Properly escape the JSON data for use in JavaScript
  const jsonData = encodeURIComponent(JSON.stringify(previewData));

return `<!DOCTYPE html>
<html>
<head>
  <title>Packing List - ${previewData.summary.batch || 'MOH Orders'}</title>
  <style>
    @page {
      size: A4 landscape;
      margin: 10mm;
    }
    
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      margin: 0;
      padding: 20px;
      color: #333;
      font-size: 12px;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 15px;
      padding-bottom: 10px;
      border-bottom: 2px solid #1890ff;
    }
    
    .title {
      text-align: center;
      margin: 0;
      color: #1890ff;
      font-size: 18px;
      font-weight: bold;
    }
    
    .logo {
      height: 60px;
      width: auto;
    }
    
    .summary {
      display: flex;
      justify-content: space-between;
      margin-bottom: 15px;
      padding: 10px;
      background-color: #f8f8f8;
      border-radius: 4px;
    }
    
    .summary-item {
      display: flex;
      gap: 5px;
    }
    
    .summary-label {
      font-weight: bold;
    }
    
    
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 20px;
      page-break-inside: avoid;
    }
    
    th {
      background-color: #1890ff !important;
      color: white !important;
      padding: 8px;
      text-align: left;
      font-weight: bold;
      border: 1px solid #ddd;
    }

        @media print {
      body {
        padding: 0;
        margin: 0;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
      
      .header, .summary, .footer {
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
      
      th {
        background-color: #1890ff !important;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
        color: white !important;
      }
      
      .button-container {
        display: none !important;
      }
    }
    
    td {
      padding: 6px;
      border: 1px solid #ddd;
      vertical-align: top;
    }
    
    /* Enhanced styling for Internal Notes column */
    .internal-notes {
      min-width: 200px;
      max-width: 300px;
      word-wrap: break-word;
      white-space: pre-wrap;
    }
    
    .footer {
      margin-top: 20px;
      padding-top: 10px;
      border-top: 2px solid #1890ff;
      display: flex;
      justify-content: space-between;
    }
    
    .footer-item {
      display: flex;
      flex-direction: column;
      gap: 5px;
    }
    
    .footer-label {
      font-weight: bold;
    }
    
    .signature-line {
      width: 200px;
      border-top: 1px solid #333;
      margin-top: 30px;
    }
    
    .totals {
      font-weight: bold;
      background-color: #f0f0f0;
    }
    
    .button-container {
      display: none;
    }
    
    @media screen {
      .button-container {
        display: flex;
        justify-content: center;
        gap: 10px;
        margin: 20px 0;
      }
      
      button {
        padding: 8px 16px;
        background-color: #1890ff;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 14px;
      }
      
      button:hover {
        opacity: 0.9;
      }
      
      button.print {
        background-color: #1890ff;
      }
      
      button.export {
        background-color: #52c41a;
      }
      
      button.close {
        background-color: #f5222d;
      }
    }
  </style>
</head>
<body>
  <div class="header">
    <div style="width: 80px;"></div> <!-- Spacer for logo alignment -->
    <h1 class="title">GO RUSH PHARMACY PACKING LIST</h1>
    <img src="/gorushlogo.png" alt="Go Rush Logo" class="logo">
  </div>
  
  <div class="summary">
    <div class="summary-item">
      <span class="summary-label">Date:</span>
      <span>${dayjs().format('DD/MM/YYYY')}</span>
    </div>
    <div class="summary-item">
      <span class="summary-label">Prepared By:</span>
      <span>${previewData.summary.preparedBy || 'Nadirah'}</span>
    </div>
    <div class="summary-item">
      <span class="summary-label">Total Items:</span>
      <span>${previewData.rows.length}</span>
    </div>
  </div>
  
  <table>
    <thead>
      <tr>
        <th width="60px">No.</th>
        <th width="120px">Patient Name</th>
        <th width="45px">Dry Med</th>
        <th width="45px">Fridge Sticker</th>
        <th width="45px">Fridge Item</th>
        <th width="100px">Remarks</th>
        <th width="60px">Area</th>
        <th width="70px">BruHIMs #</th>
        <th width="70px">Tracking #</th>
        <th width="80px">Phone #</th>
        <th width="70px">Delivery Type</th>
        <th class="internal-notes">Internal Notes</th>
      </tr>
    </thead>
    <tbody>
      ${rows}
    </tbody>
  </table>
  
  <div class="footer">
    <div class="footer-item">
      <span class="footer-label">Collection Date:</span>
      <span>${previewData.summary.collectionDate || '_________________'}</span>
    </div>
    <div class="footer-item">
      <span class="footer-label">Received By (Driver):</span>
      <div class="signature-line"></div>
    </div>
    <div class="footer-item">
      <span class="footer-label">Pharmacy:</span>
      <span>${defaultPharmacy}</span>
    </div>
  </div>
  
  <div class="button-container">
    <button class="print" onclick="window.print()">Print</button>
    <button class="close" onclick="window.close()">Close</button>
  </div>

  <script>
    const packingListData = "${jsonData}";
    
    function exportToExcel() {
      try {
        if (window.opener && !window.opener.closed) {
          window.opener.postMessage({
            type: 'exportExcel',
            data: packingListData
          }, '*');
        } else {
          const fallbackUrl = 'https://grpharmacyappserver.onrender.com/api/export-packing-list?data=' + packingListData;
          window.open(fallbackUrl, '_blank');
        }
      } catch (error) {
        alert('Export error: ' + error.message);
      }
    }
    
    // Auto-print when opened (optional)
    window.addEventListener('load', () => {
      if (new URLSearchParams(window.location.search).has('autoprint')) {
        window.print();
      }
    });
  </script>
</body>
</html>`;
};
const handleDownloadPackingList = (showPreview = false) => {
  if (!previewData?.rows) return;
  
  if (showPreview) {
    handlePreviewPackingList();
  } else {
    generatePackingListExcel(previewData);
  }
};

const reDownloadExcelFromForm = async (formId) => {
  try {
    const response = await axios.get(`https://grpharmacyappserver.onrender.com/api/gr_dms/forms/${formId}`);
    
    if (response.data.success && response.data.form?.previewData) {
      const savedPreviewData = response.data.form.previewData;
      
      // Use the original form name if available
      const fileName = response.data.form.formName || `MOH_Orders_${dayjs().format('YYYYMMDD')}`;
      
      // Generate Excel with today's date
      generateExcelFromPreviewData({
        ...savedPreviewData,
        rows: savedPreviewData.rows.map(row => ({
          ...row,
          rawData: {
            ...row.rawData,
            creationDate: dayjs().format('DD.MM.YY') // Update date to today
          }
        }))
      }, fileName);
      
      message.success('Excel file re-downloaded successfully');
    } else {
      throw new Error('Form data not found');
    }
  } catch (error) {
    console.error('Error re-downloading Excel:', error);
    message.error(`Error re-downloading Excel: ${error.message}`);
  }
};

const generateExcelFromPreviewData = (previewData, customFileName) => {
  if (!previewData?.rows) return;

  // Always use today's date for the export
  const todayFormatted = dayjs().format('DD.MM.YY');
  
  const groupedData = previewData.rows.reduce((acc, row) => {
    const method = row.rawData.jobMethod || 'Others';
    if (!acc[method]) acc[method] = [];
    acc[method].push({
      ...row,
      // Use the same numbering as in the preview
      number: row.number 
    });
    return acc;
  }, {});

  const workbook = XLSX.utils.book_new();

  Object.entries(groupedData).forEach(([method, rows]) => {
    const sheetData = rows.map((row, index) => ({
      'Date of Form': todayFormatted, // Always use today's date
      'No.': row.number,
      'Go Rush Status': row.rawData.goRushStatus || 'N/A',
      'Tracking Number': row.rawData.doTrackingNumber || 'N/A',
      'Patient Name': row.rawData.receiverName || 'N/A',
      'Address': row.rawData.receiverAddress || 'N/A',
      'Area': row.rawData.area || 'N/A',
      'BruHIMs Number': row.rawData.patientNumber || 'N/A',
      'IC No.': row.rawData.icPassNum || 'N/A',
      'Appointment Place': row.rawData.appointmentPlace || 'N/A',
      'Phone Number': row.rawData.receiverPhoneNumber || 'N/A',
      'Additional Phone Number': row.rawData.additionalPhoneNumber || 'N/A',
      'Delivery Code': row.deliveryCode,
      'Remarks': row.rawData.pharmacyremarkss?.[0]?.remarks || 'N/A'
    }));

    const worksheet = XLSX.utils.json_to_sheet(sheetData);
    XLSX.utils.book_append_sheet(workbook, worksheet, method.substring(0, 31));
  });

  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  
  const fileName = customFileName || `MOH_Orders_${dayjs().format('YYYYMMDD')}`;
  saveAs(blob, `${fileName}.xlsx`);
};

const handleSaveToDMS = async (batchValue = 1) => {
  setIsSaving(true);
  
  try {
    const orderIds = previewData.rows.map(row => row.rawData._id);
    
    // Get the job method for the form name
    const jobMethod = previewData.meta.jobMethod || 'OTH';
    const startNo = previewData.meta.startNo || 'S1';
    const endNo = previewData.meta.endNo || `S${orderIds.length}`;
    const formDate = dayjs().format('DD.MM.YY'); // Format: 24.07.25
    
    // Create form name in format: "Standard B1 S1-S1 24.07.25"
    const formName = `${jobMethod} B${batchValue} ${startNo}-${endNo} ${formDate}`;
    
    // Prepare the complete preview data with the selected batch
    const completePreviewData = {
      ...previewData,
      meta: {
        ...previewData.meta,
        batchNo: batchValue.toString()
      },
      summary: {
        ...previewData.summary,
        batch: `B${batchValue} ${startNo}-${endNo}`
      }
    };
    
    // Optional: Generate HTML preview
    const htmlPreview = generateHTMLPreview(completePreviewData);
    
    const response = await axios.post('https://grpharmacyappserver.onrender.com/api/gr_dms/forms', {
      formName: formName,
      formDate: dayjs().format('DD-MM-YYYY'),
      batchNo: batchValue.toString(),
      startNo: startNo,
      endNo: endNo,
      creationDate: new Date(),
      mohForm: jobMethod,
      numberOfForms: orderIds.length.toString(),
      formCreator: 'Go Rush',
      orderIds: orderIds,
      
      // Save the complete preview data and HTML
      previewData: completePreviewData,
      htmlPreview: htmlPreview
    });
    
    if (response.data.success) {
      setSavedOrders(prev => [...new Set([...prev, ...orderIds])]);
      message.success(`Saved ${orderIds.length} orders to DMS (${formName})`);
      
      // Update preview data to show success and store form ID
      setPreviewData(prev => ({
        ...prev,
        savedToDMS: true,
        formId: response.data.formId // Store the form ID for future reference
      }));
    } else {
      throw new Error(response.data.error || 'Failed to save to DMS');
    }
  } catch (error) {
    console.error('DMS submission error:', error);
    message.error(`Error saving to DMS: ${error.response?.data?.error || error.message}`);
  } finally {
    setIsSaving(false);
  }
};

const handleDownloadExcel = () => {
  if (!previewData?.rows) return;

  // If this is a saved form (has formId), use the original preview data
  if (previewData.formId) {
    reDownloadExcelFromForm(previewData.formId);
  } else {
    // Otherwise generate new Excel from current preview data
    generateExcelFromPreviewData(previewData);
  }
  
  setIsPreviewVisible(false);
};

  const getDeliveryCodePrefix = (jobMethod) => {
    switch(jobMethod) {
      case 'Standard': return 'STD';
      case 'Express': return 'EXP';
      case 'Immediate': return 'IMM';
      case 'Self Collect': return 'SELF';
      case 'TTG': return 'TTG';
      case 'KB': return 'KB';
      default: return 'OTH';
    }
  };

  const parseMongoDate = (dateStr) => {
    if (!dateStr) return null;
    
    try {
      return dayjs(dateStr, 'DD-MM-YYYY h:mm A');
    } catch (error) {
      return dayjs(dateStr);
    }
  };

  const filterOrdersByDate = () => {
    let filtered = [...orders];

    if (selectedDate) {
      const selectedDateStr = selectedDate.format('DD-MM-YYYY');
      filtered = filtered.filter(order => {
        if (!order.creationDate) return false;
        const orderDate = parseMongoDate(order.creationDate);
        if (!orderDate || !orderDate.isValid()) return false;
        return orderDate.format('DD-MM-YYYY') === selectedDateStr;
      });
    } else if (dateRange && dateRange[0] && dateRange[1]) {
      const startDate = dateRange[0].startOf('day');
      const endDate = dateRange[1].endOf('day');
      filtered = filtered.filter(order => {
        if (!order.creationDate) return false;
        const orderDate = parseMongoDate(order.creationDate);
        if (!orderDate || !orderDate.isValid()) return false;
        return orderDate.isAfter(startDate) && orderDate.isBefore(endDate);
      });
    }

    setFilteredOrders(filtered);
    calculateJobMethodStats(filtered);
  };

const calculateJobMethodStats = (orders) => {
  const stats = {
    all: 0,
    Standard: 0,
    Express: 0,
    Immediate: 0,
    TTG: 0,
    KB: 0,
    Others: 0,
    Cancelled: 0,
    noCollectionDate: 0,
    noFormCreated: 0,
    StandardNoForm: 0,
    ExpressNoForm: 0,
    TTGNoForm: 0,
    KBNoForm: 0
  };

  orders.forEach(order => {
    if (order.goRushStatus === 'cancelled') {
      stats.Cancelled++;
      return;
    }

    if (!order.collectionDate) {
      stats.noCollectionDate++;
    }

    const noForm = !savedOrders.includes(order._id);
    if (noForm) {
      stats.noFormCreated++;
    }

    if (order.appointmentDistrict === "Tutong" && order.sendOrderTo === "PMMH") {
      stats.TTG++;
      if (noForm) stats.TTGNoForm++;
    } else if (order.appointmentDistrict === "Belait" && order.sendOrderTo === "SSBH") {
      stats.KB++;
      if (noForm) stats.KBNoForm++;
    } else if (order.jobMethod === 'Standard' || order.jobMethod === 'Self Collect') {
      stats.Standard++;
      if (noForm) stats.StandardNoForm++;
    } else if (order.jobMethod === 'Express') {
      stats.Express++;
      if (noForm) stats.ExpressNoForm++;
    } else if (order.jobMethod === 'Immediate') {
      stats.Immediate++;
    } else {
      stats.Others++;
    }
  });

  stats.all = orders.length;
  setJobMethodStats(stats);
};


  const getJobMethodIcon = (jobMethod) => {
    switch (jobMethod) {
      case 'Standard': return <ClockCircleOutlined />;
      case 'Express': return <RocketOutlined />;
      case 'Immediate': return <ThunderboltOutlined />;
      case 'Self Collect': return <CarOutlined />;
      case 'TTG': return <MedicineBoxOutlined />;
      case 'KB': return <MedicineBoxOutlined />;
      default: return <QuestionOutlined />;
    }
  };

  const getJobMethodColor = (jobMethod) => {
    switch (jobMethod) {
      case 'Standard': return 'blue';
      case 'Express': return 'orange';
      case 'Immediate': return 'red';
      case 'Self Collect': return 'green';
      case 'TTG': return 'purple';
      case 'KB': return 'cyan';
      default: return 'gray';
    }
  };


useEffect(() => {
  filterOrdersByDate();
}, [selectedDate, dateRange, orders]);

const getFilteredOrdersByTab = () => {
  let filtered = [...filteredOrders];
  
  // Apply tab filter
  switch (activeTab) {
    case 'Standard':
      filtered = filtered.filter(o => 
        (o.jobMethod === 'Standard' || o.jobMethod === 'Self Collect') && 
        o.goRushStatus !== 'cancelled'
      );
      break;
    case 'Express':
      filtered = filtered.filter(o => 
        o.jobMethod === 'Express' && o.goRushStatus !== 'cancelled'
      );
      break;
    case 'Immediate':
      filtered = filtered.filter(o => 
        o.jobMethod === 'Immediate' && o.goRushStatus !== 'cancelled'
      );
      break;
    case 'TTG':
      filtered = filtered.filter(o => 
        o.appointmentDistrict === "Tutong" && 
        o.sendOrderTo === "PMMH" &&
        o.goRushStatus !== 'cancelled'
      );
      break;
    case 'KB':
      filtered = filtered.filter(o => 
        o.appointmentDistrict === "Belait" && 
        o.sendOrderTo === "SSBH" &&
        o.goRushStatus !== 'cancelled'
      );
      break;
    case 'noCollectionDate':
      filtered = filtered.filter(o => 
        !o.collectionDate && 
        o.goRushStatus !== 'cancelled'
      );
      break;
    case 'noFormCreated':
      filtered = filtered.filter(o => 
        !savedOrders.includes(o._id) && 
        o.goRushStatus !== 'cancelled'
      );
      break;
    case 'StandardNoForm':
      filtered = filtered.filter(o => 
        o.jobMethod === 'Standard' && 
        !savedOrders.includes(o._id) && 
        o.goRushStatus !== 'cancelled'
      );
      break;
    case 'ExpressNoForm':
      filtered = filtered.filter(o => 
        o.jobMethod === 'Express' && 
        !savedOrders.includes(o._id) && 
        o.goRushStatus !== 'cancelled'
      );
      break;
    case 'TTGNoForm':
      filtered = filtered.filter(o => 
        o.appointmentDistrict === "Tutong" && 
        o.sendOrderTo === "PMMH" &&
        !savedOrders.includes(o._id) && 
        o.goRushStatus !== 'cancelled'
      );
      break;
    case 'KBNoForm':
      filtered = filtered.filter(o => 
        o.appointmentDistrict === "Belait" && 
        o.sendOrderTo === "SSBH" &&
        !savedOrders.includes(o._id) && 
        o.goRushStatus !== 'cancelled'
      );
      break;
    case 'Cancelled':
      filtered = filtered.filter(o => o.goRushStatus === 'cancelled');
      break;
    case 'Others':
      filtered = filtered.filter(o => 
        !['Standard', 'Express', 'Immediate', 'Self Collect'].includes(o.jobMethod) &&
        !(o.appointmentDistrict === "Tutong" && o.sendOrderTo === "PMMH") &&
        !(o.appointmentDistrict === "Belait" && o.sendOrderTo === "SSBH") &&
        o.goRushStatus !== 'cancelled'
      );
      break;
    default: // 'all' tab
      // No additional filtering needed, but we could add cancelled filter if desired
      break;
  }
  
  // Apply search filter if there's a search term
  if (searchTerm.trim()) {
    const lowerTerm = searchTerm.toLowerCase();
    filtered = filtered.filter(order => {
      return (
        order.doTrackingNumber?.toLowerCase().includes(lowerTerm) ||
        order.receiverName?.toLowerCase().includes(lowerTerm) ||
        (savedOrders.includes(order._id) && 
          savedForms.find(f => f.orderIds?.includes(order._id))?.formName?.toLowerCase().includes(lowerTerm))
      );
    });
  }
  
  return filtered;
};

  const clearDateFilters = () => {
    setSelectedDate(null);
    setDateRange(null);
  };

  const handleBulkCollectionUpdate = async () => {
    if (!collectionDate) {
      message.error('Please select a collection date');
      return;
    }

    if (!trackingNumbers.trim()) {
      message.error('Please enter tracking numbers');
      return;
    }

    const trackingList = trackingNumbers
      .split(/[\n,\s]+/)
      .map(num => num.trim())
      .filter(num => num.length > 0);

    if (trackingList.length === 0) {
      message.error('No valid tracking numbers found');
      return;
    }

    setBulkUpdateLoading(true);

    try {
      const response = await fetch('https://grpharmacyappserver.onrender.com/api/orders/bulk-collection-date', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          trackingNumbers: trackingList,
          collectionDate: collectionDate.format('DD-MM-YYYY'),
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to update collection dates');
      }

      message.success(
        `Successfully updated collection date for ${result.updatedCount} orders`
      );

      setCollectionDate(null);
      setTrackingNumbers('');
      setIsCollectionModalVisible(false);

      const ordersResponse = await fetch('https://grpharmacyappserver.onrender.com/api/orders?role=moh');
      const ordersData = await ordersResponse.json();
      if (ordersResponse.ok) {
        setOrders(ordersData);
        setFilteredOrders(ordersData);
        calculateJobMethodStats(ordersData);
      }

    } catch (error) {
      message.error(`Error: ${error.message}`);
    } finally {
      setBulkUpdateLoading(false);
    }
  };

  const showCollectionModal = () => {
    setIsCollectionModalVisible(true);
  };

  const handleCollectionModalCancel = () => {
    setIsCollectionModalVisible(false);
    setCollectionDate(null);
    setTrackingNumbers('');
  };

const formatDateTime = (dateTime) => {
  if (!dateTime) return 'N/A';
  
  // Handle both string dates and Date objects
  const parsedDate = dayjs(dateTime);
  
  if (!parsedDate.isValid()) {
    // Try parsing as ISO string if initial parse fails
    const isoParsed = dayjs(dateTime, 'YYYY-MM-DDTHH:mm:ss.SSSZ');
    return isoParsed.isValid() ? isoParsed.format('MMM DD, YYYY h:mm A') : dateTime;
  }
  
  return parsedDate.format('MMM DD, YYYY h:mm A');
};

  const formatDateTimeExtraction = (dateString) => {
    if (!dateString) return 'N/A';
    const parsedDate = parseMongoDate(dateString);
    if (!parsedDate || !parsedDate.isValid()) return dateString;
    return parsedDate.format('DD.MM.YYYY');
  };


const handleViewSavedManifest = async (orderId) => {
  try {
    console.log('Looking for manifest with orderId:', orderId);
    setLoading(true);
    
    const response = await axios.get(`https://grpharmacyappserver.onrender.com/api/gr_dms/forms/by-order/${orderId}`);
    console.log('API Response:', response.data);
    
    if (response.data.success && response.data.form) {
      const form = response.data.form;
      console.log('Form found:', {
        formId: form._id,
        formName: form.formName,
        previewDataExists: !!form.previewData,
        rowsCount: form.previewData?.rows?.length || 0
      });
      
      // Get the preview data - use the saved data directly
      const savedPreviewData = form.previewData;
      
      if (!savedPreviewData?.rows || savedPreviewData.rows.length === 0) {
        console.error('No rows found in preview data');
        message.error('No order data found in this manifest');
        return;
      }
      
      // Set the preview data directly from the saved form
      setPreviewData({
        rows: savedPreviewData.rows,
        summary: savedPreviewData.summary || {
          total: savedPreviewData.rows.length,
          deliveryMethod: form.mohForm || 'Standard',
          batch: `B${form.batchNo || 1} ${form.startNo || 'S1'}-${form.endNo || 'S1'}`,
          formDate: dayjs(form.creationDate).format('DD.MM.YY')
        },
        meta: savedPreviewData.meta || {
          jobMethod: form.mohForm || 'Standard',
          batchNo: form.batchNo || '1',
          startNo: form.startNo || 'S1', 
          endNo: form.endNo || 'S1',
          formDate: dayjs(form.creationDate).format('DD.MM.YY')
        },
        savedToDMS: true,
        formId: form._id
      });
      
      setIsPreviewVisible(true);
      console.log('Preview should now be visible');
      
    } else {
      console.error('No form found in response');
      message.error('No manifest found for this order');
    }
  } catch (error) {
    console.error('Error fetching manifest:', error);
    message.error(`Failed to load manifest: ${error.response?.data?.error || error.message}`);
  } finally {
    setLoading(false);
  }
};

const columns = [
  {
    title: 'Form',
    key: 'saved',
    width: 80, // Increased width to accommodate form names
    align: 'left', // Changed from center to left
    fixed: 'left',
    render: (_, record) => {
      if (savedOrders.includes(record._id)) {
        // Find the form that contains this order
        const form = savedForms.find(f => 
          f.orderIds?.includes(record._id) || 
          (f.previewData?.rows?.some(row => row.rawData?._id === record._id))
        );
        
        const formName = form?.formName || 'Saved Manifest';
        
        return (
          <Tooltip title={`Click to view/download ${formName}`}>
            <div 
              style={{ 
                color: '#52c41a',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontWeight: 500
              }} 
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleViewSavedManifest(record._id);
              }}
            >
              <CheckCircleOutlined style={{ marginRight: 4 }} />
              <span style={{
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                maxWidth: '160px'
              }}>
                {formName}
              </span>
            </div>
          </Tooltip>
        );
      }
      return null;
    },
  },

    {
      title: 'Order ID',
      dataIndex: 'doTrackingNumber',
      key: 'doTrackingNumber',
      render: (text) => (
        <Text strong style={styles.trackingId}>
          {text || 'N/A'}
        </Text>
      ),
      width: 120,
    },
      {
    title: 'Collection Date',
    dataIndex: 'collectionDate',
    key: 'collectionDate',
    width: 150,
    render: (date) => {
      if (!date) return <Tag color="red">Not set</Tag>;
      
      // Parse the date from MongoDB (could be ISO string or Date object)
      const parsedDate = dayjs(date);
      
      if (!parsedDate.isValid()) {
        return <Tag color="orange">Invalid date</Tag>;
      }
      
      // Format as "DD-MMM-YY" (e.g., "31-Jul-25")
      return parsedDate.format('DD-MMM-YY');
    },
    sorter: (a, b) => {
      const dateA = dayjs(a.collectionDate);
      const dateB = dayjs(b.collectionDate);
      
      if (!dateA.isValid()) return 1;
      if (!dateB.isValid()) return -1;
      
      return dateA.unix() - dateB.unix();
    },
  },
    {
      title: 'Patient',
      dataIndex: 'receiverName',
      key: 'receiverName',
      render: (text) => text || 'N/A',
      width: 150,
    },
    {
      title: 'Address',
      dataIndex: 'receiverAddress',
      key: 'receiverAddress',
      render: (text) => text || 'N/A',
      width: 200,
    },
    {
      title: 'Area',
      dataIndex: 'area',
      key: 'area',
      render: (text) => text || 'N/A',
      width: 100,
    },
    {
      title: 'Phone',
      dataIndex: 'receiverPhoneNumber',
      key: 'receiverPhoneNumber',
      render: (text) => text || 'N/A',
      width: 120,
    },
{
  title: 'Job Type',
  dataIndex: 'jobMethod',
  key: 'jobMethod',
  render: (jobMethod) => {
    // Treat 'Self Collect' as 'Standard' for display
    const displayMethod = jobMethod === 'Self Collect' ? 'Standard' : jobMethod;
    return (
      <Tag 
        icon={getJobMethodIcon(displayMethod)} 
        color={getJobMethodColor(displayMethod)}
        style={{ display: 'flex', alignItems: 'center', fontWeight: '500' }}
      >
        {['Standard', 'Express', 'Immediate'].includes(displayMethod) 
          ? displayMethod 
          : 'Others'}
      </Tag>
    );
  },
  filters: [
    { text: 'Standard', value: 'Standard' },
    { text: 'Express', value: 'Express' },
    { text: 'Immediate', value: 'Immediate' },
    { text: 'Others', value: 'Others' },
  ],
  onFilter: (value, record) => {
    if (value === 'Others') {
      return !['Standard', 'Express', 'Immediate', 'Self Collect'].includes(record.jobMethod);
    }
    // Include 'Self Collect' when filtering for 'Standard'
    if (value === 'Standard') {
      return record.jobMethod === 'Standard' || record.jobMethod === 'Self Collect';
    }
    return record.jobMethod === value;
  },
  width: 130,
},
    {
      title: 'Status',
      dataIndex: 'goRushStatus',
      key: 'goRushStatus',
      render: status => {
        let color = '';
        switch (status) {
          case 'ready': color = 'green'; break;
          case 'pending': color = 'orange'; break;
          case 'processing': color = 'blue'; break;
          case 'cancelled': color = 'red'; break;
          default: color = 'gray';
        }
        return <Tag color={color} style={{ fontWeight: '500' }}>{status || 'N/A'}</Tag>;
      },
      width: 100,
    },
    {
      title: 'Created',
      dataIndex: 'creationDate',
      key: 'creationDate',
      render: (text) => formatDateTime(text),
      sorter: (a, b) => {
        const dateA = parseMongoDate(a.creationDate);
        const dateB = parseMongoDate(b.creationDate);
        
        if (!dateA || !dateA.isValid()) return 1;
        if (!dateB || !dateB.isValid()) return -1;
        
        return dateA.unix() - dateB.unix();
      },
      width: 150,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Button 
          type="link" 
          onClick={() => navigate(`/orders/${record._id}`)}
          style={styles.actionButton}
        >
          View Details
        </Button>
      ),
      width: 100,
    },
  ];

  const rowSelection = {
    selectedRowKeys,
    onChange: (selectedRowKeys, selectedRows) => {
      setSelectedRowKeys(selectedRowKeys);
      setSelectedRows(selectedRows);
    },
  };

  if (error) {
    return (
      <div style={{ padding: '24px' }}>
        <Alert 
          message="Error Loading Orders" 
          description={error} 
          type="error" 
          showIcon 
          style={{ maxWidth: '800px' }}
        />
      </div>
    );
  }

  const searchOrders = (term) => {
  if (!term.trim()) {
    return filteredOrders; // Return current filtered orders if search is empty
  }

  const lowerTerm = term.toLowerCase();
  
  return filteredOrders.filter(order => {
    // Search in tracking number
    if (order.doTrackingNumber?.toLowerCase().includes(lowerTerm)) {
      return true;
    }
    
    // Search in patient name
    if (order.receiverName?.toLowerCase().includes(lowerTerm)) {
      return true;
    }
    
    // Search in form name (for saved orders)
    if (savedOrders.includes(order._id)) {
      const form = savedForms.find(f => f.orderIds?.includes(order._id));
      if (form?.formName?.toLowerCase().includes(lowerTerm)) {
        return true;
      }
    }
    
    return false;
  });
};

  return (
    <div style={styles.layout}>
      <div style={styles.container}>

        
        {/* Header */}
        <div style={styles.header}>
          <Title level={2} style={styles.headerTitle}>
            <MedicineBoxOutlined style={{ marginRight: '12px' }} />
            MOH Pharmacy Orders Dashboard
          </Title>
          <Text type="secondary" style={styles.headerSubtitle}>
            Monitor and manage pharmacy orders by job type and date
          </Text>
        </div>
        <div className="flex justify-between items-center mb-4">
</div>

        {/* Date Filters and Collection Date Update */}
        <Card style={{
          marginBottom: '24px',
          boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
          padding: '16px',
          borderRadius: '8px',
          background: '#fff',
        }}>
          <div style={{ 
            display: 'flex', 
            flexWrap: 'wrap',
            gap: '16px',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            {/* Date Filters Section */}
            <div style={{ 
              display: 'flex', 
              flexWrap: 'wrap',
              alignItems: 'center',
              gap: '16px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CalendarOutlined style={{ color: '#1890ff' }} />
                <Text strong>Date Filters:</Text>
              </div>

              <Tooltip title="Preview selected orders">
                <Button
                  type="primary"
                  icon={<EyeOutlined />}
                  onClick={handlePreview}
                  disabled={selectedRows.length === 0}
                  style={{
                    backgroundColor: '#1890ff',
                    borderColor: '#1890ff',
                    marginLeft: '8px'
                  }}
                >
                  Preview Export ({selectedRows.length})
                </Button>
              </Tooltip>

              <Space.Compact>
                <DatePicker
                  placeholder="Specific date"
                  value={selectedDate}
                  onChange={(date) => {
                    setSelectedDate(date);
                    if (date) setDateRange(null);
                  }}
                  style={{ width: '160px' }}
                  format="DD-MM-YYYY"
                  showTime={false}
                />
              </Space.Compact>

              <Text type="secondary" style={{ margin: '0 8px' }}>or</Text>

              <RangePicker
                placeholder={['Start date', 'End date']}
                value={dateRange}
                onChange={(dates) => {
                  setDateRange(dates);
                  if (dates) setSelectedDate(null);
                }}
                style={{ width: '240px' }}
                format="DD-MM-YYYY"
                showTime={false}
              />

              {(selectedDate || dateRange) && (
                <Button
                  type="default"
                  onClick={clearDateFilters}
                  style={{
                    marginLeft: '8px',
                    color: '#f5222d',
                    borderColor: '#f5222d',
                  }}
                >
                  Clear
                </Button>
              )}
            </div>

<div
  style={{
    display: 'flex',
    justifyContent: 'flex-start', // Align left
    alignItems: 'center',
    width: 400,
    paddingLeft: '0px' // Optional: small left padding
  }}
>
  <Input
    placeholder="Search by tracking number, patient name, or form name..."
    value={searchTerm}
    onChange={(e) => setSearchTerm(e.target.value)}
    allowClear
    prefix={<SearchOutlined />}
  />
</div>

            {/* Bulk Update Button */}
            <Tooltip title="Set collection date for multiple orders">
              <Button
                type="primary"
                icon={<EditOutlined />}
                onClick={showCollectionModal}
                style={{
                  backgroundColor: '#52c41a',
                  borderColor: '#52c41a',
                }}
              >
                Set Collection Date
              </Button>
            </Tooltip>
          </div>
        </Card>
        

        {/* Statistics Cards */}
        <Row gutter={[16, 16]} style={{ marginBottom: '32px' }}>
          <Col xs={24} sm={12} lg={8} xl={4}>
            <Card style={styles.statCard}>
              <Statistic 
                title="Standard" 
                value={jobMethodStats.Standard} 
                prefix={<ClockCircleOutlined />} 
                valueStyle={{ color: '#1890ff', fontSize: '28px', fontWeight: 'bold' }} 
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={8} xl={4}>
            <Card style={styles.statCard}>
              <Statistic 
                title="Express" 
                value={jobMethodStats.Express} 
                prefix={<RocketOutlined />} 
                valueStyle={{ color: '#fa8c16', fontSize: '28px', fontWeight: 'bold' }} 
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={8} xl={4}>
            <Card style={styles.statCard}>
              <Statistic 
                title="Immediate" 
                value={jobMethodStats.Immediate} 
                prefix={<ThunderboltOutlined />} 
                valueStyle={{ color: '#f5222d', fontSize: '28px', fontWeight: 'bold' }} 
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={8} xl={4}>
            <Card style={styles.statCard}>
              <Statistic 
                title="TTG (Tutong)" 
                value={jobMethodStats.TTG} 
                prefix={<MedicineBoxOutlined />} 
                valueStyle={{ color: '#722ed1', fontSize: '28px', fontWeight: 'bold' }} 
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={8} xl={4}>
            <Card style={styles.statCard}>
              <Statistic 
                title="KB (Belait)" 
                value={jobMethodStats.KB} 
                prefix={<MedicineBoxOutlined />} 
                valueStyle={{ color: '#13c2c2', fontSize: '28px', fontWeight: 'bold' }} 
              />
            </Card>
          </Col>
            <Col xs={24} sm={12} lg={8} xl={4}>
    <Card style={styles.statCard}>
      <Statistic 
        title="No Collection Date" 
        value={jobMethodStats.noCollectionDate} 
        prefix={<CalendarOutlined />} 
        valueStyle={{ 
          color: jobMethodStats.noCollectionDate > 0 ? '#f5222d' : '#52c41a', 
          fontSize: '28px', 
          fontWeight: 'bold' 
        }} 
      />
    </Card>
  </Col>

  {/* New card for orders without form creation */}
  <Col xs={24} sm={12} lg={8} xl={4}>
    <Card style={styles.statCard}>
      <Statistic 
        title="No Form Created" 
        value={jobMethodStats.noFormCreated} 
        prefix={<FileExclamationOutlined />} 
        valueStyle={{ 
          color: jobMethodStats.noFormCreated > 0 ? '#faad14' : '#52c41a', 
          fontSize: '28px', 
          fontWeight: 'bold' 
        }} 
      />
    </Card>
  </Col>
        </Row>

        {/* Main Content */}
        <Card style={styles.mainCard}>
          <Tabs 
            activeKey={activeTab}
            onChange={setActiveTab}
            style={{ marginBottom: '24px' }}
            size="large"
            tabBarStyle={{ marginBottom: '24px' }}
          >
            <TabPane 
              tab={
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <MedicineBoxOutlined />
                  All Orders
                  <Tag color="blue" style={styles.tabBadge}>{jobMethodStats.all}</Tag>
                </span>
              } 
              key="all" 
            />
            <TabPane 
              tab={
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ClockCircleOutlined />
                  Standard
                  <Tag color="blue" style={styles.tabBadge}>{jobMethodStats.Standard}</Tag>
                </span>
              } 
              key="Standard" 
            />
            <TabPane 
              tab={
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <RocketOutlined />
                  Express
                  <Tag color="orange" style={styles.tabBadge}>{jobMethodStats.Express}</Tag>
                </span>
              } 
              key="Express" 
            />
            <TabPane 
              tab={
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ThunderboltOutlined />
                  Immediate
                  <Tag color="red" style={styles.tabBadge}>{jobMethodStats.Immediate}</Tag>
                </span>
              } 
              key="Immediate" 
            />
            <TabPane 
              tab={
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <QuestionOutlined />
                  Others
                  <Tag color="gray" style={styles.tabBadge}>{jobMethodStats.Others}</Tag>
                </span>
              } 
              key="Others" 
            />
            <TabPane 
              tab={
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <MedicineBoxOutlined />
                  TTG (Tutong)
                  <Tag color="purple" style={styles.tabBadge}>{jobMethodStats.TTG}</Tag>
                </span>
              } 
              key="TTG" 
            />
            <TabPane 
              tab={
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <MedicineBoxOutlined />
                  KB (Belait)
                  <Tag color="cyan" style={styles.tabBadge}>{jobMethodStats.KB}</Tag>
                </span>
              } 
              key="KB" 
            />
            <TabPane 
    tab={
      <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <CalendarOutlined />
        No Collection Date
        <Tag color="red" style={styles.tabBadge}>{jobMethodStats.noCollectionDate}</Tag>
      </span>
    } 
    key="noCollectionDate" 
  />
  <TabPane 
    tab={
      <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <FileExclamationOutlined />
        No Form Created
        <Tag color="orange" style={styles.tabBadge}>{jobMethodStats.noFormCreated}</Tag>
      </span>
    } 
    key="noFormCreated" 
  />
    <TabPane 
    tab={
      <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <CloseCircleOutlined />
        Cancelled
        <Tag color="red" style={styles.tabBadge}>{jobMethodStats.Cancelled}</Tag>
      </span>
    } 
    key="Cancelled" 
  />
    <TabPane 
    tab={
      <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <FileExclamationOutlined />
        Standard (No Form)
        <Tag color="orange" style={styles.tabBadge}>{jobMethodStats.StandardNoForm}</Tag>
      </span>
    } 
    key="StandardNoForm" 
  />
  <TabPane 
    tab={
      <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <FileExclamationOutlined />
        Express (No Form)
        <Tag color="orange" style={styles.tabBadge}>{jobMethodStats.ExpressNoForm}</Tag>
      </span>
    } 
    key="ExpressNoForm" 
  />
  <TabPane 
    tab={
      <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <FileExclamationOutlined />
        TTG (No Form)
        <Tag color="orange" style={styles.tabBadge}>{jobMethodStats.TTGNoForm}</Tag>
      </span>
    } 
    key="TTGNoForm" 
  />
  <TabPane 
    tab={
      <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <FileExclamationOutlined />
        KB (No Form)
        <Tag color="orange" style={styles.tabBadge}>{jobMethodStats.KBNoForm}</Tag>
      </span>
    } 
    key="KBNoForm" 
  />
</Tabs>

          <Spin spinning={loading}>
<Table
  columns={columns}
  dataSource={getFilteredOrdersByTab()}
  rowKey="_id"
  size="middle"
  scroll={{ x: 1500 }}
  rowSelection={{
    type: 'checkbox',
    ...rowSelection,
  }}
  pagination={{
    pageSize: 15,
    showSizeChanger: true,
    pageSizeOptions: ['15', '30', '50', '100'],
    showQuickJumper: true,
    showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} orders`,
  }}
  style={{
    ...styles.table,
    border: '1px solid #f0f0f0',
    borderRadius: '8px',
  }}
/>
          </Spin>
        </Card>

        {/* Collection Date Modal */}
        <Modal
          title={
            <div style={styles.modalHeader}>
              <EditOutlined style={styles.modalIcon} />
              <span>Set Collection Date for Multiple Orders</span>
            </div>
          }
          open={isCollectionModalVisible}
          onOk={handleBulkCollectionUpdate}
          onCancel={handleCollectionModalCancel}
          confirmLoading={bulkUpdateLoading}
          width={600}
          okText="Update Collection Date"
          okButtonProps={{
            style: {
              backgroundColor: '#52c41a',
              borderColor: '#52c41a',
              '&:hover': {
                backgroundColor: '#73d13d',
                borderColor: '#73d13d'
              }
            },
            icon: <CheckCircleOutlined />
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <Text strong style={{ display: 'block', marginBottom: '8px' }}>
                Collection Date:
              </Text>

              <DatePicker
                placeholder="Select collection date"
                value={collectionDate}
                onChange={setCollectionDate}
                style={{ width: '100%' }}
                format="DD-MM-YYYY"
                showTime={false}
              />
            </div>
            
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <Text strong>
                  Tracking Numbers:
                </Text>
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  Separate by new lines, commas, or spaces
                </Text>
              </div>
              <TextArea
                placeholder={`Enter tracking numbers, for example:
TRK001
TRK002, TRK003
TRK004 TRK005
TRK006,TRK007,TRK008`}
                value={trackingNumbers}
                onChange={(e) => setTrackingNumbers(e.target.value)}
                rows={8}
                style={styles.trackingInput}
              />
              {trackingNumbers && (
                <div style={{ marginTop: '8px' }}>
                  <Text type="secondary" style={{ fontSize: '12px' }}>
                    Found {trackingNumbers.split(/[\n,\s]+/).filter(num => num.trim().length > 0).length} tracking numbers
                  </Text>
                </div>
              )}
            </div>
            
            <Alert
              message="Bulk Collection Date Update"
              description="This will update the collection date for all orders matching the provided tracking numbers. Make sure the tracking numbers are correct before proceeding."
              type="info"
              showIcon
              style={{ marginTop: '16px' }}
            />
          </div>
        </Modal>

        {/* Preview Modal */}
<PreviewModal
  visible={isPreviewVisible}
  data={previewData}
  onCancel={() => setIsPreviewVisible(false)}
  onSave={handleSaveToDMS}
  onDownloadExcel={handleDownloadExcel}
  onDownloadPackingList={() => handleDownloadPackingList(false)}
    onPreviewPackingList={handlePreviewPackingList}
  loading={isSaving}
  startNumber={startNumber}
  setStartNumber={setStartNumber}
    setSelectedDate={setSelectedDate}
      setDateRange={setDateRange}
/>
      </div>


    </div>
  );
};

export default MohOrdersDashboard;