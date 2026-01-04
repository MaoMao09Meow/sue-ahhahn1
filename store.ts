
import { User, Product, Order, ChatMessage, Review, AppNotification } from './types';

class MockDB {
  private static STORAGE_KEY = 'SUE_AHHAHN_DB';

  private data: {
    users: User[];
    products: Product[];
    orders: Order[];
    chats: ChatMessage[];
    reviews: Review[];
    notifications: AppNotification[];
  };

  constructor() {
    const saved = localStorage.getItem(MockDB.STORAGE_KEY);
    if (saved) {
      this.data = JSON.parse(saved);
    } else {
      this.data = {
        users: [],
        products: [],
        orders: [],
        chats: [],
        reviews: [],
        notifications: []
      };
      this.save();
    }
  }

  private save() {
    localStorage.setItem(MockDB.STORAGE_KEY, JSON.stringify(this.data));
    window.dispatchEvent(new Event('db-update'));
  }

  // Users
  getUsers() { return this.data.users; }
  getUser(uid: string) { return this.data.users.find(u => u.uid === uid); }
  addUser(user: User) { 
    this.data.users.push(user); 
    this.save(); 
  }
  updateUser(uid: string, updates: Partial<User>) {
    const idx = this.data.users.findIndex(u => u.uid === uid);
    if (idx !== -1) {
      this.data.users[idx] = { ...this.data.users[idx], ...updates };
      this.save();
    }
  }

  toggleFollow(followerUid: string, targetUid: string) {
    const follower = this.getUser(followerUid);
    if (!follower) return;

    const isFollowing = follower.following.includes(targetUid);
    if (isFollowing) {
      follower.following = follower.following.filter(id => id !== targetUid);
    } else {
      follower.following.push(targetUid);
    }
    this.updateUser(followerUid, { following: follower.following });
  }

  // Products
  getProducts() { return this.data.products; }
  addProduct(p: Product) { this.data.products.push(p); this.save(); }
  updateProduct(id: string, updates: Partial<Product>) {
    const idx = this.data.products.findIndex(p => p.id === id);
    if (idx !== -1) {
      this.data.products[idx] = { ...this.data.products[idx], ...updates };
      this.save();
    }
  }
  deleteProduct(id: string) {
    this.data.products = this.data.products.filter(p => p.id !== id);
    this.save();
  }

  // Orders
  getOrders() { return this.data.orders; }
  addOrder(o: Order) { 
    this.data.orders.push(o); 
    // Reduce stock
    const product = this.data.products.find(p => p.id === o.productId);
    if (product) {
        product.stock -= o.quantity;
    }
    this.save(); 
  }
  updateOrder(id: string, updates: Partial<Order>) {
    const idx = this.data.orders.findIndex(o => o.id === id);
    if (idx !== -1) {
      this.data.orders[idx] = { ...this.data.orders[idx], ...updates };
      this.save();
    }
  }
  updateOrderStatus(id: string, status: Order['status']) {
    this.updateOrder(id, { status });
  }

  // Chats
  getChats() { return this.data.chats; }
  addChat(m: ChatMessage) { this.data.chats.push(m); this.save(); }
  deleteChat(id: string) {
    this.data.chats = this.data.chats.filter(c => c.id !== id);
    this.save();
  }

  // Reviews
  getReviews() { return this.data.reviews; }
  addReview(r: Review) { 
    this.data.reviews.push(r); 
    this.save(); 
  }
  updateReview(id: string, updates: Partial<Review>) {
    const idx = this.data.reviews.findIndex(r => r.id === id);
    if (idx !== -1) {
      this.data.reviews[idx] = { ...this.data.reviews[idx], ...updates };
      this.save();
    }
  }

  // Notifications
  getNotifications() { return this.data.notifications; }
  addNotification(n: AppNotification) { this.data.notifications.push(n); this.save(); }
  markNotifRead(id: string) {
    const n = this.data.notifications.find(not => not.id === id);
    if (n) { n.isRead = true; this.save(); }
  }
}

export const db = new MockDB();
