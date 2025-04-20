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
} from '@mui/material';
import { ArrowBack, Language } from '@mui/icons-material';
import Image from 'next/image';
import Link from 'next/link';
import axios from 'axios';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [language, setLanguage] = useState('ru');

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    
    if (!email) {
      setError(t.errors.emailRequired);
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // В реальном проекте здесь будет API запрос на сброс пароля
      await axios.post('/api/auth/forgot-password', { email });
      setSuccess(true);
    } catch (err: any) {
      setError(err.response?.data?.message || t.errors.generalError);
    } finally {
      setLoading(false);
    }
  };

  const translations = {
    ru: {
      title: 'Восстановление пароля',
      subtitle: 'Введите email, указанный при регистрации',
      email: 'Email',
      submit: 'Отправить',
      backToLogin: 'Вернуться к авторизации',
      successMessage: 'Инструкции по восстановлению пароля отправлены на указанный email',
      languages: {
        ru: 'Русский',
        az: 'Азербайджанский',
        en: 'Английский',
      },
      errors: {
        emailRequired: 'Введите email',
        generalError: 'Произошла ошибка. Пожалуйста, попробуйте позже.',
        invalidEmail: 'Неверный формат email',
      }
    },
    az: {
      title: 'Şifrə bərpası',
      subtitle: 'Qeydiyyat zamanı göstərilən email daxil edin',
      email: 'Email',
      submit: 'Göndər',
      backToLogin: 'Giriş səhifəsinə qayıt',
      successMessage: 'Şifrə bərpası üçün təlimatlar göstərilən emailə göndərildi',
      languages: {
        ru: 'Rus',
        az: 'Azərbaycan',
        en: 'İngilis',
      },
      errors: {
        emailRequired: 'Email daxil edin',
        generalError: 'Xəta baş verdi. Zəhmət olmasa, sonra yenidən cəhd edin.',
        invalidEmail: 'Yanlış email formatı',
      }
    },
    en: {
      title: 'Password Recovery',
      subtitle: 'Enter the email provided during registration',
      email: 'Email',
      submit: 'Submit',
      backToLogin: 'Back to login',
      successMessage: 'Password recovery instructions have been sent to the provided email',
      languages: {
        ru: 'Russian',
        az: 'Azerbaijani',
        en: 'English',
      },
      errors: {
        emailRequired: 'Email is required',
        generalError: 'An error occurred. Please try again later.',
        invalidEmail: 'Invalid email format',
      }
    }
  };

  const t = translations[language as keyof typeof translations];

  return (
    <Container component="main" maxWidth="xs">
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
                onChange={(e) => setLanguage(e.target.value)}
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
          
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            {t.subtitle}
          </Typography>
          
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          
          {success ? (
            <>
              <Alert severity="success" sx={{ mb: 3 }}>
                {t.successMessage}
              </Alert>
              
              <Button
                component={Link}
                href="/auth/login"
                fullWidth
                variant="outlined"
                startIcon={<ArrowBack />}
              >
                {t.backToLogin}
              </Button>
            </>
          ) : (
            <Box component="form" onSubmit={handleSubmit} noValidate>
              <TextField
                margin="normal"
                required
                fullWidth
                id="email"
                label={t.email}
                name="email"
                autoComplete="email"
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
              
              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={loading}
                sx={{ 
                  mt: 3, 
                  mb: 2,
                  py: 1.5
                }}
              >
                {loading ? <CircularProgress size={24} /> : t.submit}
              </Button>
              
              <Button
                component={Link}
                href="/auth/login"
                fullWidth
                variant="text"
                startIcon={<ArrowBack />}
                sx={{ mt: 1 }}
              >
                {t.backToLogin}
              </Button>
            </Box>
          )}
        </Paper>
      </Box>
    </Container>
  );
} 