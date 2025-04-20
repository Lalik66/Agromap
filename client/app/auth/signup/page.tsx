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
  Stepper,
  Step,
  StepLabel,
  Grid,
} from '@mui/material';
import { ArrowBack, Language, Visibility, VisibilityOff } from '@mui/icons-material';
import Image from 'next/image';
import Link from 'next/link';
import axios from 'axios';

export default function SignupPage() {
  const [activeStep, setActiveStep] = useState(0);
  const [language, setLanguage] = useState('ru');
  
  const [formData, setFormData] = useState({
    companyName: '',
    taxId: '',
    email: '',
    phone: '',
    address: '',
    contactPerson: '',
    username: '',
    password: '',
    confirmPassword: '',
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleNext = () => {
    // Валидация первого шага
    if (activeStep === 0) {
      if (!formData.companyName || !formData.taxId || !formData.email || !formData.phone) {
        setError(t.errors.requiredFields);
        return;
      }
      setError(null);
      setActiveStep(1);
    }
  };

  const handleBack = () => {
    setActiveStep(activeStep - 1);
    setError(null);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    
    // Валидация второго шага
    if (!formData.username || !formData.password || !formData.confirmPassword) {
      setError(t.errors.requiredFields);
      return;
    }
    
    if (formData.password !== formData.confirmPassword) {
      setError(t.errors.passwordsMismatch);
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // В реальном проекте здесь будет API запрос на регистрацию
      await axios.post('/api/auth/signup', formData);
      setSuccess(true);
    } catch (err: any) {
      setError(err.response?.data?.message || t.errors.generalError);
    } finally {
      setLoading(false);
    }
  };

  const translations = {
    ru: {
      title: 'Регистрация поставщика',
      steps: ['Информация о компании', 'Данные для входа'],
      companyName: 'Название компании',
      taxId: 'ИНН/КПП',
      email: 'Email',
      phone: 'Телефон',
      address: 'Адрес',
      contactPerson: 'Контактное лицо',
      username: 'Логин',
      password: 'Пароль',
      confirmPassword: 'Подтвердите пароль',
      next: 'Далее',
      back: 'Назад',
      submit: 'Зарегистрироваться',
      backToLogin: 'Вернуться к авторизации',
      successMessage: 'Регистрация успешно завершена. Проверьте вашу электронную почту для подтверждения.',
      alreadyHaveAccount: 'Уже есть аккаунт?',
      login: 'Войти',
      languages: {
        ru: 'Русский',
        az: 'Азербайджанский',
        en: 'Английский',
      },
      errors: {
        requiredFields: 'Пожалуйста, заполните все обязательные поля',
        passwordsMismatch: 'Пароли не совпадают',
        generalError: 'Произошла ошибка. Пожалуйста, попробуйте позже.',
        invalidEmail: 'Неверный формат email',
      }
    },
    az: {
      title: 'Təchizatçı qeydiyyatı',
      steps: ['Şirkət məlumatları', 'Giriş məlumatları'],
      companyName: 'Şirkətin adı',
      taxId: 'VÖEN',
      email: 'Email',
      phone: 'Telefon',
      address: 'Ünvan',
      contactPerson: 'Əlaqə şəxsi',
      username: 'İstifadəçi adı',
      password: 'Şifrə',
      confirmPassword: 'Şifrəni təsdiqləyin',
      next: 'İrəli',
      back: 'Geri',
      submit: 'Qeydiyyatdan keç',
      backToLogin: 'Giriş səhifəsinə qayıt',
      successMessage: 'Qeydiyyat uğurla tamamlandı. Təsdiq üçün e-poçtunuzu yoxlayın.',
      alreadyHaveAccount: 'Artıq hesabınız var?',
      login: 'Daxil ol',
      languages: {
        ru: 'Rus',
        az: 'Azərbaycan',
        en: 'İngilis',
      },
      errors: {
        requiredFields: 'Zəhmət olmasa, bütün tələb olunan sahələri doldurun',
        passwordsMismatch: 'Şifrələr uyğun gəlmir',
        generalError: 'Xəta baş verdi. Zəhmət olmasa, sonra yenidən cəhd edin.',
        invalidEmail: 'Yanlış email formatı',
      }
    },
    en: {
      title: 'Supplier Registration',
      steps: ['Company Information', 'Login Details'],
      companyName: 'Company Name',
      taxId: 'Tax ID',
      email: 'Email',
      phone: 'Phone',
      address: 'Address',
      contactPerson: 'Contact Person',
      username: 'Username',
      password: 'Password',
      confirmPassword: 'Confirm Password',
      next: 'Next',
      back: 'Back',
      submit: 'Register',
      backToLogin: 'Back to login',
      successMessage: 'Registration completed successfully. Check your email for confirmation.',
      alreadyHaveAccount: 'Already have an account?',
      login: 'Login',
      languages: {
        ru: 'Russian',
        az: 'Azerbaijani',
        en: 'English',
      },
      errors: {
        requiredFields: 'Please fill in all required fields',
        passwordsMismatch: 'Passwords do not match',
        generalError: 'An error occurred. Please try again later.',
        invalidEmail: 'Invalid email format',
      }
    }
  };

  const t = translations[language as keyof typeof translations];

  return (
    <Container component="main" maxWidth="md">
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
          
          <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
            {t.steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
          
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
            <Box component="form" onSubmit={activeStep === 1 ? handleSubmit : undefined} noValidate>
              {activeStep === 0 ? (
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      required
                      fullWidth
                      id="companyName"
                      label={t.companyName}
                      name="companyName"
                      value={formData.companyName}
                      onChange={handleInputChange}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      required
                      fullWidth
                      id="taxId"
                      label={t.taxId}
                      name="taxId"
                      value={formData.taxId}
                      onChange={handleInputChange}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      required
                      fullWidth
                      id="email"
                      label={t.email}
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      required
                      fullWidth
                      id="phone"
                      label={t.phone}
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      id="address"
                      label={t.address}
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      id="contactPerson"
                      label={t.contactPerson}
                      name="contactPerson"
                      value={formData.contactPerson}
                      onChange={handleInputChange}
                    />
                  </Grid>
                </Grid>
              ) : (
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      required
                      fullWidth
                      id="username"
                      label={t.username}
                      name="username"
                      value={formData.username}
                      onChange={handleInputChange}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      required
                      fullWidth
                      id="password"
                      label={t.password}
                      name="password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={handleInputChange}
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
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      required
                      fullWidth
                      id="confirmPassword"
                      label={t.confirmPassword}
                      name="confirmPassword"
                      type={showPassword ? "text" : "password"}
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                    />
                  </Grid>
                </Grid>
              )}
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
                {activeStep === 0 ? (
                  <Box sx={{ flex: 1, textAlign: 'left', mt: 2 }}>
                    <Typography variant="body2">
                      {t.alreadyHaveAccount} <Link href="/auth/login">{t.login}</Link>
                    </Typography>
                  </Box>
                ) : (
                  <Button onClick={handleBack} variant="outlined" startIcon={<ArrowBack />}>
                    {t.back}
                  </Button>
                )}
                
                {activeStep === 0 ? (
                  <Button
                    variant="contained"
                    size="large"
                    onClick={handleNext}
                    sx={{ minWidth: 120 }}
                  >
                    {t.next}
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    disabled={loading}
                    sx={{ minWidth: 120 }}
                  >
                    {loading ? <CircularProgress size={24} /> : t.submit}
                  </Button>
                )}
              </Box>
            </Box>
          )}
        </Paper>
      </Box>
    </Container>
  );
} 