
export type UserRole = 'BUYER' | 'SELLER' | 'BOTH';

export interface User {
  uid: string;
  username: string;
  password?: string;
  displayName: string;
  profilePic: string;
  bio: string;
  friends: string[]; // UIDs
  following: string[]; // UIDs
  rating: number;
  reviewCount: number;
}

export interface Product {
  id: string;
  sellerUid: string;
  name: string;
  description: string;
  price: number;
  image: string;
  stock: number;
  isHidden: boolean;
}

export type OrderStatus = 'PENDING' | 'ACCEPTED' | 'PREPARING' | 'DELIVERING' | 'COMPLETED' | 'CANCELLED';

export interface Order {
  id: string;
  buyerUid: string;
  sellerUid: string;
  productId: string;
  productName: string;
  quantity: number;
  totalPrice: number;
  note: string;
  buyerName: string;
  pickupLocation: string;
  pickupTime: string; // ISO string
  status: OrderStatus;
  createdAt: string;
  hasReviewed: boolean;
}

export interface ChatMessage {
  id: string;
  senderUid: string;
  receiverUid: string; // Or roomId
  text?: string;
  image?: string;
  timestamp: string;
}

export interface Review {
  id: string;
  orderId: string;
  sellerUid: string;
  buyerUid: string;
  rating: number; // 1-5
  comment: string;
  reply?: string;
  timestamp: string;
}

export interface AppNotification {
  id: string;
  userUid: string;
  title: string;
  message: string;
  type: 'ORDER' | 'CHAT' | 'SYSTEM';
  isRead: boolean;
  timestamp: string;
}
