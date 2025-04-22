'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import axios from 'axios';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Chip,
  Button,
  Divider,
  CircularProgress,
  Card,
  CardContent,
  CardHeader,
  List,
  ListItem,
  ListItemText,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  AppBar,
  Toolbar,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Event as EventIcon,
  LocalShipping as ShippingIcon,
  Payment as PaymentIcon,
  Assignment as AssignmentIcon,
  Menu as MenuIcon,
  Edit as EditIcon,
} from '@mui/icons-material';
import { Order, OrderStatus, OrderItem, DeliveryDetails, PaymentDetails } from '@/types';

// Translations
const translations = {
  ru: {
    title: 'Детали заказа',
    back: 'Назад',
    orderDetails: 'Информация о заказе',
    orderNumber: '№ Заказа',
    orderDate: 'Дата заказа',
    status: 'Статус',
    customer: 'Заказчик',
    total: 'Итого',
    updateStatus: 'Обновить статус',
    deliveryDetails: 'Информация о доставке',
    address: 'Адрес',
    contactPerson: 'Контактное лицо',
    contactPhone: 'Контактный телефон',
    estimatedDelivery: 'Планируемая дата доставки',
    actualDelivery: 'Фактическая дата доставки',
    trackingNumber: 'Номер отслеживания',
    shippingMethod: 'Способ доставки',
    paymentDetails: 'Информация об оплате',
    paymentMethod: 'Способ оплаты',
    paymentStatus: 'Статус оплаты',
    transactionId: 'ID транзакции',
    paidAt: 'Дата оплаты',
    dueDate: 'Срок оплаты',
    products: 'Товары',
    product: 'Товар',
    quantity: 'Количество',
    price: 'Цена',
    subtotal: 'Подытог',
    actions: 'Действия',
    statusUpdateTitle: 'Обновить статус заказа',
    statusUpdateDesc: 'Выберите новый статус для заказа',
    cancel: 'Отмена',
    save: 'Сохранить',
    note: 'Примечание',
    statusOptions: {
      pre_order: 'Предзаказ',
      new: 'Новый',
      confirmed: 'Подтвержден',
      in_progress: 'В обработке',
      shipped: 'Отправлен',
      delivered: 'Доставлен',
      completed: 'Завершен',
      cancelled: 'Отменен',
      error: 'Ошибка',
    },
    paymentStatusOptions: {
      pending: 'Ожидает оплаты',
      paid: 'Оплачен',
      failed: 'Ошибка оплаты',
    },
    notFound: 'Заказ не найден',
    loading: 'Загрузка...',
    error: 'Ошибка при загрузке данных',
  },
  az: {
    title: 'Sifariş təfərrüatları',
    back: 'Geri',
    orderDetails: 'Sifariş məlumatı',
    orderNumber: 'Sifariş №',
    orderDate: 'Sifariş tarixi',
    status: 'Status',
    customer: 'Müştəri',
    total: 'Cəmi',
    updateStatus: 'Statusu yeniləyin',
    deliveryDetails: 'Çatdırılma məlumatı',
    address: 'Ünvan',
    contactPerson: 'Əlaqə şəxsi',
    contactPhone: 'Əlaqə telefonu',
    estimatedDelivery: 'Təxmini çatdırılma tarixi',
    actualDelivery: 'Faktiki çatdırılma tarixi',
    trackingNumber: 'İzləmə nömrəsi',
    shippingMethod: 'Çatdırılma üsulu',
    paymentDetails: 'Ödəniş məlumatı',
    paymentMethod: 'Ödəniş üsulu',
    paymentStatus: 'Ödəniş statusu',
    transactionId: 'Əməliyyat ID',
    paidAt: 'Ödəniş tarixi',
    dueDate: 'Son ödəniş tarixi',
    products: 'Məhsullar',
    product: 'Məhsul',
    quantity: 'Miqdar',
    price: 'Qiymət',
    subtotal: 'Aralıq cəm',
    actions: 'Əməliyyatlar',
    statusUpdateTitle: 'Sifariş statusunu yeniləyin',
    statusUpdateDesc: 'Sifariş üçün yeni status seçin',
    cancel: 'Ləğv et',
    save: 'Saxla',
    note: 'Qeyd',
    statusOptions: {
      pre_order: 'İlkin sifariş',
      new: 'Yeni',
      confirmed: 'Təsdiqlənib',
      in_progress: 'İşlənir',
      shipped: 'Göndərilib',
      delivered: 'Çatdırılıb',
      completed: 'Tamamlanıb',
      cancelled: 'Ləğv edilib',
      error: 'Xəta',
    },
    paymentStatusOptions: {
      pending: 'Gözləyir',
      paid: 'Ödənilib',
      failed: 'Ödəniş xətası',
    },
    notFound: 'Sifariş tapılmadı',
    loading: 'Yüklənir...',
    error: 'Məlumatların yüklənməsində xəta',
  },
};

export default function OrderDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const orderId = params.id as string;
  
  const [language, setLanguage] = useState<'ru' | 'az'>('ru');
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState<OrderStatus | ''>('');
  const [statusNote, setStatusNote] = useState('');
  const [updateLoading, setUpdateLoading] = useState(false);
  
  const t = translations[language];
  
  // Generate mock order data for demo
  const generateMockOrder = () => {
    const mockOrder: Order = {
      id: orderId,
      orderNumber: `ORD-2310-${orderId.slice(-6)}`,
      supplier: 'Поставщик ABC',
      customer: 'Покупатель XYZ',
      items: [
        {
          product: 'product-1',
          productName: 'Яблоки Red Delicious',
          quantity: 100,
          price: 2.5,
          unit: 'kg',
          subtotal: 250,
        },
        {
          product: 'product-2',
          productName: 'Груши Conference',
          quantity: 50,
          price: 3.2,
          unit: 'kg',
          subtotal: 160,
        },
      ],
      totalAmount: 410,
      currency: 'AZN',
      status: 'confirmed',
      deliveryDetails: {
        address: 'ул. Примерная, д. 123',
        city: 'Баку',
        country: 'Азербайджан',
        postalCode: '123456',
        contactPerson: 'Иван Иванов',
        contactPhone: '+994 50 123 4567',
        estimatedDeliveryDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
        shippingMethod: 'Грузовой транспорт',
      },
      paymentDetails: {
        method: 'bank_transfer',
        status: 'pending',
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      },
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    };
    
    return mockOrder;
  };
  
  const fetchOrder = async () => {
    setLoading(true);
    setError('');
    
    try {
      // For demo purposes, we're using mock data
      // In a real app, this would be an API call like:
      // const response = await axios.get(`/api/supplier/orders/${orderId}`);
      // setOrder(response.data.data.order);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const mockOrder = generateMockOrder();
      setOrder(mockOrder);
      setNewStatus(mockOrder.status);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch order details');
      setLoading(false);
      console.error('Error fetching order details:', err);
    }
  };
  
  useEffect(() => {
    fetchOrder();
  }, [orderId]);
  
  const handleStatusUpdate = async () => {
    if (!newStatus) return;
    
    setUpdateLoading(true);
    
    try {
      // For demo purposes, we're simulating an API call
      // In a real app, this would be:
      // await axios.patch(`/api/supplier/orders/${orderId}/status`, {
      //   status: newStatus,
      //   notes: statusNote,
      // });
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Update local state
      if (order) {
        setOrder({
          ...order,
          status: newStatus,
          updatedAt: new Date().toISOString(),
        });
      }
      
      setDialogOpen(false);
      setUpdateLoading(false);
    } catch (err) {
      console.error('Error updating order status:', err);
      setUpdateLoading(false);
    }
  };
  
  const handleOpenDialog = () => {
    if (order) {
      setNewStatus(order.status);
      setStatusNote('');
      setDialogOpen(true);
    }
  };
  
  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'confirmed':
      case 'in_progress':
      case 'shipped':
        return 'info';
      case 'new':
      case 'pre_order':
        return 'primary';
      case 'delivered':
        return 'secondary';
      case 'cancelled':
        return 'error';
      case 'error':
        return 'warning';
      default:
        return 'default';
    }
  };
  
  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat(language === 'ru' ? 'ru-RU' : 'az-Latn-AZ', {
      style: 'currency',
      currency,
      maximumFractionDigits: 2,
    }).format(price);
  };
  
  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return '-';
    
    return new Intl.DateTimeFormat(language === 'ru' ? 'ru-RU' : 'az-Latn-AZ', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(dateString));
  };
  
  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
        }}
      >
        <CircularProgress />
        <Typography variant="h6" sx={{ ml: 2 }}>
          {t.loading}
        </Typography>
      </Box>
    );
  }
  
  if (error || !order) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
        }}
      >
        <Typography variant="h6" color="error" gutterBottom>
          {error || t.notFound}
        </Typography>
        <Button
          variant="contained"
          startIcon={<ArrowBackIcon />}
          onClick={() => router.push('/supplier/orders')}
        >
          {t.back}
        </Button>
      </Box>
    );
  }
  
  const { allowedStatuses, canUpdateStatus } = getAvailableStatusUpdates(order.status);
  
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="static">
        <Toolbar>
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="menu"
            sx={{ mr: 2 }}
            onClick={() => router.push('/supplier/orders')}
          >
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            {t.title} - {order.orderNumber}
          </Typography>
          <Button color="inherit" onClick={() => setLanguage(language === 'ru' ? 'az' : 'ru')}>
            {language === 'ru' ? 'AZ' : 'RU'}
          </Button>
        </Toolbar>
      </AppBar>
      
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Paper sx={{ p: 3, mb: 3 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="h5" gutterBottom>
                {order.orderNumber}
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>{t.orderDate}:</strong> {formatDate(order.createdAt)}
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>{t.customer}:</strong> {order.customer}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                <Typography variant="body1" sx={{ mr: 2 }}>
                  <strong>{t.status}:</strong>
                </Typography>
                <Chip
                  label={t.statusOptions[order.status]}
                  color={getStatusColor(order.status) as any}
                />
              </Box>
            </Grid>
            
            <Grid item xs={12} md={6} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
              <Typography variant="h6" gutterBottom>
                {t.total}: {formatPrice(order.totalAmount, order.currency)}
              </Typography>
              {canUpdateStatus && (
                <Button
                  variant="contained"
                  onClick={handleOpenDialog}
                  startIcon={<EditIcon />}
                  sx={{ mt: 2 }}
                >
                  {t.updateStatus}
                </Button>
              )}
            </Grid>
          </Grid>
        </Paper>
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardHeader
                title={t.deliveryDetails}
                avatar={<ShippingIcon color="primary" />}
              />
              <CardContent>
                <List dense>
                  <ListItem>
                    <ListItemText
                      primary={t.address}
                      secondary={`${order.deliveryDetails.address}, ${order.deliveryDetails.city}, ${order.deliveryDetails.country} ${order.deliveryDetails.postalCode || ''}`}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary={t.contactPerson}
                      secondary={order.deliveryDetails.contactPerson}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary={t.contactPhone}
                      secondary={order.deliveryDetails.contactPhone}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary={t.estimatedDelivery}
                      secondary={formatDate(order.deliveryDetails.estimatedDeliveryDate)}
                    />
                  </ListItem>
                  {order.deliveryDetails.actualDeliveryDate && (
                    <ListItem>
                      <ListItemText
                        primary={t.actualDelivery}
                        secondary={formatDate(order.deliveryDetails.actualDeliveryDate)}
                      />
                    </ListItem>
                  )}
                  {order.deliveryDetails.trackingNumber && (
                    <ListItem>
                      <ListItemText
                        primary={t.trackingNumber}
                        secondary={order.deliveryDetails.trackingNumber}
                      />
                    </ListItem>
                  )}
                  <ListItem>
                    <ListItemText
                      primary={t.shippingMethod}
                      secondary={order.deliveryDetails.shippingMethod}
                    />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Card>
              <CardHeader
                title={t.paymentDetails}
                avatar={<PaymentIcon color="primary" />}
              />
              <CardContent>
                <List dense>
                  <ListItem>
                    <ListItemText
                      primary={t.paymentMethod}
                      secondary={order.paymentDetails.method}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary={t.paymentStatus}
                      secondary={t.paymentStatusOptions[order.paymentDetails.status as keyof typeof t.paymentStatusOptions]}
                    />
                  </ListItem>
                  {order.paymentDetails.transactionId && (
                    <ListItem>
                      <ListItemText
                        primary={t.transactionId}
                        secondary={order.paymentDetails.transactionId}
                      />
                    </ListItem>
                  )}
                  {order.paymentDetails.paidAt && (
                    <ListItem>
                      <ListItemText
                        primary={t.paidAt}
                        secondary={formatDate(order.paymentDetails.paidAt)}
                      />
                    </ListItem>
                  )}
                  <ListItem>
                    <ListItemText
                      primary={t.dueDate}
                      secondary={formatDate(order.paymentDetails.dueDate)}
                    />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12}>
            <Card>
              <CardHeader
                title={t.products}
                avatar={<AssignmentIcon color="primary" />}
              />
              <CardContent>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>{t.product}</TableCell>
                        <TableCell align="right">{t.quantity}</TableCell>
                        <TableCell align="right">{t.price}</TableCell>
                        <TableCell align="right">{t.subtotal}</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {order.items.map((item) => (
                        <TableRow key={item.product}>
                          <TableCell>{item.productName}</TableCell>
                          <TableCell align="right">
                            {item.quantity} {item.unit}
                          </TableCell>
                          <TableCell align="right">
                            {formatPrice(item.price, order.currency)}
                          </TableCell>
                          <TableCell align="right">
                            {formatPrice(item.subtotal, order.currency)}
                          </TableCell>
                        </TableRow>
                      ))}
                      <TableRow>
                        <TableCell colSpan={3} align="right" sx={{ fontWeight: 'bold' }}>
                          {t.total}:
                        </TableCell>
                        <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                          {formatPrice(order.totalAmount, order.currency)}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
      
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
        <DialogTitle>{t.statusUpdateTitle}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {t.statusUpdateDesc}
          </DialogContentText>
          <FormControl fullWidth margin="normal">
            <InputLabel>{t.status}</InputLabel>
            <Select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value as OrderStatus)}
              label={t.status}
            >
              {allowedStatuses.map((status) => (
                <MenuItem key={status} value={status}>
                  {t.statusOptions[status]}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            fullWidth
            margin="normal"
            label={t.note}
            value={statusNote}
            onChange={(e) => setStatusNote(e.target.value)}
            multiline
            rows={3}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)} color="primary">
            {t.cancel}
          </Button>
          <Button
            onClick={handleStatusUpdate}
            color="primary"
            variant="contained"
            disabled={!newStatus || updateLoading || newStatus === order.status}
          >
            {updateLoading ? <CircularProgress size={24} /> : t.save}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

// Helper function to determine which status updates are allowed based on current status
function getAvailableStatusUpdates(currentStatus: OrderStatus) {
  const allowedTransitions: Record<OrderStatus, OrderStatus[]> = {
    pre_order: ['new', 'confirmed', 'cancelled', 'error'],
    new: ['confirmed', 'cancelled', 'error'],
    confirmed: ['in_progress', 'cancelled', 'error'],
    in_progress: ['shipped', 'error'],
    shipped: ['delivered', 'error'],
    delivered: ['completed', 'error'],
    completed: [],
    cancelled: [],
    error: ['new', 'confirmed', 'in_progress'],
  };
  
  // For some statuses, suppliers can't update (e.g., completed or cancelled orders)
  const supplierCanUpdate = [
    'new', 
    'confirmed', 
    'in_progress', 
    'shipped', 
    'error'
  ].includes(currentStatus);
  
  return {
    allowedStatuses: allowedTransitions[currentStatus],
    canUpdateStatus: supplierCanUpdate && allowedTransitions[currentStatus].length > 0
  };
}