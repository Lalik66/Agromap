'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Inventory2 as ProductsIcon,
  LocalOffer as OffersIcon,
  Description as OrdersIcon,
  Settings as SettingsIcon,
  Person as ProfileIcon,
  Logout as LogoutIcon,
  Language as LanguageIcon,
} from '@mui/icons-material';
import { useRouter, usePathname } from 'next/navigation';
import Image from 'next/image';
import axios from 'axios';

const drawerWidth = 240;

interface SupplierLayoutProps {
  children: React.ReactNode;
}

export default function SupplierLayout({ children }: SupplierLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [language, setLanguage] = useState('ru');
  const [drawerOpen, setDrawerOpen] = useState(!isMobile);
  const [profileMenuAnchor, setProfileMenuAnchor] = useState<null | HTMLElement>(null);
  const [languageMenuAnchor, setLanguageMenuAnchor] = useState<null | HTMLElement>(null);
  
  useEffect(() => {
    setDrawerOpen(!isMobile);
  }, [isMobile]);

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setProfileMenuAnchor(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setProfileMenuAnchor(null);
  };
  
  const handleLanguageMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setLanguageMenuAnchor(event.currentTarget);
  };

  const handleLanguageMenuClose = () => {
    setLanguageMenuAnchor(null);
  };
  
  const handleChangeLanguage = (lang: string) => {
    setLanguage(lang);
    handleLanguageMenuClose();
  };

  const handleLogout = async () => {
    try {
      await axios.post('/api/auth/logout');
      router.push('/auth/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Переводы
  const translations = {
    ru: {
      dashboard: 'Панель поставщика',
      products: 'Товары',
      offers: 'Офферы',
      orders: 'Заказы',
      settings: 'Настройки',
      profile: 'Профиль',
      logout: 'Выйти',
      languages: {
        ru: 'Русский',
        az: 'Азербайджанский',
        en: 'Английский',
      },
    },
    az: {
      dashboard: 'Təchizatçı paneli',
      products: 'Məhsullar',
      offers: 'Təkliflər',
      orders: 'Sifarişlər',
      settings: 'Parametrlər',
      profile: 'Profil',
      logout: 'Çıxış',
      languages: {
        ru: 'Rus dili',
        az: 'Azərbaycan dili',
        en: 'İngilis dili',
      },
    },
    en: {
      dashboard: 'Supplier Dashboard',
      products: 'Products',
      offers: 'Offers',
      orders: 'Orders',
      settings: 'Settings',
      profile: 'Profile',
      logout: 'Logout',
      languages: {
        ru: 'Russian',
        az: 'Azerbaijani',
        en: 'English',
      },
    },
  };

  const t = translations[language as keyof typeof translations];

  // Элементы меню навигации
  const menuItems = [
    {
      text: t.products,
      icon: <ProductsIcon />,
      path: '/supplier/products',
    },
    {
      text: t.offers,
      icon: <OffersIcon />,
      path: '/supplier/offers',
    },
    {
      text: t.orders,
      icon: <OrdersIcon />,
      path: '/supplier/orders',
    },
    {
      text: t.settings,
      icon: <SettingsIcon />,
      path: '/supplier/settings',
    },
  ];

  return (
    <Box sx={{ display: 'flex', height: '100vh' }}>
      {/* AppBar */}
      <AppBar
        position="fixed"
        sx={{
          width: { md: `calc(100% - ${drawerOpen ? drawerWidth : 0}px)` },
          ml: { md: `${drawerOpen ? drawerWidth : 0}px` },
          zIndex: (theme) => theme.zIndex.drawer + 1,
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={() => setDrawerOpen(!drawerOpen)}
            sx={{ mr: 2, display: { xs: 'block', md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            {t.dashboard}
          </Typography>
          
          <IconButton
            color="inherit"
            onClick={handleLanguageMenuOpen}
            sx={{ ml: 1 }}
          >
            <LanguageIcon />
          </IconButton>
          
          <IconButton
            onClick={handleProfileMenuOpen}
            sx={{ ml: 1 }}
          >
            <Avatar
              alt="Profile"
              sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}
            >
              S
            </Avatar>
          </IconButton>
          
          {/* Меню языка */}
          <Menu
            anchorEl={languageMenuAnchor}
            open={Boolean(languageMenuAnchor)}
            onClose={handleLanguageMenuClose}
            PaperProps={{
              elevation: 2,
            }}
          >
            <MenuItem onClick={() => handleChangeLanguage('ru')}>
              {t.languages.ru}
            </MenuItem>
            <MenuItem onClick={() => handleChangeLanguage('az')}>
              {t.languages.az}
            </MenuItem>
            <MenuItem onClick={() => handleChangeLanguage('en')}>
              {t.languages.en}
            </MenuItem>
          </Menu>
          
          {/* Меню профиля */}
          <Menu
            anchorEl={profileMenuAnchor}
            open={Boolean(profileMenuAnchor)}
            onClose={handleProfileMenuClose}
            PaperProps={{
              elevation: 2,
            }}
          >
            <MenuItem
              onClick={() => {
                handleProfileMenuClose();
                router.push('/supplier/profile');
              }}
            >
              <ListItemIcon>
                <ProfileIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>{t.profile}</ListItemText>
            </MenuItem>
            
            <Divider />
            
            <MenuItem onClick={handleLogout}>
              <ListItemIcon>
                <LogoutIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>{t.logout}</ListItemText>
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>
      
      {/* Drawer */}
      <Drawer
        variant={isMobile ? "temporary" : "persistent"}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
          },
        }}
      >
        <Toolbar />
        
        <Box sx={{ overflow: 'auto', mt: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
            <Image
              src="/logo.png"
              alt="AgroMap Logo"
              width={150}
              height={50}
              style={{ objectFit: 'contain' }}
            />
          </Box>
          
          <Divider />
          
          <List>
            {menuItems.map((item) => (
              <ListItem
                key={item.path}
                disablePadding
                sx={{
                  bgcolor: pathname?.startsWith(item.path) ? 'rgba(0, 0, 0, 0.08)' : 'transparent',
                }}
              >
                <ListItemButton
                  onClick={() => {
                    router.push(item.path);
                    if (isMobile) {
                      setDrawerOpen(false);
                    }
                  }}
                >
                  <ListItemIcon
                    sx={{
                      color: pathname?.startsWith(item.path) ? 'primary.main' : 'inherit',
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.text}
                    primaryTypographyProps={{
                      fontWeight: pathname?.startsWith(item.path) ? 'bold' : 'normal',
                      color: pathname?.startsWith(item.path) ? 'primary.main' : 'inherit',
                    }}
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>
      
      {/* Основное содержимое */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { md: `calc(100% - ${drawerOpen ? drawerWidth : 0}px)` },
          height: '100%',
          overflow: 'auto',
        }}
      >
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
} 