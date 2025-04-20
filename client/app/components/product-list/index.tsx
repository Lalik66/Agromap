'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  TextField,
  InputAdornment,
  AppBar,
  Toolbar,
  IconButton,
  Menu,
  MenuItem,
  Badge,
  Grid,
  Divider,
  Chip,
  FormControl,
  InputLabel,
  Select,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { 
  Search as SearchIcon,
  Notifications as NotificationsIcon,
  AccountCircle as AccountCircleIcon,
  Language as LanguageIcon,
  FilterList as FilterListIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import axios from 'axios';

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  unit: string;
  status: string;
}

const mockProducts: Product[] = [
  { id: '1', name: 'Яблоки Гала', category: 'Фрукты', price: 120, unit: 'кг', status: 'Активный' },
  { id: '2', name: 'Морковь', category: 'Овощи', price: 45, unit: 'кг', status: 'Активный' },
  { id: '3', name: 'Молоко 3.2%', category: 'Молочные продукты', price: 89, unit: 'л', status: 'Неактивный' },
  { id: '4', name: 'Хлеб белый', category: 'Выпечка', price: 35, unit: 'шт', status: 'Активный' },
  { id: '5', name: 'Картофель', category: 'Овощи', price: 39, unit: 'кг', status: 'Активный' },
];

export default function ProductList() {
  const [products, setProducts] = useState<Product[]>(mockProducts);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [language, setLanguage] = useState('ru');
  const [notificationAnchorEl, setNotificationAnchorEl] = useState<null | HTMLElement>(null);
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [newOffer, setNewOffer] = useState({
    name: '',
    category: '',
    price: '',
    unit: 'кг',
  });

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setNotificationAnchorEl(event.currentTarget);
  };

  const handleNotificationMenuClose = () => {
    setNotificationAnchorEl(null);
  };

  const handleLanguageChange = (lang: string) => {
    setLanguage(lang);
    handleMenuClose();
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleCreateDialogOpen = () => {
    setOpenCreateDialog(true);
  };

  const handleCreateDialogClose = () => {
    setOpenCreateDialog(false);
    setNewOffer({
      name: '',
      category: '',
      price: '',
      unit: 'кг',
    });
  };

  const handleCreateOffer = () => {
    // Здесь будет API запрос на создание оффера
    const newProduct: Product = {
      id: Math.random().toString(36).substr(2, 9),
      name: newOffer.name,
      category: newOffer.category,
      price: parseFloat(newOffer.price),
      unit: newOffer.unit,
      status: 'Активный',
    };
    
    setProducts([...products, newProduct]);
    handleCreateDialogClose();
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === '' || product.category === categoryFilter;
    const matchesStatus = statusFilter === '' || product.status === statusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const translations = {
    ru: {
      header: {
        search: 'Поиск товаров...',
        notifications: 'Уведомления',
        profile: 'Профиль',
        logout: 'Выйти',
        languageRu: 'Русский',
        languageAz: 'Азербайджанский',
        languageEn: 'Английский',
      },
      rates: {
        title: 'Курсы валют',
        usd: 'USD',
        eur: 'EUR',
        try: 'TRY',
      },
      table: {
        title: 'Список товаров',
        addNew: 'Создать оффер',
        columns: {
          name: 'Наименование',
          category: 'Категория',
          price: 'Цена',
          unit: 'Ед. изм.',
          status: 'Статус',
          actions: 'Действия',
        },
        filterBy: 'Фильтр по',
        all: 'Все',
        category: 'Категория',
        status: 'Статус',
        active: 'Активный',
        inactive: 'Неактивный',
        viewDetails: 'Просмотр',
      },
      createOffer: {
        title: 'Создание оффера',
        name: 'Наименование товара',
        category: 'Категория',
        price: 'Цена',
        unit: 'Единица измерения',
        cancel: 'Отмена',
        create: 'Создать',
      }
    },
    az: {
      header: {
        search: 'Məhsul axtarışı...',
        notifications: 'Bildirişlər',
        profile: 'Profil',
        logout: 'Çıxış',
        languageRu: 'Rus',
        languageAz: 'Azərbaycan',
        languageEn: 'İngilis',
      },
      rates: {
        title: 'Valyuta məzənnələri',
        usd: 'USD',
        eur: 'EUR',
        try: 'TRY',
      },
      table: {
        title: 'Məhsulların siyahısı',
        addNew: 'Təklif yarat',
        columns: {
          name: 'Ad',
          category: 'Kateqoriya',
          price: 'Qiymət',
          unit: 'Ölçü vahidi',
          status: 'Status',
          actions: 'Hərəkətlər',
        },
        filterBy: 'Filtrlə',
        all: 'Hamısı',
        category: 'Kateqoriya',
        status: 'Status',
        active: 'Aktiv',
        inactive: 'Qeyri-aktiv',
        viewDetails: 'Baxış',
      },
      createOffer: {
        title: 'Təklif yaratmaq',
        name: 'Məhsul adı',
        category: 'Kateqoriya',
        price: 'Qiymət',
        unit: 'Ölçü vahidi',
        cancel: 'Ləğv et',
        create: 'Yarat',
      }
    },
    en: {
      header: {
        search: 'Search products...',
        notifications: 'Notifications',
        profile: 'Profile',
        logout: 'Logout',
        languageRu: 'Russian',
        languageAz: 'Azerbaijani',
        languageEn: 'English',
      },
      rates: {
        title: 'Currency Rates',
        usd: 'USD',
        eur: 'EUR',
        try: 'TRY',
      },
      table: {
        title: 'Products List',
        addNew: 'Create Offer',
        columns: {
          name: 'Name',
          category: 'Category',
          price: 'Price',
          unit: 'Unit',
          status: 'Status',
          actions: 'Actions',
        },
        filterBy: 'Filter by',
        all: 'All',
        category: 'Category',
        status: 'Status',
        active: 'Active',
        inactive: 'Inactive',
        viewDetails: 'View',
      },
      createOffer: {
        title: 'Create Offer',
        name: 'Product Name',
        category: 'Category',
        price: 'Price',
        unit: 'Unit',
        cancel: 'Cancel',
        create: 'Create',
      }
    }
  };

  const t = translations[language as keyof typeof translations];
  const categories = Array.from(new Set(products.map(product => product.category)));
  const statuses = Array.from(new Set(products.map(product => product.status)));

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <Typography
            variant="h6"
            noWrap
            component="div"
            sx={{ display: { xs: 'none', sm: 'block' } }}
          >
            Agromap
          </Typography>
          <Box sx={{ flexGrow: 1 }} />
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box sx={{ position: 'relative', mr: 2 }}>
              <TextField
                placeholder={t.header.search}
                size="small"
                variant="outlined"
                value={searchTerm}
                onChange={handleSearchChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Box>
            
            <IconButton
              size="large"
              color="inherit"
              onClick={handleNotificationMenuOpen}
            >
              <Badge badgeContent={4} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton>
            
            <IconButton
              size="large"
              edge="end"
              onClick={handleProfileMenuOpen}
              color="inherit"
            >
              <AccountCircleIcon />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>
      
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => handleLanguageChange('ru')}>
          <LanguageIcon sx={{ mr: 1 }} /> 
          {t.header.languageRu}
        </MenuItem>
        <MenuItem onClick={() => handleLanguageChange('az')}>
          <LanguageIcon sx={{ mr: 1 }} /> 
          {t.header.languageAz}
        </MenuItem>
        <MenuItem onClick={() => handleLanguageChange('en')}>
          <LanguageIcon sx={{ mr: 1 }} /> 
          {t.header.languageEn}
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleMenuClose}>{t.header.profile}</MenuItem>
        <MenuItem onClick={handleMenuClose}>{t.header.logout}</MenuItem>
      </Menu>
      
      <Menu
        anchorEl={notificationAnchorEl}
        open={Boolean(notificationAnchorEl)}
        onClose={handleNotificationMenuClose}
      >
        <MenuItem onClick={handleNotificationMenuClose}>
          Уведомление 1
        </MenuItem>
        <MenuItem onClick={handleNotificationMenuClose}>
          Уведомление 2
        </MenuItem>
        <MenuItem onClick={handleNotificationMenuClose}>
          Уведомление 3
        </MenuItem>
        <MenuItem onClick={handleNotificationMenuClose}>
          Уведомление 4
        </MenuItem>
      </Menu>
      
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Paper sx={{ p: 2, mb: 3 }}>
          <Typography variant="h6" gutterBottom component="div">
            {t.rates.title}
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={4}>
              <Paper elevation={0} sx={{ p: 2, textAlign: 'center', bgcolor: '#f5f5f5' }}>
                <Typography variant="subtitle1">{t.rates.usd}</Typography>
                <Typography variant="h6">1.75 ₼</Typography>
              </Paper>
            </Grid>
            <Grid item xs={4}>
              <Paper elevation={0} sx={{ p: 2, textAlign: 'center', bgcolor: '#f5f5f5' }}>
                <Typography variant="subtitle1">{t.rates.eur}</Typography>
                <Typography variant="h6">1.90 ₼</Typography>
              </Paper>
            </Grid>
            <Grid item xs={4}>
              <Paper elevation={0} sx={{ p: 2, textAlign: 'center', bgcolor: '#f5f5f5' }}>
                <Typography variant="subtitle1">{t.rates.try}</Typography>
                <Typography variant="h6">0.05 ₼</Typography>
              </Paper>
            </Grid>
          </Grid>
        </Paper>
        
        <Paper sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6" gutterBottom component="div">
              {t.table.title}
            </Typography>
            <Button 
              variant="contained" 
              startIcon={<AddIcon />}
              onClick={handleCreateDialogOpen}
            >
              {t.table.addNew}
            </Button>
          </Box>
          
          <Box sx={{ display: 'flex', mb: 3, alignItems: 'center' }}>
            <FilterListIcon sx={{ mr: 1 }} />
            <Typography variant="body1" sx={{ mr: 2 }}>
              {t.table.filterBy}:
            </Typography>
            
            <FormControl variant="outlined" size="small" sx={{ minWidth: 150, mr: 2 }}>
              <InputLabel>{t.table.category}</InputLabel>
              <Select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                label={t.table.category}
              >
                <MenuItem value="">{t.table.all}</MenuItem>
                {categories.map((category) => (
                  <MenuItem key={category} value={category}>{category}</MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <FormControl variant="outlined" size="small" sx={{ minWidth: 150 }}>
              <InputLabel>{t.table.status}</InputLabel>
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                label={t.table.status}
              >
                <MenuItem value="">{t.table.all}</MenuItem>
                {statuses.map((status) => (
                  <MenuItem key={status} value={status}>{status}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
          
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>{t.table.columns.name}</TableCell>
                  <TableCell>{t.table.columns.category}</TableCell>
                  <TableCell align="right">{t.table.columns.price}</TableCell>
                  <TableCell>{t.table.columns.unit}</TableCell>
                  <TableCell>{t.table.columns.status}</TableCell>
                  <TableCell align="center">{t.table.columns.actions}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredProducts.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>{product.name}</TableCell>
                    <TableCell>{product.category}</TableCell>
                    <TableCell align="right">{product.price.toFixed(2)} ₼</TableCell>
                    <TableCell>{product.unit}</TableCell>
                    <TableCell>
                      <Chip 
                        label={product.status} 
                        color={product.status === 'Активный' ? 'success' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Button size="small" variant="outlined">
                        {t.table.viewDetails}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Container>
      
      <Dialog open={openCreateDialog} onClose={handleCreateDialogClose}>
        <DialogTitle>{t.createOffer.title}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            id="name"
            label={t.createOffer.name}
            fullWidth
            variant="outlined"
            value={newOffer.name}
            onChange={(e) => setNewOffer({...newOffer, name: e.target.value})}
            sx={{ mb: 2, mt: 1 }}
          />
          <TextField
            margin="dense"
            id="category"
            label={t.createOffer.category}
            fullWidth
            variant="outlined"
            value={newOffer.category}
            onChange={(e) => setNewOffer({...newOffer, category: e.target.value})}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            id="price"
            label={t.createOffer.price}
            fullWidth
            variant="outlined"
            type="number"
            InputProps={{
              endAdornment: <InputAdornment position="end">₼</InputAdornment>,
            }}
            value={newOffer.price}
            onChange={(e) => setNewOffer({...newOffer, price: e.target.value})}
            sx={{ mb: 2 }}
          />
          <FormControl fullWidth margin="dense" variant="outlined">
            <InputLabel>{t.createOffer.unit}</InputLabel>
            <Select
              value={newOffer.unit}
              onChange={(e) => setNewOffer({...newOffer, unit: e.target.value})}
              label={t.createOffer.unit}
            >
              <MenuItem value="кг">кг</MenuItem>
              <MenuItem value="л">л</MenuItem>
              <MenuItem value="шт">шт</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCreateDialogClose}>{t.createOffer.cancel}</Button>
          <Button 
            onClick={handleCreateOffer} 
            variant="contained"
            disabled={!newOffer.name || !newOffer.category || !newOffer.price}
          >
            {t.createOffer.create}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 