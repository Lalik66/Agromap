// server/scripts/seed.js
// TypeScript
require('ts-node').register();
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Загрузка переменных окружения
dotenv.config();

// Импорт моделей
const User = require('../src/models/userModel.ts').default;
const Category = require('../src/models/categoryModel.ts').default;
const Product = require('../src/models/productModel.ts').default;
const Offer = require('../src/models/offerModel.ts').default;
const Order = require('../src/models/orderModel.ts').default;

async function seedDatabase() {
  try {
    // Подключение к MongoDB
    console.log('MongoDB URI:', process.env.MONGODB_URI);
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://gashimzade0203:e3oex4p4zeehKS2p@clusteram.tln0jgv.mongodb.net/agromap_azerbaijan');
    console.log('Connected to MongoDB');

    // Очистка текущих данных
    await User.deleteMany({});
    await Category.deleteMany({});
    await Product.deleteMany({});
    await Offer.deleteMany({});
    await Order.deleteMany({});
    
    console.log('Existing data cleared');

    // Создание пользователей
    const hashedPassword = await bcrypt.hash('password123', 12);
    
    const admin = await User.create({
      name: "Админ",
      email: "admin@example.com",
      password: hashedPassword,
      role: "admin",
      status: "active",
      company: "Agromap",
      language: "ru",
      emailVerified: true
    });
    
    const supplier = await User.create({
      name: "Поставщик",
      email: "supplier@example.com",
      password: hashedPassword,
      role: "supplier",
      status: "active",
      company: "Фрукты и Овощи",
      language: "ru",
      emailVerified: true
    });
    
    const manager = await User.create({
      name: "Менеджер",
      email: "manager@example.com",
      password: hashedPassword,
      role: "manager",
      status: "active",
      company: "Agromap",
      language: "ru",
      emailVerified: true
    });
    
    console.log('Users created');

    // Создание категорий
    const fruitsCategory = await Category.create({
      name: "Фрукты",
      level: 1,
      path: "fruitsCat",
      status: "active",
      isLeaf: false
    });
    
    const veggiesCategory = await Category.create({
      name: "Овощи",
      level: 1,
      path: "veggiesCat",
      status: "active",
      isLeaf: false
    });
    
    const applesCategory = await Category.create({
      name: "Яблоки",
      parent: fruitsCategory._id,
      level: 2,
      path: `${fruitsCategory._id},applesCat`,
      status: "active",
      isLeaf: true,
      specifications: [
        {
          name: "Сорт",
          type: "string",
          required: true
        },
        {
          name: "Размер",
          type: "string",
          required: true,
          options: ["маленький", "средний", "большой"]
        }
      ]
    });
    
    const pearsCategory = await Category.create({
      name: "Груши",
      parent: fruitsCategory._id,
      level: 2,
      path: `${fruitsCategory._id},pearsCat`,
      status: "active",
      isLeaf: true,
      specifications: [
        {
          name: "Сорт",
          type: "string",
          required: true
        },
        {
          name: "Размер",
          type: "string",
          required: true,
          options: ["маленький", "средний", "большой"]
        }
      ]
    });
    
    console.log('Categories created');

    // Создание продуктов
    const appleProduct = await Product.create({
      name: "Яблоки Red Delicious",
      code: "APPLE-001",
      description: "Сладкие красные яблоки сорта Red Delicious",
      category: applesCategory._id,
      price: {
        value: 2.5,
        currency: "AZN"
      },
      quantity: 1000,
      unit: "kg",
      status: "active",
      supplier: supplier._id,
      specifications: {
        "Сорт": "Red Delicious",
        "Размер": "средний"
      },
      images: ["apple1.jpg", "apple2.jpg"],
      createdBy: supplier._id,
      updatedBy: supplier._id
    });
    
    const pearProduct = await Product.create({
      name: "Груши Conference",
      code: "PEAR-001",
      description: "Сочные груши сорта Conference",
      category: pearsCategory._id,
      price: {
        value: 3.2,
        currency: "AZN"
      },
      quantity: 500,
      unit: "kg",
      status: "active",
      supplier: supplier._id,
      specifications: {
        "Сорт": "Conference",
        "Размер": "средний"
      },
      images: ["pear1.jpg", "pear2.jpg"],
      createdBy: supplier._id,
      updatedBy: supplier._id
    });
    
    console.log('Products created');

    // Создание офера
    const offer = await Offer.create({
      product: appleProduct._id,
      supplier: supplier._id,
      price: {
        value: 2.5,
        currency: "AZN"
      },
      quantity: 100,
      unit: "kg",
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      status: "approved",
      deliveryTerms: {
        region: "Баку",
        estimatedDays: 2,
        shippingMethod: "Грузовой транспорт",
        incoterm: "EXW"
      },
      paymentTerms: {
        method: "bank_transfer",
        daysToPayment: 14
      },
      reviewedBy: admin._id,
      reviewedAt: new Date()
    });
    
    console.log('Offer created');

    // Создание заказа
    const order = await Order.create({
      orderNumber: "ORD-2310-000001",
      supplier: supplier._id,
      customer: admin._id,
      offer: offer._id,
      items: [
        {
          product: appleProduct._id,
          quantity: 100,
          price: 2.5,
          unit: "kg",
          subtotal: 250
        }
      ],
      totalAmount: 250,
      currency: "AZN",
      status: "confirmed",
      deliveryDetails: {
        address: "ул. Примерная, д. 123",
        city: "Баку",
        country: "Азербайджан",
        postalCode: "123456",
        contactPerson: "Иван Иванов",
        contactPhone: "+994 50 123 4567",
        estimatedDeliveryDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        shippingMethod: "Грузовой транспорт"
      },
      paymentDetails: {
        method: "bank_transfer",
        status: "pending",
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
      },
      history: [
        {
          status: "new",
          updatedBy: admin._id,
          updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          notes: "Заказ создан"
        },
        {
          status: "confirmed",
          updatedBy: supplier._id,
          updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
          notes: "Заказ подтвержден поставщиком"
        }
      ],
      createdBy: admin._id,
      updatedBy: supplier._id
    });
    
    console.log('Order created');
    console.log('Database seeded successfully!');
    
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();