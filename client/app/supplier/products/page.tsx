'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Alert,
  Tooltip,
  Divider,
  CircularProgress,
  AppBar,
  Toolbar,
} from '@mui/material';
import {
  Search,
  FilterList,
  Add,
  Edit,
  Delete,
  Refresh,
  Language,
  Logout,
  Person,
} from '@mui/icons-material';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import axios from 'axios';

// Типизация для товара
interface Product {
  id: string;
  name: string;
  code: string;
  category: string;
  price: number;
  currency: 'RUB' | 'USD' | 'AZN';
  quantity: number;
  status: 'active' | 'pending' | 'rejected';
  dateAdded: string;
}

// Типизация для фильтра
interface ProductFilter {
  search: string;
  category: string;
  status: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

export default function ProductsPage() {
  const router = useRouter();
  const [language, setLanguage] = useState('ru');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalRows, setTotalRows] = useState(0);
  const [filters, setFilters] = useState<ProductFilter>({
    search: '',
    category: '',
    status: '',
    sortBy: 'dateAdded',
    sortOrder: 'desc',
  });
  const [showFilters, setShowFilters] = useState(false);
  const [currencyRates, setCurrencyRates] = useState({
    USD: 95.5,
    EUR: 105.2,
    AZN: 56.3,
  });

  // Получение данных о товарах
  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // В реальном приложении здесь будет API запрос
      // const response = await axios.get('/api/supplier/products', {
      //   params: {
      //     page: page + 1,
      //     limit: rowsPerPage,
      //     ...filters,
      //   }
      // });
      
      // Моковые данные для демонстрации
      const mockData = Array(30)
        .fill(null)
        .map((_, index) => ({
          id: `PRD-${1000 + index}`,
          name: `Товар ${index + 1}`,
          code: `CODE-${100 + index}`,
          category: ['Фрукты', 'Овощи', 'Мясо', 'Молочные продукты'][index % 4],
          price: Math.floor(Math.random() * 10000) / 100,
          currency: ['RUB', 'USD', 'AZN'][index % 3] as 'RUB' | 'USD' | 'AZN',
          quantity: Math.floor(Math.random() * 1000),
          status: ['active', 'pending', 'rejected'][index % 3] as 'active' | 'pending' | 'rejected',
          dateAdded: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000).toISOString(),
        }));
      
      // Фильтрация моковых данных
      let filteredData = [...mockData];
      
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        filteredData = filteredData.filter(
          (product) =>
            product.name.toLowerCase().includes(searchLower) ||
            product.code.toLowerCase().includes(searchLower)
        );
      }
      
      if (filters.category) {
        filteredData = filteredData.filter(
          (product) => product.category === filters.category
        );
      }
      
      if (filters.status) {
        filteredData = filteredData.filter(
          (product) => product.status === filters.status
        );
      }
      
      // Сортировка
      filteredData.sort((a, b) => {
        const aValue = a[filters.sortBy as keyof Product];
        const bValue = b[filters.sortBy as keyof Product];
        
        if (typeof aValue === 'string' && typeof bValue === 'string') {
          return filters.sortOrder === 'asc'
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue);
        }
        
        if (typeof aValue === 'number' && typeof bValue === 'number') {
          return filters.sortOrder === 'asc'
            ? aValue - bValue
            : bValue - aValue;
        }
        
        return 0;
      });
      
      // Пагинация
      const paginatedData = filteredData.slice(
        page * rowsPerPage,
        (page + 1) * rowsPerPage
      );
      
      setProducts(paginatedData);
      setTotalRows(filteredData.length);
      setTimeout(() => setLoading(false), 500); // Имитация задержки загрузки
    } catch (err: any) {
      setError(err.response?.data?.message || t.errors.loadingProducts);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [page, rowsPerPage, filters]);

  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFilters({
      ...filters,
      search: event.target.value,
    });
    setPage(0);
  };

  const handleFilterChange = (name: keyof ProductFilter) => (
    event: React.ChangeEvent<{ value: unknown }>
  ) => {
    setFilters({
      ...filters,
      [name]: event.target.value,
    });
    setPage(0);
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'pending':
        return 'warning';
      case 'rejected':
        return 'error';
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

  // Переводы
  const translations = {
    ru: {
      pageTitle: 'Товары',
      addProduct: 'Добавить товар',
      search: 'Поиск по названию или коду',
      filters: 'Фильтры',
      showFilters: 'Показать фильтры',
      hideFilters: 'Скрыть фильтры',
      refresh: 'Обновить',
      category: 'Категория',
      status: 'Статус',
      sortBy: 'Сортировать по',
      apply: 'Применить',
      reset: 'Сбросить',
      profile: 'Профиль',
      logout: 'Выйти',
      currencyRates: 'Курсы валют',
      columns: {
        code: 'Код',
        name: 'Наименование',
        category: 'Категория',
        price: 'Цена',
        quantity: 'Количество',
        status: 'Статус',
        dateAdded: 'Дата добавления',
        actions: 'Действия',
      },
      status: {
        active: 'Активный',
        pending: 'На проверке',
        rejected: 'Отклонен',
      },
      categories: {
        all: 'Все категории',
        fruits: 'Фрукты',
        vegetables: 'Овощи',
        meat: 'Мясо',
        dairy: 'Молочные продукты',
      },
      statusFilter: {
        all: 'Все статусы',
        active: 'Активные',
        pending: 'На проверке',
        rejected: 'Отклоненные',
      },
      sortOptions: {
        name: 'Наименованию',
        price: 'Цене',
        quantity: 'Количеству',
        dateAdded: 'Дате добавления',
      },
      noProducts: 'Товары не найдены',
      rowsPerPage: 'Строк на странице:',
      errors: {
        loadingProducts: 'Ошибка при загрузке товаров. Пожалуйста, попробуйте позже.',
      },
      actions: {
        edit: 'Редактировать',
        delete: 'Удалить',
        createOffer: 'Создать оффер',
      },
    },
    az: {
      pageTitle: 'Məhsullar',
      addProduct: 'Məhsul əlavə et',
      search: 'Ad və ya kod ilə axtar',
      filters: 'Filtrlər',
      showFilters: 'Filtrləri göstər',
      hideFilters: 'Filtrləri gizlət',
      refresh: 'Yeniləmək',
      category: 'Kateqoriya',
      status: 'Status',
      sortBy: 'Sıralama',
      apply: 'Tətbiq et',
      reset: 'Sıfırla',
      profile: 'Profil',
      logout: 'Çıxış',
      currencyRates: 'Məzənnələr',
      columns: {
        code: 'Kod',
        name: 'Ad',
        category: 'Kateqoriya',
        price: 'Qiymət',
        quantity: 'Miqdar',
        status: 'Status',
        dateAdded: 'Əlavə edilmə tarixi',
        actions: 'Əməliyyatlar',
      },
      status: {
        active: 'Aktiv',
        pending: 'Yoxlamada',
        rejected: 'Rədd edilmiş',
      },
      categories: {
        all: 'Bütün kateqoriyalar',
        fruits: 'Meyvələr',
        vegetables: 'Tərəvəzlər',
        meat: 'Ət',
        dairy: 'Süd məhsulları',
      },
      statusFilter: {
        all: 'Bütün statuslar',
        active: 'Aktiv',
        pending: 'Yoxlamada',
        rejected: 'Rədd edilmiş',
      },
      sortOptions: {
        name: 'Ada görə',
        price: 'Qiymətə görə',
        quantity: 'Miqdara görə',
        dateAdded: 'Tarixə görə',
      },
      noProducts: 'Məhsul tapılmadı',
      rowsPerPage: 'Səhifədə sətir sayı:',
      errors: {
        loadingProducts: 'Məhsulların yüklənməsi zamanı xəta baş verdi. Xahiş edirik, sonra yenidən cəhd edin.',
      },
      actions: {
        edit: 'Redaktə et',
        delete: 'Sil',
        createOffer: 'Təklif yarat',
      },
    },
    en: {
      pageTitle: 'Products',
      addProduct: 'Add product',
      search: 'Search by name or code',
      filters: 'Filters',
      showFilters: 'Show filters',
      hideFilters: 'Hide filters',
      refresh: 'Refresh',
      category: 'Category',
      status: 'Status',
      sortBy: 'Sort by',
      apply: 'Apply',
      reset: 'Reset',
      profile: 'Profile',
      logout: 'Logout',
      currencyRates: 'Currency rates',
      columns: {
        code: 'Code',
        name: 'Name',
        category: 'Category',
        price: 'Price',
        quantity: 'Quantity',
        status: 'Status',
        dateAdded: 'Date added',
        actions: 'Actions',
      },
      status: {
        active: 'Active',
        pending: 'Pending',
        rejected: 'Rejected',
      },
      categories: {
        all: 'All categories',
        fruits: 'Fruits',
        vegetables: 'Vegetables',
        meat: 'Meat',
        dairy: 'Dairy products',
      },
      statusFilter: {
        all: 'All statuses',
        active: 'Active',
        pending: 'Pending',
        rejected: 'Rejected',
      },
      sortOptions: {
        name: 'Name',
        price: 'Price',
        quantity: 'Quantity',
        dateAdded: 'Date added',
      },
      noProducts: 'No products found',
      rowsPerPage: 'Rows per page:',
      errors: {
        loadingProducts: 'Error loading products. Please try again later.',
      },
      actions: {
        edit: 'Edit',
        delete: 'Delete',
        createOffer: 'Create offer',
      },
    },
  };

  const t = translations[language as keyof typeof translations];

  // Маппинг категорий для фильтра
  const categoryMap = {
    'Фрукты': t.categories.fruits,
    'Овощи': t.categories.vegetables,
    'Мясо': t.categories.meat,
    'Молочные продукты': t.categories.dairy,
  };

  // Маппинг статусов
  const statusMap = {
    'active': t.status.active,
    'pending': t.status.pending,
    'rejected': t.status.rejected,
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Верхняя панель с курсами валют */}
      <Box
        sx={{
          bgcolor: 'grey.100',
          py: 0.5,
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Container>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="body2">
              <strong>{t.currencyRates}:</strong>{' '}
              USD: {currencyRates.USD} ₽ | EUR: {currencyRates.EUR} ₽ | AZN: {currencyRates.AZN} ₽
            </Typography>
            
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <FormControl size="small" sx={{ minWidth: 100, mr: 2 }}>
                <Select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value as string)}
                  displayEmpty
                  startAdornment={
                    <InputAdornment position="start">
                      <Language fontSize="small" />
                    </InputAdornment>
                  }
                  sx={{ height: 32 }}
                >
                  <MenuItem value="ru">Русский</MenuItem>
                  <MenuItem value="az">Azərbaycan</MenuItem>
                  <MenuItem value="en">English</MenuItem>
                </Select>
              </FormControl>
              
              <Tooltip title={t.profile}>
                <IconButton size="small" sx={{ mr: 1 }}>
                  <Person fontSize="small" />
                </IconButton>
              </Tooltip>
              
              <Tooltip title={t.logout}>
                <IconButton size="small" onClick={handleLogout}>
                  <Logout fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
        </Container>
      </Box>
      
      {/* Основное содержимое */}
      <Container sx={{ mt: 4, mb: 8, flexGrow: 1 }}>
        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
            {t.pageTitle}
          </Typography>
          
          <Button
            variant="contained"
            color="primary"
            startIcon={<Add />}
            onClick={() => router.push('/supplier/products/add')}
          >
            {t.addProduct}
          </Button>
        </Box>
        
        {/* Строка поиска и фильтров */}
        <Paper sx={{ p: 2, mb: 3 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                placeholder={t.search}
                value={filters.search}
                onChange={handleSearchChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            
            <Grid item xs={12} md={6} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                variant="outlined"
                startIcon={<FilterList />}
                onClick={() => setShowFilters(!showFilters)}
                sx={{ mr: 1 }}
              >
                {showFilters ? t.hideFilters : t.showFilters}
              </Button>
              
              <Button
                variant="outlined"
                startIcon={<Refresh />}
                onClick={() => fetchProducts()}
              >
                {t.refresh}
              </Button>
            </Grid>
            
            {showFilters && (
              <Grid item xs={12}>
                <Box sx={{ mt: 2 }}>
                  <Divider sx={{ mb: 2 }} />
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={3}>
                      <FormControl fullWidth>
                        <InputLabel>{t.category}</InputLabel>
                        <Select
                          value={filters.category}
                          onChange={handleFilterChange('category') as any}
                          label={t.category}
                        >
                          <MenuItem value="">{t.categories.all}</MenuItem>
                          <MenuItem value="Фрукты">{t.categories.fruits}</MenuItem>
                          <MenuItem value="Овощи">{t.categories.vegetables}</MenuItem>
                          <MenuItem value="Мясо">{t.categories.meat}</MenuItem>
                          <MenuItem value="Молочные продукты">{t.categories.dairy}</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    
                    <Grid item xs={12} md={3}>
                      <FormControl fullWidth>
                        <InputLabel>{t.status}</InputLabel>
                        <Select
                          value={filters.status}
                          onChange={handleFilterChange('status') as any}
                          label={t.status}
                        >
                          <MenuItem value="">{t.statusFilter.all}</MenuItem>
                          <MenuItem value="active">{t.statusFilter.active}</MenuItem>
                          <MenuItem value="pending">{t.statusFilter.pending}</MenuItem>
                          <MenuItem value="rejected">{t.statusFilter.rejected}</MenuItem>
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
                          <MenuItem value="name">{t.sortOptions.name}</MenuItem>
                          <MenuItem value="price">{t.sortOptions.price}</MenuItem>
                          <MenuItem value="quantity">{t.sortOptions.quantity}</MenuItem>
                          <MenuItem value="dateAdded">{t.sortOptions.dateAdded}</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    
                    <Grid item xs={12} md={3} sx={{ display: 'flex', alignItems: 'center' }}>
                      <Button
                        variant="contained"
                        onClick={() => fetchProducts()}
                        sx={{ mr: 1 }}
                      >
                        {t.apply}
                      </Button>
                      
                      <Button
                        variant="outlined"
                        onClick={() => {
                          setFilters({
                            search: '',
                            category: '',
                            status: '',
                            sortBy: 'dateAdded',
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
        
        {/* Таблица товаров */}
        <Paper sx={{ width: '100%', overflow: 'hidden' }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          
          <TableContainer sx={{ maxHeight: 640 }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>{t.columns.code}</TableCell>
                  <TableCell>{t.columns.name}</TableCell>
                  <TableCell>{t.columns.category}</TableCell>
                  <TableCell>{t.columns.price}</TableCell>
                  <TableCell align="right">{t.columns.quantity}</TableCell>
                  <TableCell>{t.columns.status}</TableCell>
                  <TableCell>{t.columns.dateAdded}</TableCell>
                  <TableCell align="center">{t.columns.actions}</TableCell>
                </TableRow>
              </TableHead>
              
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center" sx={{ py: 3 }}>
                      <CircularProgress />
                    </TableCell>
                  </TableRow>
                ) : products.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center" sx={{ py: 3 }}>
                      <Typography variant="body1">{t.noProducts}</Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  products.map((product) => (
                    <TableRow key={product.id} hover>
                      <TableCell>{product.code}</TableCell>
                      <TableCell>{product.name}</TableCell>
                      <TableCell>{categoryMap[product.category as keyof typeof categoryMap] || product.category}</TableCell>
                      <TableCell>{formatPrice(product.price, product.currency)}</TableCell>
                      <TableCell align="right">{product.quantity}</TableCell>
                      <TableCell>
                        <Chip
                          label={statusMap[product.status]}
                          color={getStatusColor(product.status) as any}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{formatDate(product.dateAdded)}</TableCell>
                      <TableCell align="center">
                        <Tooltip title={t.actions.edit}>
                          <IconButton
                            size="small"
                            onClick={() => router.push(`/supplier/products/edit/${product.id}`)}
                          >
                            <Edit fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        
                        <Tooltip title={t.actions.delete}>
                          <IconButton size="small" color="error">
                            <Delete fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        
                        {product.status === 'active' && (
                          <Button
                            size="small"
                            variant="outlined"
                            sx={{ ml: 1 }}
                            onClick={() => router.push(`/supplier/offers/create?productId=${product.id}`)}
                          >
                            {t.actions.createOffer}
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
          
          <TablePagination
            rowsPerPageOptions={[10, 25, 50]}
            component="div"
            count={totalRows}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            labelRowsPerPage={t.rowsPerPage}
          />
        </Paper>
      </Container>
    </Box>
  );
} 