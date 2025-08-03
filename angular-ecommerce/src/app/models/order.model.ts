export interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  total: number;
  status: OrderStatus;
  createdAt: Date;
  updatedAt: Date;
  statusHistory?: StatusChange[];
}

export interface StatusChange {
  fromStatus: OrderStatus;
  toStatus: OrderStatus;
  changedAt: Date;
  changedBy: string; // admin ID or username
  notes?: string;
}

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

export enum OrderStatus {
  PENDING = 'Pending',
  PROCESSING = 'Processing',
  SHIPPED = 'Shipped',
  DELIVERED = 'Delivered',
  CANCELLED = 'Cancelled'
}

export interface OrderSummary {
  id: string;
  totalItems: number;
  total: number;
  status: OrderStatus;
  createdAt: Date;
} 