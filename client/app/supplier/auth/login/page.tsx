'use client';

import { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Link,
  Grid,
  IconButton,
  FormControl,
  InputLabel,
  InputAdornment,
  OutlinedInput,
  FormHelperText,
  CircularProgress,
  Alert,
  Container,
  useTheme,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Language as LanguageIcon,
  Menu as MenuIcon,
} from '@mui/icons-material';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import axios from 'axios';

export default function LoginPage() {
  const router = useRouter();
  const theme = useTheme();
  
  const [language, setLanguage] = useState('ru');
  const [menuOpen, setMenuOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  
  const [formErrors, setFormErrors] = useState({
    email: '',
    password: '',
  });
  
  // Переводы
  const translations = {
    ru: {
      title: 'Вход в кабинет поставщика',
      email: 'Электронная почта',
      password: 'Пароль',
      login: 'Войти',
      forgotPassword: 'Забыли пароль?',
      noAccount: 'Нет аккаунта?',
      register: 'Зарегистрироваться',
      emailRequired: 'Введите email',
      emailInvalid: 'Введите корректный email',
      passwordRequired: 'Введите пароль',
      invalidCredentials: 'Неверный email или пароль',
      languages: {
        ru: 'Русский',
        az: 'Азербайджанский',
        en: 'Английский',
      },
    },
    az: {
      title: 'Təchizatçı kabinetinə giriş',
      email: 'E-poçt',
      password: 'Şifrə',
      login: 'Daxil olun',
      forgotPassword: 'Şifrəni unutmusunuz?',
      noAccount: 'Hesabınız yoxdur?',
      register: 'Qeydiyyatdan keçin',
      emailRequired: 'E-poçt daxil edin',
      emailInvalid: 'Düzgün e-poçt daxil edin',
      passwordRequired: 'Şifrə daxil edin',
      invalidCredentials: 'Yanlış e-poçt və ya şifrə',
      languages: {
        ru: 'Rus dili',
        az: 'Azərbaycan dili',
        en: 'İngilis dili',
      },
    },
    en: {
      title: 'Supplier Login',
      email: 'Email',
      password: 'Password',
      login: 'Sign In',
      forgotPassword: 'Forgot password?',
      noAccount: 'Don\'t have an account?',
      register: 'Sign Up',
      emailRequired: 'Email is required',
      emailInvalid: 'Enter a valid email',
      passwordRequired: 'Password is required',
      invalidCredentials: 'Invalid email or password',
      languages: {
        ru: 'Russian',
        az: 'Azerbaijani',
        en: 'English',
      },
    },
  };
  
  const t = translations[language as keyof typeof translations];
  
  const handleLanguageChange = (lang: string) => {
    setLanguage(lang);
    setMenuOpen(false);
  };
  
  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    
    // Сбрасываем ошибки при изменении поля
    setFormErrors({
      ...formErrors,
      [name]: '',
    });
  };
  
  const validateForm = () => {
    let isValid = true;
    const errors = { email: '', password: '' };
    
    // Валидация email
    if (!formData.email) {
      errors.email = t.emailRequired;
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = t.emailInvalid;
      isValid = false;
    }
    
    // Валидация пароля
    if (!formData.password) {
      errors.password = t.passwordRequired;
      isValid = false;
    }
    
    setFormErrors(errors);
    return isValid;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Сбрасываем общую ошибку
    setError('');
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    try {
      // Имитация запроса к API
      // const response = await axios.post('/api/auth/login', formData);
      
      // Для демонстрации без запроса
      await new Promise(r => setTimeout(r, 1000));
      
      // Перенаправляем на страницу товаров при успешной авторизации
      router.push('/supplier/products');
    } catch (err: any) {
      setError(t.invalidCredentials);
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Container maxWidth="sm" sx={{ pt: 4 }}>
      <Box sx={{ position: 'absolute', top: 16, right: 16 }}>
        <IconButton
          color="primary"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="language"
        >
          <LanguageIcon />
        </IconButton>
        
        {menuOpen && (
          <Paper
            sx={{
              position: 'absolute',
              right: 0,
              mt: 1,
              zIndex: 10,
              width: 200,
              boxShadow: 3,
            }}
          >
            <Box sx={{ p: 1 }}>
              <Button
                fullWidth
                onClick={() => handleLanguageChange('ru')}
                sx={{
                  justifyContent: 'flex-start',
                  fontWeight: language === 'ru' ? 'bold' : 'normal',
                  color: language === 'ru' ? 'primary.main' : 'inherit',
                }}
              >
                {t.languages.ru}
              </Button>
              <Button
                fullWidth
                onClick={() => handleLanguageChange('az')}
                sx={{
                  justifyContent: 'flex-start',
                  fontWeight: language === 'az' ? 'bold' : 'normal',
                  color: language === 'az' ? 'primary.main' : 'inherit',
                }}
              >
                {t.languages.az}
              </Button>
              <Button
                fullWidth
                onClick={() => handleLanguageChange('en')}
                sx={{
                  justifyContent: 'flex-start',
                  fontWeight: language === 'en' ? 'bold' : 'normal',
                  color: language === 'en' ? 'primary.main' : 'inherit',
                }}
              >
                {t.languages.en}
              </Button>
            </Box>
          </Paper>
        )}
      </Box>
      
      <Paper
        elevation={3}
        sx={{
          p: 4,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Box sx={{ mb: 3, textAlign: 'center' }}>
          <Image
            src="/logo.png"
            alt="AgroMap Logo"
            width={180}
            height={60}
            style={{ objectFit: 'contain' }}
          />
        </Box>
        
        <Typography variant="h5" component="h1" gutterBottom>
          {t.title}
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
            {error}
          </Alert>
        )}
        
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1, width: '100%' }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label={t.email}
            name="email"
            autoComplete="email"
            autoFocus
            value={formData.email}
            onChange={handleChange}
            error={!!formErrors.email}
            helperText={formErrors.email}
          />
          
          <FormControl
            variant="outlined"
            fullWidth
            margin="normal"
            required
            error={!!formErrors.password}
          >
            <InputLabel htmlFor="password">{t.password}</InputLabel>
            <OutlinedInput
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={handleChange}
              autoComplete="current-password"
              endAdornment={
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={handleClickShowPassword}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              }
              label={t.password}
            />
            {formErrors.password && (
              <FormHelperText>{formErrors.password}</FormHelperText>
            )}
          </FormControl>
          
          <Box sx={{ textAlign: 'right', mt: 1 }}>
            <Link
              href="/supplier/auth/recover"
              variant="body2"
              underline="hover"
            >
              {t.forgotPassword}
            </Link>
          </Box>
          
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2, py: 1.2 }}
            disabled={loading}
          >
            {loading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              t.login
            )}
          </Button>
          
          <Grid container justifyContent="center" sx={{ mt: 2 }}>
            <Grid item>
              <Typography variant="body2" sx={{ display: 'inline' }}>
                {t.noAccount}{' '}
              </Typography>
              <Link
                href="/supplier/auth/register"
                variant="body2"
                underline="hover"
              >
                {t.register}
              </Link>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Container>
  );
} 