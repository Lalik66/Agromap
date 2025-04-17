'use client';

import { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Container, 
  Grid, 
  Card, 
  CardContent, 
  Button,
  Stack,
  Paper
} from '@mui/material';
import { MapOutlined, InsertChartOutlined, WaterDrop, Agriculture } from '@mui/icons-material';
import Link from 'next/link';

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);

  return (
    <Box sx={{ minHeight: '100vh', py: 4 }}>
      {/* Hero Section */}
      <Box 
        sx={{ 
          bgcolor: 'background.paper', 
          pt: 8, 
          pb: 6, 
          borderRadius: { xs: 0, sm: 2 },
          backgroundImage: 'linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.2)), url(/images/hero-bg.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          color: 'white',
          mb: 4
        }}
      >
        <Container maxWidth="lg">
          <Typography
            variant="h2"
            component="h1"
            gutterBottom
            fontWeight="bold"
            textAlign="center"
          >
            Agromap Platform
          </Typography>
          <Typography 
            variant="h5" 
            component="p" 
            sx={{ mb: 4 }} 
            textAlign="center"
          >
            Интеллектуальное решение для управления сельскохозяйственными территориями
          </Typography>
          <Stack 
            direction={{ xs: 'column', sm: 'row' }} 
            spacing={2} 
            justifyContent="center"
          >
            <Button 
              variant="contained" 
              color="primary" 
              size="large"
              component={Link}
              href="/map"
              startIcon={<MapOutlined />}
            >
              Открыть карту
            </Button>
            <Button 
              variant="outlined" 
              color="inherit" 
              size="large"
              component={Link}
              href="/analytics"
              startIcon={<InsertChartOutlined />}
            >
              Аналитика
            </Button>
          </Stack>
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxWidth="lg">
        <Typography
          variant="h4"
          component="h2"
          gutterBottom
          fontWeight="bold"
          textAlign="center"
          sx={{ mb: 4 }}
        >
          Возможности платформы
        </Typography>
        
        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 2 }}>
                  <MapOutlined color="primary" sx={{ fontSize: 60 }} />
                </Box>
                <Typography variant="h5" component="h3" gutterBottom textAlign="center">
                  Интерактивная карта
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Визуализация сельскохозяйственных территорий с возможностью отображения различных слоев данных
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 2 }}>
                  <WaterDrop color="primary" sx={{ fontSize: 60 }} />
                </Box>
                <Typography variant="h5" component="h3" gutterBottom textAlign="center">
                  Мониторинг увлажненности
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Отслеживание увлажненности почвы и прогнозирование необходимости полива
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 2 }}>
                  <Agriculture color="primary" sx={{ fontSize: 60 }} />
                </Box>
                <Typography variant="h5" component="h3" gutterBottom textAlign="center">
                  Управление урожаем
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Планирование севооборота, анализ продуктивности и рекомендации по оптимизации урожайности
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
} 