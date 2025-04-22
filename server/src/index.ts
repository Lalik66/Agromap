import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config();

// Import routes
import userRoutes from './routes/userRoutes';
import productRoutes from './routes/productRoutes';
import categoryRoutes from './routes/categoryRoutes';
import offerRoutes from './routes/offerRoutes';
import orderRoutes from './routes/orderRoutes';
import templateRoutes from './routes/templateRoutes';
import commentRoutes from './routes/commentRoutes';
import notificationRoutes from './routes/notificationRoutes';

// Import middleware
import { errorHandler, notFound } from './middlewares/errorMiddleware';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Static files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// API Routes
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/offers', offerRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/templates', templateRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/notifications', notificationRoutes);

// API root route
app.get('/api', (req, res) => {
  res.json({ message: 'Welcome to Agromap API' });
});

// Заменяем обработчик для неизвестных маршрутов
app.get('*', (req, res) => {
  res.json({ message: 'Agromap API Server. Please use /api routes to access API endpoints.' });
});

// Error handling middleware
app.use(errorHandler);

// Connect to MongoDB and start server
mongoose
  .connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/agromap')
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  });

export default app; 