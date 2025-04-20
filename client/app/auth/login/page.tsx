'use client';

import { useState } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Container,
  Paper,
  Alert,
  CircularProgress,
  FormControl,
  Select,
  MenuItem,
  InputAdornment,
  IconButton,
  Checkbox,
  FormControlLabel,
} from '@mui/material';
import { Language, Visibility, VisibilityOff } from '@mui/icons-material';
import Image from 'next/image';
import Link from 'next/link';
import axios from 'axios';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [language, setLanguage] = useState('ru');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    
    if (!username || !password) {
      setError(t.errors.requiredFields);
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // В реальном приложении здесь будет API запрос на авторизацию
      const response = await axios.post('/api/auth/login', {
        username,
        password,
        rememberMe,
      });
      
      // После успешной авторизации перенаправляем на главную страницу
      router.push('/supplier/products');
    } catch (err: any) {
      setError(err.response?.data?.message || t.errors.generalError);
    } finally {
      setLoading(false);
    }
  };

  const translations = {
    ru: {
      title: 'Вход в систему',
      username: 'Логин',
      password: 'Пароль',
      rememberMe: 'Запомнить меня',
      login: 'Войти',
      forgotPassword: 'Забыли пароль?',
      noAccount: 'Нет аккаунта?',
      register: 'Зарегистрироваться',
      languages: {
        ru: 'Русский',
        az: 'Азербайджанский',
        en: 'Английский',
      },
      errors: {
        requiredFields: 'Пожалуйста, заполните все обязательные поля',
        invalidCredentials: 'Неверный логин или пароль',
        generalError: 'Произошла ошибка. Пожалуйста, попробуйте позже.',
      }
    },
    az: {
      title: 'Sistemə giriş',
      username: 'İstifadəçi adı',
      password: 'Şifrə',
      rememberMe: 'Məni xatırla',
      login: 'Daxil ol',
      forgotPassword: 'Şifrəni unutmusunuz?',
      noAccount: 'Hesabınız yoxdur?',
      register: 'Qeydiyyatdan keç',
      languages: {
        ru: 'Rus',
        az: 'Azərbaycan',
        en: 'İngilis',
      },
      errors: {
        requiredFields: 'Zəhmət olmasa, bütün tələb olunan sahələri doldurun',
        invalidCredentials: 'Yanlış istifadəçi adı və ya şifrə',
        generalError: 'Xəta baş verdi. Zəhmət olmasa, sonra yenidən cəhd edin.',
      }
    },
    en: {
      title: 'Log in to the system',
      username: 'Username',
      password: 'Password',
      rememberMe: 'Remember me',
      login: 'Log in',
      forgotPassword: 'Forgot password?',
      noAccount: 'No account?',
      register: 'Register',
      languages: {
        ru: 'Russian',
        az: 'Azerbaijani',
        en: 'English',
      },
      errors: {
        requiredFields: 'Please fill in all required fields',
        invalidCredentials: 'Invalid username or password',
        generalError: 'An error occurred. Please try again later.',
      }
    }
  };

  const t = translations[language as keyof typeof translations];

  return (
    <Container component="main" maxWidth="sm">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'center' }}>
          <Image
            src="/logo.png"
            alt="Agromap Logo"
            width={180}
            height={60}
            priority
          />
        </Box>
        
        <Paper
          elevation={3}
          sx={{
            p: 4,
            width: '100%',
            borderRadius: 2,
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography component="h1" variant="h5" sx={{ fontWeight: 'bold' }}>
              {t.title}
            </Typography>
            
            <FormControl size="small" sx={{ minWidth: 100 }}>
              <Select
                value={language}
                onChange={(e) => setLanguage(e.target.value as string)}
                displayEmpty
                startAdornment={
                  <InputAdornment position="start">
                    <Language fontSize="small" />
                  </InputAdornment>
                }
                sx={{ height: 40 }}
              >
                <MenuItem value="ru">{t.languages.ru}</MenuItem>
                <MenuItem value="az">{t.languages.az}</MenuItem>
                <MenuItem value="en">{t.languages.en}</MenuItem>
              </Select>
            </FormControl>
          </Box>
          
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          
          <Box component="form" onSubmit={handleSubmit} noValidate>
            <TextField
              margin="normal"
              required
              fullWidth
              id="username"
              label={t.username}
              name="username"
              autoComplete="username"
              autoFocus
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label={t.password}
              type={showPassword ? "text" : "password"}
              id="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    value="remember"
                    color="primary"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                }
                label={<Typography variant="body2">{t.rememberMe}</Typography>}
              />
              
              <Link href="/auth/forgot-password" passHref>
                <Typography variant="body2" color="primary" sx={{ cursor: 'pointer' }}>
                  {t.forgotPassword}
                </Typography>
              </Link>
            </Box>
            
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2, height: 48 }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : t.login}
            </Button>
            
            <Box sx={{ textAlign: 'center', mt: 2 }}>
              <Typography variant="body2">
                {t.noAccount} <Link href="/auth/signup">{t.register}</Link>
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
} 