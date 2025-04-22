'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  Button,
  Grid,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  AppBar,
  Toolbar,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  ShoppingCart as ProductsIcon,
  ShoppingBasket as OrdersIcon,
  Settings as SettingsIcon,
  ExitToApp as LogoutIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
} from '@mui/icons-material';
import { OrderStatus } from '@/types';

// Mock data types
interface Order {
  id: string;
  orderNumber: string;
  customer: string;
  product: string;
  quantity: number;
  price: number;
  unit: string;
  currency: string;
  status: OrderStatus;
  estimatedDeliveryDate: string;
  createdAt: string;
}

interface OrderFilter {
  search: string;
  status: string;
  sortBy: string;
  sortOrder: string;
}

// Translations
const translations = {
  ru: {
    title: 'Заказы',
    search: 'Поиск заказа',
    orderNumber: '№ Заказа',
    customer: 'Заказчик',
    product: 'Продукт',
    quantity: 'Количество',
    price: 'Сумма',
    status: 'Статус',
    date: 'Дата заказа',
    delivery: 'Доставка до',
    actions: 'Действия',
    viewDetails: 'Детали',
    updateStatus: 'Обновить статус',
    noOrders: 'Заказы не найдены',
    filters: 'Фильтры',
    apply: 'Применить',
    reset: 'Сбросить',
    sortBy: 'Сортировать по',
    sortOrder: 'Порядок',
    rowsPerPage: 'Строк на странице',
    of: 'из',
    next: 'Далее',
    previous: 'Назад',
    dashboard: 'Панель управления',
    products: 'Продукты',
    orders: 'Заказы',
    settings: 'Настройки',
    logout: 'Выход',
    menu: 'Меню',
    sortOptions: {
      orderNumber: '№ Заказа',
      date: 'Дате',
      price: 'Сумме',
      status: 'Статусу',
    },
    sortOrderOptions: {
      asc: 'По возрастанию',
      desc: 'По убыванию',
    },
    statusOptions: {
      all: 'Все статусы',
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
    statusLabels: {
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
  },
  az: {
    title: 'Sifarişlər',
    search: 'Sifariş axtar',
    orderNumber: 'Sifariş №',
    customer: 'Müştəri',
    product: 'Məhsul',
    quantity: 'Miqdar',
    price: 'Məbləğ',
    status: 'Status',
    date: 'Sifariş tarixi',
    delivery: 'Çatdırılma tarixi',
    actions: 'Əməliyyatlar',
    viewDetails: 'Detallar',
    updateStatus: 'Statusu yeniləyin',
    noOrders: 'Sifariş tapılmadı',
    filters: 'Filtrlər',
    apply: 'Tətbiq et',
    reset: 'Sıfırla',
    sortBy: 'Sırala',
    sortOrder: 'Sıralama qaydası',
    rowsPerPage: 'Səhifədəki sətirlər',
    of: '/',
    next: 'Növbəti',
    previous: 'Əvvəlki',
    dashboard: 'İdarəetmə paneli',
    products: 'Məhsullar',
    orders: 'Sifarişlər',
    settings: 'Parametrlər',
    logout: 'Çıxış',
    menu: 'Menyu',
    sortOptions: {
      orderNumber: 'Sifariş №',
      date: 'Tarix',
      price: 'Məbləğ',
      status: 'Status',
    },
    sortOrderOptions: {
      asc: 'Artan',
      desc: 'Azalan',
    },
    statusOptions: {
      all: 'Bütün statuslar',
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
    statusLabels: {
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
  },
};

export default function OrdersPage() {
  const router = useRouter();
  const [language, setLanguage] = useState<'ru' | 'az'>('ru');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalOrders, setTotalOrders] = useState(0);
  const [filters, setFilters] = useState<OrderFilter>({
    search: '',
    status: '',
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });
  const [showFilters, setShowFilters] = useState(false);
  const [error, setError] = useState('');

  const t = translations[language];

  // Generate mock data for demo
  const generateMockOrders = () => {
    const statuses: OrderStatus[] = [
      'pre_order',
      'new',
      'confirmed',
      'in_progress',
      'shipped',
      'delivered',
      'completed',
      'cancelled',
      'error',
    ];

    const mockOrders: Order[] = [];
    for (let i = 1; i <= 100; i++) {
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const quantity = Math.floor(Math.random() * 100) + 1;
      const price = Math.round(Math.random() * 1000 * 100) / 100;
      
      mockOrders.push({
        id: `order-${i}`,
        orderNumber: `ORD-2310-${i.toString().padStart(6, '0')}`,
        customer: `Покупатель ${i}`,
        product: `Продукт ${i % 20 + 1}`,
        quantity,
        price,
        unit: i % 2 === 0 ? 'kg' : 'box',
        currency: i % 3 === 0 ? 'USD' : 'AZN',
        status,
        estimatedDeliveryDate: new Date(Date.now() + (Math.random() * 30 * 24 * 60 * 60 * 1000)).toISOString(),
        createdAt: new Date(Date.now() - (Math.random() * 90 * 24 * 60 * 60 * 1000)).toISOString(),
      });
    }
    return mockOrders;
  };

  const fetchOrders = async () => {
    setLoading(true);
    setError('');
    
    try {
      // For demo purposes, we're using mock data
      // In a real app, this would be an API call like:
      // const response = await axios.get('/api/supplier/orders', {
      //   params: {
      //     page: page + 1,
      //     limit: rowsPerPage,
      //     search: filters.search,
      //     status: filters.status,
      //     sort: `${filters.sortBy},${filters.sortOrder}`,
      //   },
      // });
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const allMockOrders = generateMockOrders();
      
      // Filter based on search
      let filteredOrders = allMockOrders;
      if (filters.search) {
        filteredOrders = filteredOrders.filter(order => 
          order.orderNumber.toLowerCase().includes(filters.search.toLowerCase()) ||
          order.customer.toLowerCase().includes(filters.search.toLowerCase()) ||
          order.product.toLowerCase().includes(filters.search.toLowerCase())
        );
      }
      
      // Filter by status
      if (filters.status) {
        filteredOrders = filteredOrders.filter(order => 
          order.status === filters.status
        );
      }
      
      // Sort
      filteredOrders.sort((a, b) => {
        let comparison = 0;
        
        switch (filters.sortBy) {
          case 'orderNumber':
            comparison = a.orderNumber.localeCompare(b.orderNumber);
            break;
          case 'date':
            comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
            break;
          case 'price':
            comparison = a.price - b.price;
            break;
          case 'status':
            comparison = a.status.localeCompare(b.status);
            break;
          default:
            comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        }
        
        return filters.sortOrder === 'asc' ? comparison : -comparison;
      });
      
      // Paginate
      const start = page * rowsPerPage;
      const paginatedOrders = filteredOrders.slice(start, start + rowsPerPage);
      
      setOrders(paginatedOrders);
      setTotalOrders(filteredOrders.length);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch orders');
      setLoading(false);
      console.error('Error fetching orders:', err);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [page, rowsPerPage]);

  const handlePageChange = (_: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleFilterChange = (name: keyof OrderFilter) => (
    event: React.ChangeEvent<HTMLInputElement | { value: unknown }>
  ) => {
    setFilters({
      ...filters,
      [name]: event.target.value,
    });
  };

  const handleSortChange = (column: string) => {
    if (filters.sortBy === column) {
      setFilters({
        ...filters,
        sortOrder: filters.sortOrder === 'asc' ? 'desc' : 'asc',
      });
    } else {
      setFilters({
        ...filters,
        sortBy: column,
        sortOrder: 'asc',
      });
    }
    setPage(0);
  };

  const handleLogout = async () => {
    try {
      await axios.post('/api/auth/logout');
      router.push('/auth/login');
    } catch (err) {
      console.error('Logout error:', err);
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

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat(language === 'ru' ? 'ru-RU' : 'az-Latn-AZ', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(new Date(dateString));
  };

  const handleViewDetails = (orderId: string) => {
    router.push(`/supplier/orders/${orderId}`);
  };

  const toggleDrawer = (open: boolean) => () => {
    setDrawerOpen(open);
  };

  const list = () => (
    <Box
      sx={{ width: 250 }}
      role="presentation"
      onClick={toggleDrawer(false)}
      onKeyDown={toggleDrawer(false)}
    >
      <List>
        <ListItem button onClick={() => router.push('/supplier/dashboard')}>
          <ListItemIcon>
            <DashboardIcon />
          </ListItemIcon>
          <ListItemText primary={t.dashboard} />
        </ListItem>
        <ListItem button onClick={() => router.push('/supplier/products')}>
          <ListItemIcon>
            <ProductsIcon />
          </ListItemIcon>
          <ListItemText primary={t.products} />
        </ListItem>
        <ListItem button selected onClick={() => router.push('/supplier/orders')}>
          <ListItemIcon>
            <OrdersIcon />
          </ListItemIcon>
          <ListItemText primary={t.orders} />
        </ListItem>
      </List>
      <Divider />
      <List>
        <ListItem button onClick={() => router.push('/supplier/settings')}>
          <ListItemIcon>
            <SettingsIcon />
          </ListItemIcon>
          <ListItemText primary={t.settings} />
        </ListItem>
        <ListItem button onClick={handleLogout}>
          <ListItemIcon>
            <LogoutIcon />
          </ListItemIcon>
          <ListItemText primary={t.logout} />
        </ListItem>
      </List>
    </Box>
  );

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
            onClick={toggleDrawer(true)}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            {t.title}
          </Typography>
          <Button color="inherit" onClick={() => setLanguage(language === 'ru' ? 'az' : 'ru')}>
            {language === 'ru' ? 'AZ' : 'RU'}
          </Button>
        </Toolbar>
      </AppBar>
      
      <Drawer anchor="left" open={drawerOpen} onClose={toggleDrawer(false)}>
        {list()}
      </Drawer>
      
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Paper sx={{ width: '100%', mb: 2, p: 2 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={8}>
              <Typography variant="h5" component="h1" gutterBottom>
                {t.title}
              </Typography>
            </Grid>
            
            <Grid item xs={12} md={4} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                variant="outlined"
                startIcon={<FilterIcon />}
                onClick={() => setShowFilters(!showFilters)}
                sx={{ mr: 1 }}
              >
                {t.filters}
              </Button>
              
              <TextField
                size="small"
                placeholder={t.search}
                value={filters.search}
                onChange={handleFilterChange('search')}
                InputProps={{
                  endAdornment: (
                    <IconButton 
                      size="small" 
                      onClick={() => fetchOrders()}
                    >
                      <SearchIcon />
                    </IconButton>
                  ),
                }}
              />
            </Grid>
            
            {showFilters && (
              <Grid item xs={12}>
                <Box sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={3}>
                      <FormControl fullWidth>
                        <InputLabel>{t.status}</InputLabel>
                        <Select
                          value={filters.status}
                          onChange={handleFilterChange('status') as any}
                          label={t.status}
                        >
                          <MenuItem value="">{t.statusOptions.all}</MenuItem>
                          {Object.keys(t.statusOptions).filter(k => k !== 'all').map(status => (
                            <MenuItem key={status} value={status}>
                              {t.statusOptions[status as keyof typeof t.statusOptions]}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    
                    <Grid item xs={12} md={3}>
                      <FormControl fullWidth>
                        <InputLabel>{t.sortBy}</InputLabel>
                        <Select
                          value={filters.sortBy}
                          onChange={handleFilterChange('sortBy') as any}
                          label={t.sortBy}
                        >
                          <MenuItem value="orderNumber">{t.sortOptions.orderNumber}</MenuItem>
                          <MenuItem value="date">{t.sortOptions.date}</MenuItem>
                          <MenuItem value="price">{t.sortOptions.price}</MenuItem>
                          <MenuItem value="status">{t.sortOptions.status}</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    
                    <Grid item xs={12} md={3}>
                      <FormControl fullWidth>
                        <InputLabel>{t.sortOrder}</InputLabel>
                        <Select
                          value={filters.sortOrder}
                          onChange={handleFilterChange('sortOrder') as any}
                          label={t.sortOrder}
                        >
                          <MenuItem value="asc">{t.sortOrderOptions.asc}</MenuItem>
                          <MenuItem value="desc">{t.sortOrderOptions.desc}</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    
                    <Grid item xs={12} md={3} sx={{ display: 'flex', alignItems: 'center' }}>
                      <Button
                        variant="contained"
                        onClick={() => fetchOrders()}
                        sx={{ mr: 1 }}
                      >
                        {t.apply}
                      </Button>
                      
                      <Button
                        variant="outlined"
                        onClick={() => {
                          setFilters({
                            search: '',
                            status: '',
                            sortBy: 'date',
                            sortOrder: 'desc',
                          });
                          setPage(0);
                        }}
                      >
                        {t.reset}
                      </Button>
                    </Grid>
                  </Grid>
                </Box>
              </Grid>
            )}
          </Grid>
        </Paper>
        
        <Paper sx={{ width: '100%', mb: 2 }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>{t.orderNumber}</TableCell>
                  <TableCell>{t.customer}</TableCell>
                  <TableCell>{t.product}</TableCell>
                  <TableCell>{t.quantity}</TableCell>
                  <TableCell>{t.price}</TableCell>
                  <TableCell>{t.status}</TableCell>
                  <TableCell>{t.date}</TableCell>
                  <TableCell>{t.delivery}</TableCell>
                  <TableCell>{t.actions}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={9} align="center" sx={{ py: 3 }}>
                      <CircularProgress />
                    </TableCell>
                  </TableRow>
                ) : orders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} align="center" sx={{ py: 3 }}>
                      <Typography variant="body1">{t.noOrders}</Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  orders.map((order) => (
                    <TableRow key={order.id} hover>
                      <TableCell>{order.orderNumber}</TableCell>
                      <TableCell>{order.customer}</TableCell>
                      <TableCell>{order.product}</TableCell>
                      <TableCell>
                        {order.quantity} {order.unit}
                      </TableCell>
                      <TableCell>{formatPrice(order.price, order.currency)}</TableCell>
                      <TableCell>
                        <Chip
                          label={t.statusLabels[order.status]}
                          color={getStatusColor(order.status) as any}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{formatDate(order.createdAt)}</TableCell>
                      <TableCell>{formatDate(order.estimatedDeliveryDate)}</TableCell>
                      <TableCell>
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => handleViewDetails(order.id)}
                          sx={{ mr: 1 }}
                        >
                          {t.viewDetails}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
          
          <TablePagination
            rowsPerPageOptions={[5, 10, 25, 50]}
            component="div"
            count={totalOrders}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handlePageChange}
            onRowsPerPageChange={handleRowsPerPageChange}
            labelRowsPerPage={t.rowsPerPage}
            labelDisplayedRows={({ from, to, count }) => 
              `${from}-${to} ${t.of} ${count}`
            }
            nextIconButtonText={t.next}
            backIconButtonText={t.previous}
          />
        </Paper>
      </Box>
    </Box>
  );
} 