
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
  DownloadOutlined,
  FileExclamationOutlined,
  SearchOutlined
} from '@ant-design/icons';

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
  tabBadge: {
    marginLeft: '4px',
  },
  noFormAlert: {
    backgroundColor: '#fff7e6',
    border: '1px solid #ffd666',
    borderRadius: '6px',
    padding: '16px',
    marginBottom: '24px',
  }
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
  setStartNumber,
  setSelectedRowKeys,
  setSelectedRows
}) => {
  const [batchValue, setBatchValue] = useState(1);
  const [collectionDate, setCollectionDate] = useState(null);
  const [isSettingCollectionDate, setIsSettingCollectionDate] = useState(false);

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
        // Mock API call - replace with actual implementation
        message.success(`Updated collection date for ${safeData.rows.length} orders`);
      }
      
      await onSave(batchValue);
      
      if (setSelectedRowKeys) setSelectedRowKeys([]);
      if (setSelectedRows) setSelectedRows([]);
    } catch (error) {
      console.error('Error setting collection date:', error);
      message.error(`Error: ${error.message}`);
    } finally {
      setIsSettingCollectionDate(false);
    }
  };

  const columns = [
    {
      title: 'No.',
      dataIndex: 'number',
      key: 'number',
      width: 60,
      render: (text) => text
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
      default: return 'O';
    }
  };

  return (
    <Modal
      title={data?.savedToDMS ? `Saved Manifest: ${data?.summary?.batch || ''}` : "Preview Orders (No Forms)"}
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
        <Button 
          key="download" 
          type="primary" 
          onClick={onDownloadExcel}
          disabled={!data?.savedToDMS || !safeData?.rows || safeData.rows.length === 0}
          icon={<DownloadOutlined />}
        >
          Download Excel
        </Button>
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

const MohNoFormsDashboard = () => {
  const [orders, setOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [startNumber, setStartNumber] = useState(1);
  const [previewData, setPreviewData] = useState(null);
  const [pageSize, setPageSize] = useState(15);
  const [isPreviewVisible, setIsPreviewVisible] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [jobMethodStats, setJobMethodStats] = useState({
    all: 0,
    Standard: 0,
    Express: 0,
    Immediate: 0,
    TTG: 0,
    KB: 0,
    Others: 0,
    noCollectionDate: 0
  });

  const [activeTab, setActiveTab] = useState('all');
  const [selectedDate, setSelectedDate] = useState(null);
  const [dateRange, setDateRange] = useState(null);

  // Fetch MOH orders from API
  const fetchMohOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('https://gorushpharmacy-server.onrender.com/api/orders?role=moh', {
        headers: {
          'X-User-Role': 'gorush'
        }
      });
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch orders');
      }
      
      // Filter for pharmacy orders without forms created
      const filteredData = data
        .filter(order => order.product === 'pharmacymoh')
        .filter(order => 
          order.pharmacyFormCreated === 'No' || 
          order.pharmacyFormCreated === null || 
          order.pharmacyFormCreated === undefined
        );
      
      setOrders(filteredData);
      setFilteredOrders(filteredData);
      
    } catch (err) {
      console.error('Error fetching MOH orders:', err);
      setError(err.message);
      message.error(`Failed to load orders: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Load data on component mount
  useEffect(() => {
    fetchMohOrders();
  }, []);

  // Filter orders to only show those without forms created and calculate stats
  useEffect(() => {
    calculateJobMethodStats(filteredOrders);
  }, [filteredOrders]);

  const calculateJobMethodStats = (orders) => {
    const stats = {
      all: 0,
      Standard: 0,
      Express: 0,
      Immediate: 0,
      TTG: 0,
      KB: 0,
      Others: 0,
      noCollectionDate: 0
    };

    orders.forEach(order => {
      if (!order.collectionDate) {
        stats.noCollectionDate++;
      }

      // Check for TTG/KB specific conditions
      if (order.appointmentDistrict === "Tutong" && order.sendOrderTo === "PMMH") {
        stats.TTG++;
      } else if (order.appointmentDistrict === "Belait" && order.sendOrderTo === "SSBH") {
        stats.KB++;
      } 
      // Then check for Standard/Express/Immediate
      else if (order.jobMethod === 'Standard' || order.jobMethod === 'Self Collect') {
        stats.Standard++;
      } else if (order.jobMethod === 'Express') {
        stats.Express++;
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

  const formatDateTime = (dateTime) => {
    if (!dateTime) return 'N/A';
    // Handle different date formats from API
    try {
      const date = new Date(dateTime);
      return date.toLocaleString('en-GB', {
        day: '2-digit',
        month: '2-digit', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateTime; // Return original if parsing fails
    }
  };

  const clearDateFilters = () => {
    setSelectedDate(null);
    setDateRange(null);
  };

  const getFilteredOrdersByTab = () => {
    let filtered = [...filteredOrders];
    
    // Apply tab filter
    switch (activeTab) {
      case 'Standard':
        filtered = filtered.filter(o => 
          (o.jobMethod === 'Standard' || o.jobMethod === 'Self Collect') &&
          !(o.appointmentDistrict === "Tutong" && o.sendOrderTo === "PMMH") &&
          !(o.appointmentDistrict === "Belait" && o.sendOrderTo === "SSBH")
        );
        break;
      case 'Express':
        filtered = filtered.filter(o => o.jobMethod === 'Express');
        break;
      case 'Immediate':
        filtered = filtered.filter(o => o.jobMethod === 'Immediate');
        break;
      case 'TTG':
        filtered = filtered.filter(o => 
          o.appointmentDistrict === "Tutong" && o.sendOrderTo === "PMMH"
        );
        break;
      case 'KB':
        filtered = filtered.filter(o => 
          o.appointmentDistrict === "Belait" && o.sendOrderTo === "SSBH"
        );
        break;
      case 'noCollectionDate':
        filtered = filtered.filter(o => !o.collectionDate);
        break;
      case 'Others':
        filtered = filtered.filter(o => 
          !['Standard', 'Express', 'Immediate', 'Self Collect'].includes(o.jobMethod) &&
          !(o.appointmentDistrict === "Tutong" && o.sendOrderTo === "PMMH") &&
          !(o.appointmentDistrict === "Belait" && o.sendOrderTo === "SSBH")
        );
        break;
      default: // 'all' tab
        break;
    }
    
    // Apply search filter
    if (searchTerm.trim()) {
      const lowerTerm = searchTerm.toLowerCase();
      filtered = filtered.filter(order => {
        return (
          order.doTrackingNumber?.toLowerCase().includes(lowerTerm) ||
          order.receiverName?.toLowerCase().includes(lowerTerm)
        );
      });
    }
    
    return filtered;
  };

  const preparePreviewData = (selectedRows, currentStartNumber) => {
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
    
    let prefix = '';
    switch(jobMethod) {
      case 'TTG': prefix = 'T'; break;
      case 'KB': prefix = 'K'; break;
      case 'Standard': prefix = 'S'; break;
      case 'Express': prefix = 'E'; break;
      case 'Immediate': prefix = 'IMM'; break;
      case 'Self Collect': prefix = 'SC'; break;
      default: prefix = 'O';
    }

    const startNo = `${prefix}${currentStartNumber}`;
    const endNo = `${prefix}${currentStartNumber + selectedRows.length - 1}`;

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
        batch: `B${batchNo} ${startNo}-${endNo}`
      },
      meta: {
        jobMethod,
        batchNo,
        startNo,
        endNo
      }
    };
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

  const handlePreview = () => {
    const fullSelectedRows = orders.filter(order => 
      selectedRowKeys.includes(order._id)
    );

    if (fullSelectedRows.length === 0) {
      message.warning('Please select at least one order to export');
      return;
    }
    
    const previewData = preparePreviewData(fullSelectedRows, startNumber);
    setPreviewData(previewData);
    setIsPreviewVisible(true);
  };

  const handleSaveToDMS = async (batchValue = 1) => {
    setIsSaving(true);
    
    try {
      // Mock save operation - replace with actual API call
      setTimeout(() => {
        message.success(`Saved ${previewData.rows.length} orders to DMS`);
        setPreviewData(prev => ({
          ...prev,
          savedToDMS: true
        }));
        setSelectedRowKeys([]);
        setSelectedRows([]);
        setIsSaving(false);
      }, 1500);
    } catch (error) {
      console.error('DMS submission error:', error);
      message.error(`Error saving to DMS: ${error.message}`);
      setIsSaving(false);
    }
  };

  const handleDownloadExcel = () => {
    message.success('Excel download started');
    setIsPreviewVisible(false);
  };

  const handleRefresh = () => {
    fetchMohOrders();
  };

  const columns = [
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
        return date;
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
      title: 'Form Status',
      dataIndex: 'pharmacyFormCreated',
      key: 'pharmacyFormCreated',
      render: (status) => (
        <Tag color="red" icon={<FileExclamationOutlined />}>
          {status === 'No' ? 'No Form' : 'Missing Form'}
        </Tag>
      ),
      width: 120,
    },
    {
      title: 'Created',
      dataIndex: 'creationDate',
      key: 'creationDate',
      render: (text) => formatDateTime(text),
      width: 150,
    },
  ];

  const rowSelection = {
    selectedRowKeys,
    onChange: (selectedRowKeys, selectedRows) => {
      setSelectedRowKeys(selectedRowKeys);
      setSelectedRows(selectedRows);
    },
    preserveSelectedRowKeys: true,
    getCheckboxProps: (record) => ({
      disabled: record.goRushStatus === 'cancelled',
    }),
  };

  // Show error state
  if (error && !loading) {
    return (
      <div style={styles.layout}>
        <div style={styles.container}>
          <Alert
            message="Error Loading Orders"
            description={`Failed to load MOH orders: ${error}`}
            type="error"
            showIcon
            action={
              <Button size="small" onClick={handleRefresh}>
                Retry
              </Button>
            }
          />
        </div>
      </div>
    );
  }

  return (
    <div style={styles.layout}>
      <div style={styles.container}>
        {/* Header */}
        <div style={styles.header}>
          <Title level={2} style={styles.headerTitle}>
            <FileExclamationOutlined style={{ marginRight: '12px', color: '#faad14' }} />
            MOH Orders - No Forms Created
          </Title>
          <Text type="secondary" style={styles.headerSubtitle}>
            Orders that need pharmacy forms created
          </Text>
          <Button 
            onClick={handleRefresh} 
            loading={loading}
            style={{ marginLeft: '16px' }}
          >
            Refresh Data
          </Button>
        </div>

        {/* Alert Banner */}
        <Alert
          message="No Forms Created Filter Active"
          description="This dashboard shows only orders where pharmacyFormCreated is 'No' or null. These orders require attention to create pharmacy forms."
          type="warning"
          icon={<FileExclamationOutlined />}
          style={styles.noFormAlert}
          showIcon
          closable
        />

        {/* Date Filters and Actions */}
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
                justifyContent: 'flex-start',
                alignItems: 'center',
                width: 400,
                paddingLeft: '0px'
              }}
            >
              <Input
                placeholder="Search by tracking number or patient name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                allowClear
                prefix={<SearchOutlined />}
              />
            </div>
          </div>
        </Card>

        {/* Statistics Cards */}
        <Row gutter={[16, 16]} style={{ marginBottom: '32px' }}>
          <Col xs={24} sm={12} lg={8} xl={4}>
            <Card style={styles.statCard}>
              <Statistic 
                title="Total (No Forms)" 
                value={jobMethodStats.all} 
                prefix={<FileExclamationOutlined />} 
                valueStyle={{ color: '#faad14', fontSize: '28px', fontWeight: 'bold' }} 
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={8} xl={4}>
            <Card style={styles.statCard}>
              <Statistic 
                title="Standard (No Forms)" 
                value={jobMethodStats.Standard} 
                prefix={<ClockCircleOutlined />} 
                valueStyle={{ color: '#1890ff', fontSize: '28px', fontWeight: 'bold' }} 
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={8} xl={4}>
            <Card style={styles.statCard}>
              <Statistic 
                title="Express (No Forms)" 
                value={jobMethodStats.Express} 
                prefix={<RocketOutlined />} 
                valueStyle={{ color: '#fa8c16', fontSize: '28px', fontWeight: 'bold' }} 
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={8} xl={4}>
            <Card style={styles.statCard}>
              <Statistic 
                title="Immediate (No Forms)" 
                value={jobMethodStats.Immediate} 
                prefix={<ThunderboltOutlined />} 
                valueStyle={{ color: '#f5222d', fontSize: '28px', fontWeight: 'bold' }} 
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={8} xl={4}>
            <Card style={styles.statCard}>
              <Statistic 
                title="TTG (No Forms)" 
                value={jobMethodStats.TTG} 
                prefix={<MedicineBoxOutlined />} 
                valueStyle={{ color: '#722ed1', fontSize: '28px', fontWeight: 'bold' }} 
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={8} xl={4}>
            <Card style={styles.statCard}>
              <Statistic 
                title="KB (No Forms)" 
                value={jobMethodStats.KB} 
                prefix={<MedicineBoxOutlined />} 
                valueStyle={{ color: '#13c2c2', fontSize: '28px', fontWeight: 'bold' }} 
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
                  <FileExclamationOutlined />
                  All (No Forms)
                  <Tag color="orange" style={styles.tabBadge}>{jobMethodStats.all}</Tag>
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
          </Tabs>

          <Spin spinning={loading}>
            <Table
              columns={columns}
              dataSource={getFilteredOrdersByTab()}
              rowKey="_id"
              size="middle"
              scroll={{ x: 1500 }}
              rowSelection={rowSelection}
              pagination={{
                pageSize: pageSize,
                showSizeChanger: true,
                pageSizeOptions: ['15', '30', '50', '100'],
                onShowSizeChange: (current, size) => {
                  setPageSize(size);
                },
                showQuickJumper: true,
                showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} orders (no forms)`,
              }}
            />
          </Spin>
        </Card>

        {/* Preview Modal */}
        <PreviewModal
          visible={isPreviewVisible}
          data={previewData}
          onCancel={() => {
            setIsPreviewVisible(false);
            setSelectedRowKeys([]);
            setSelectedRows([]);
          }}
          onSave={handleSaveToDMS}
          onDownloadExcel={handleDownloadExcel}
          onPreviewPackingList={() => message.info('Packing list preview functionality')}
          loading={isSaving}
          startNumber={startNumber}
          setStartNumber={setStartNumber}
          setSelectedDate={setSelectedDate}
          setDateRange={setDateRange}
          setSelectedRowKeys={setSelectedRowKeys}
          setSelectedRows={setSelectedRows}
        />
      </div>
    </div>
  );
};

export default MohNoFormsDashboard;