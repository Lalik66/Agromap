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
  Stepper,
  Step,
  StepLabel,
  Checkbox,
  FormControlLabel,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Language as LanguageIcon,
  ArrowBack,
} from '@mui/icons-material';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const router = useRouter();
  
  const [language, setLanguage] = useState('ru');
  const [menuOpen, setMenuOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeStep, setActiveStep] = useState(0);
  
  const [formData, setFormData] = useState({
    companyName: '',
    taxId: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    position: '',
    acceptTerms: false,
  });
  
  const [formErrors, setFormErrors] = useState({
    companyName: '',
    taxId: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    position: '',
    acceptTerms: '',
  });
  
  // Переводы
  const translations = {
    ru: {
      title: 'Регистрация поставщика',
      steps: ['Информация о компании', 'Учетные данные', 'Контактное лицо'],
      companyName: 'Название компании',
      taxId: 'ИНН/ОГРН',
      email: 'Электронная почта',
      phone: 'Телефон',
      password: 'Пароль',
      confirmPassword: 'Подтвердите пароль',
      firstName: 'Имя',
      lastName: 'Фамилия',
      position: 'Должность',
      acceptTerms: 'Я принимаю условия пользовательского соглашения',
      next: 'Далее',
      back: 'Назад',
      register: 'Зарегистрироваться',
      alreadyRegistered: 'Уже зарегистрированы?',
      login: 'Войти',
      passwordRules: 'Пароль должен содержать не менее 8 символов, включая буквы и цифры',
      passwordsDoNotMatch: 'Пароли не совпадают',
      requiredField: 'Обязательное поле',
      invalidEmail: 'Некорректный формат email',
      invalidPhone: 'Некорректный формат телефона',
      termsRequired: 'Необходимо принять условия пользовательского соглашения',
      success: 'Регистрация успешно завершена! Проверьте вашу почту для подтверждения.',
      languages: {
        ru: 'Русский',
        az: 'Азербайджанский',
        en: 'Английский',
      },
    },
    az: {
      title: 'Təchizatçı qeydiyyatı',
      steps: ['Şirkət məlumatları', 'Hesab məlumatları', 'Əlaqə şəxsi'],
      companyName: 'Şirkətin adı',
      taxId: 'VÖEN',
      email: 'E-poçt',
      phone: 'Telefon',
      password: 'Şifrə',
      confirmPassword: 'Şifrəni təsdiqləyin',
      firstName: 'Ad',
      lastName: 'Soyad',
      position: 'Vəzifə',
      acceptTerms: 'İstifadəçi razılaşmasının şərtlərini qəbul edirəm',
      next: 'Növbəti',
      back: 'Geri',
      register: 'Qeydiyyatdan keçin',
      alreadyRegistered: 'Artıq qeydiyyatdan keçmisiniz?',
      login: 'Daxil olun',
      passwordRules: 'Şifrə ən azı 8 simvol, hərf və rəqəmlər daxil olmaqla təşkil olunmalıdır',
      passwordsDoNotMatch: 'Şifrələr uyğun gəlmir',
      requiredField: 'Tələb olunan sahə',
      invalidEmail: 'Yanlış e-poçt formatı',
      invalidPhone: 'Yanlış telefon formatı',
      termsRequired: 'İstifadəçi razılaşmasının şərtlərini qəbul etmək lazımdır',
      success: 'Qeydiyyat uğurla tamamlandı! Təsdiq üçün e-poçtunuzu yoxlayın.',
      languages: {
        ru: 'Rus dili',
        az: 'Azərbaycan dili',
        en: 'İngilis dili',
      },
    },
    en: {
      title: 'Supplier Registration',
      steps: ['Company Information', 'Account Details', 'Contact Person'],
      companyName: 'Company Name',
      taxId: 'Tax ID',
      email: 'Email',
      phone: 'Phone',
      password: 'Password',
      confirmPassword: 'Confirm Password',
      firstName: 'First Name',
      lastName: 'Last Name',
      position: 'Position',
      acceptTerms: 'I accept the terms of the user agreement',
      next: 'Next',
      back: 'Back',
      register: 'Register',
      alreadyRegistered: 'Already registered?',
      login: 'Log in',
      passwordRules: 'Password must contain at least 8 characters, including letters and numbers',
      passwordsDoNotMatch: 'Passwords do not match',
      requiredField: 'Required field',
      invalidEmail: 'Invalid email format',
      invalidPhone: 'Invalid phone format',
      termsRequired: 'You must accept the terms of the user agreement',
      success: 'Registration completed successfully! Check your email for confirmation.',
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
  
  const handleClickShowConfirmPassword = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, checked } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'acceptTerms' ? checked : value,
    });
    
    // Сбрасываем ошибки при изменении поля
    setFormErrors({
      ...formErrors,
      [name]: '',
    });
  };
  
  const validateStep = (step: number) => {
    let isValid = true;
    const errors = { ...formErrors };
    
    if (step === 0) {
      // Валидация данных компании
      if (!formData.companyName) {
        errors.companyName = t.requiredField;
        isValid = false;
      }
      
      if (!formData.taxId) {
        errors.taxId = t.requiredField;
        isValid = false;
      }
    } else if (step === 1) {
      // Валидация учетных данных
      if (!formData.email) {
        errors.email = t.requiredField;
        isValid = false;
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        errors.email = t.invalidEmail;
        isValid = false;
      }
      
      if (!formData.phone) {
        errors.phone = t.requiredField;
        isValid = false;
      } else if (!/^\+?[0-9]{10,15}$/.test(formData.phone.replace(/[\s()-]/g, ''))) {
        errors.phone = t.invalidPhone;
        isValid = false;
      }
      
      if (!formData.password) {
        errors.password = t.requiredField;
        isValid = false;
      } else if (formData.password.length < 8) {
        errors.password = t.passwordRules;
        isValid = false;
      }
      
      if (!formData.confirmPassword) {
        errors.confirmPassword = t.requiredField;
        isValid = false;
      } else if (formData.password !== formData.confirmPassword) {
        errors.confirmPassword = t.passwordsDoNotMatch;
        isValid = false;
      }
    } else if (step === 2) {
      // Валидация контактного лица
      if (!formData.firstName) {
        errors.firstName = t.requiredField;
        isValid = false;
      }
      
      if (!formData.lastName) {
        errors.lastName = t.requiredField;
        isValid = false;
      }
      
      if (!formData.position) {
        errors.position = t.requiredField;
        isValid = false;
      }
      
      if (!formData.acceptTerms) {
        errors.acceptTerms = t.termsRequired;
        isValid = false;
      }
    }
    
    setFormErrors(errors);
    return isValid;
  };
  
  const handleNext = () => {
    if (validateStep(activeStep)) {
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
    }
  };
  
  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateStep(activeStep)) {
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      // Имитация отправки данных на сервер
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // После успешной регистрации показываем сообщение об успехе
      // и редиректим на страницу входа
      alert(t.success);
      router.push('/supplier/auth/login');
    } catch (err) {
      setError('Ошибка при регистрации. Пожалуйста, попробуйте позже.');
      console.error('Registration error:', err);
    } finally {
      setLoading(false);
    }
  };
  
  // Шаги формы
  const getStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <>
            <TextField
              margin="normal"
              required
              fullWidth
              id="companyName"
              label={t.companyName}
              name="companyName"
              value={formData.companyName}
              onChange={handleChange}
              error={!!formErrors.companyName}
              helperText={formErrors.companyName}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              id="taxId"
              label={t.taxId}
              name="taxId"
              value={formData.taxId}
              onChange={handleChange}
              error={!!formErrors.taxId}
              helperText={formErrors.taxId}
            />
          </>
        );
      case 1:
        return (
          <>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label={t.email}
              name="email"
              type="email"
              autoComplete="email"
              value={formData.email}
              onChange={handleChange}
              error={!!formErrors.email}
              helperText={formErrors.email}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              id="phone"
              label={t.phone}
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              error={!!formErrors.phone}
              helperText={formErrors.phone}
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
            <FormControl
              variant="outlined"
              fullWidth
              margin="normal"
              required
              error={!!formErrors.confirmPassword}
            >
              <InputLabel htmlFor="confirmPassword">{t.confirmPassword}</InputLabel>
              <OutlinedInput
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                value={formData.confirmPassword}
                onChange={handleChange}
                endAdornment={
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle confirm password visibility"
                      onClick={handleClickShowConfirmPassword}
                      edge="end"
                    >
                      {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                }
                label={t.confirmPassword}
              />
              {formErrors.confirmPassword && (
                <FormHelperText>{formErrors.confirmPassword}</FormHelperText>
              )}
            </FormControl>
          </>
        );
      case 2:
        return (
          <>
            <TextField
              margin="normal"
              required
              fullWidth
              id="firstName"
              label={t.firstName}
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              error={!!formErrors.firstName}
              helperText={formErrors.firstName}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              id="lastName"
              label={t.lastName}
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              error={!!formErrors.lastName}
              helperText={formErrors.lastName}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              id="position"
              label={t.position}
              name="position"
              value={formData.position}
              onChange={handleChange}
              error={!!formErrors.position}
              helperText={formErrors.position}
            />
            <FormControlLabel
              control={
                <Checkbox
                  name="acceptTerms"
                  checked={formData.acceptTerms}
                  onChange={handleChange}
                  color="primary"
                />
              }
              label={t.acceptTerms}
              sx={{ mt: 2 }}
            />
            {formErrors.acceptTerms && (
              <FormHelperText error>{formErrors.acceptTerms}</FormHelperText>
            )}
          </>
        );
      default:
        return 'Unknown step';
    }
  };
  
  return (
    <Container maxWidth="md" sx={{ pt: 4, pb: 4 }}>
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
        
        <Box sx={{ width: '100%', mb: 4 }}>
          <Stepper activeStep={activeStep} alternativeLabel>
            {t.steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </Box>
        
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1, width: '100%' }}>
          {getStepContent(activeStep)}
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
            <Button
              variant="outlined"
              onClick={activeStep === 0 ? () => router.push('/supplier/auth/login') : handleBack}
              startIcon={activeStep === 0 ? <ArrowBack /> : undefined}
            >
              {activeStep === 0 ? t.login : t.back}
            </Button>
            
            {activeStep === t.steps.length - 1 ? (
              <Button
                type="submit"
                variant="contained"
                disabled={loading}
              >
                {loading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  t.register
                )}
              </Button>
            ) : (
              <Button
                variant="contained"
                onClick={handleNext}
              >
                {t.next}
              </Button>
            )}
          </Box>
          
          {activeStep === t.steps.length - 1 && (
            <Grid container justifyContent="center" sx={{ mt: 3 }}>
              <Grid item>
                <Typography variant="body2" sx={{ display: 'inline' }}>
                  {t.alreadyRegistered}{' '}
                </Typography>
                <Link
                  href="/supplier/auth/login"
                  variant="body2"
                  underline="hover"
                >
                  {t.login}
                </Link>
              </Grid>
            </Grid>
          )}
        </Box>
      </Paper>
    </Container>
  );
} 