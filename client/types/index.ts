// Product Types
export interface Product {
  id: string;
  name: string;
  code: string;
  description: string;
  category: string;
  price: number;
  currency: string;
  quantity: number;
  unit: string;
  status: ProductStatus;
  images: string[];
  specifications?: Record<string, string | number | boolean>;
  dateAdded: string;
}

export type ProductStatus = 'active' | 'inactive' | 'pending' | 'rejected';

export interface ProductFilter {
  search: string;
  category: string;
  status: string;
  sortBy: string;
  sortOrder: string;
}

// Order Types
export type OrderStatus = 
  | 'pre_order'
  | 'new'
  | 'confirmed' 
  | 'in_progress' 
  | 'shipped' 
  | 'delivered' 
  | 'completed' 
  | 'cancelled' 
  | 'error';

export interface Order {
  id: string;
  orderNumber: string;
  supplier: string;
  customer: string;
  items: OrderItem[];
  totalAmount: number;
  currency: string;
  status: OrderStatus;
  deliveryDetails: DeliveryDetails;
  paymentDetails: PaymentDetails;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  product: string;
  productName: string;
  quantity: number;
  price: number;
  unit: string;
  subtotal: number;
}

export interface DeliveryDetails {
  address: string;
  city: string;
  country: string;
  postalCode?: string;
  contactPerson: string;
  contactPhone: string;
  estimatedDeliveryDate: string;
  actualDeliveryDate?: string;
  trackingNumber?: string;
  shippingMethod: string;
}

export interface PaymentDetails {
  method: string;
  status: 'pending' | 'paid' | 'failed';
  transactionId?: string;
  paidAt?: string;
  dueDate: string;
}

export interface OrderFilter {
  search: string;
  status: string;
  sortBy: string;
  sortOrder: string;
}

// User Types
export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  company: string;
  position?: string;
  phone?: string;
  avatar?: string;
  language: string;
}

export type UserRole = 'supplier' | 'admin' | 'manager'; 