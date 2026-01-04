
import React, { useState, useEffect } from 'react';
import { User, Order } from '../types';
import { db } from '../store';
import { Package, Truck, CheckCircle2, XCircle, ChevronRight, Clock, Star } from 'lucide-react';
import { formatThaiDate } from '../constants';

interface Props {
  currentUser: User;
}

const OrdersPage: React.FC<Props> = ({ currentUser }) => {
  const [tab, setTab] = useState<'BUY' | 'SELL'>('BUY');
  const [orders, setOrders] = useState<Order[]>([]);
  const [showReviewModal, setShowReviewModal] = useState<Order | null>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  useEffect(() => {
    const list = db.getOrders();
    setOrders(list);
    
    const handleUpdate = () => setOrders([...db.getOrders()]);
    window.addEventListener('db-update', handleUpdate);
    return () => window.removeEventListener('db-update', handleUpdate);
  }, []);

  const myOrders = orders.filter(o => tab === 'BUY' ? o.buyerUid === currentUser.uid : o.sellerUid === currentUser.uid)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const updateStatus = (id: string, status: Order['status'], buyerUid: string) => {
    db.updateOrderStatus(id, status);
    
    const statusText = {
        ACCEPTED: 'รับออเดอร์แล้ว',
        PREPARING: 'กำลังเตรียมอาหาร',
        DELIVERING: 'กำลังจัดส่ง',
        COMPLETED: 'จัดส่งสำเร็จแล้ว',
        CANCELLED: 'ออเดอร์ถูกยกเลิก'
    }[status];

    db.addNotification({
      id: 'notif-' + Date.now(),
      userUid: buyerUid,
      title: `อัปเดตสถานะออเดอร์: ${statusText} ✅`,
      message: `ออเดอร์ของคุณอยู่ในขั้นตอน ${statusText}`,
      type: 'ORDER',
      isRead: false,
      timestamp: new Date().toISOString()
    });
  };

  const handleReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!showReviewModal) return;

    db.addReview({
      id: 'rev-' + Date.now(),
      orderId: showReviewModal.id,
      sellerUid: showReviewModal.sellerUid,
      buyerUid: currentUser.uid,
      rating,
      comment,
      timestamp: new Date().toISOString()
    });

    const reviews = db.getReviews().filter(r => r.sellerUid === showReviewModal.sellerUid);
    const avg = reviews.length > 0 ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length : 5;
    db.updateUser(showReviewModal.sellerUid, { rating: avg, reviewCount: reviews.length });

    // Correctly update the order using the store method
    db.updateOrder(showReviewModal.id, { hasReviewed: true });

    setShowReviewModal(null);
    setRating(5);
    setComment('');
  };

  const StatusBadge = ({ status }: { status: Order['status'] }) => {
    const config = {
      PENDING: { text: 'รอการตอบรับ', color: 'bg-yellow-100 text-yellow-900 border-yellow-200', icon: Clock },
      ACCEPTED: { text: 'รับออเดอร์แล้ว', color: 'bg-blue-100 text-blue-900 border-blue-200', icon: CheckCircle2 },
      PREPARING: { text: 'กำลังเตรียม', color: 'bg-purple-100 text-purple-900 border-purple-200', icon: Package },
      DELIVERING: { text: 'กำลังจัดส่ง', color: 'bg-orange-100 text-orange-900 border-orange-200', icon: Truck },
      COMPLETED: { text: 'สำเร็จ', color: 'bg-green-100 text-green-900 border-green-200', icon: CheckCircle2 },
      CANCELLED: { text: 'ยกเลิก', color: 'bg-red-100 text-red-900 border-red-200', icon: XCircle },
    }[status];
    const Icon = config.icon;
    return (
      <span className={`flex items-center space-x-1 px-3 py-1 rounded-full text-[11px] font-extrabold border shadow-sm ${config.color}`}>
        <Icon size={12} strokeWidth={3} />
        <span>{config.text}</span>
      </span>
    );
  };

  return (
    <div className="p-4 space-y-6">
      <h2 className="text-3xl font-extrabold text-slate-900">ออเดอร์ของฉัน</h2>
      
      <div className="flex bg-slate-200 p-1.5 rounded-2xl">
        <button onClick={() => setTab('BUY')} className={`flex-1 py-3 rounded-xl font-extrabold text-sm transition-all ${tab === 'BUY' ? 'bg-white text-pink-700 shadow-md scale-100' : 'text-slate-700 scale-95'}`}>สั่งซื้อ (ซื้อ)</button>
        <button onClick={() => setTab('SELL')} className={`flex-1 py-3 rounded-xl font-extrabold text-sm transition-all ${tab === 'SELL' ? 'bg-white text-blue-700 shadow-md scale-100' : 'text-slate-700 scale-95'}`}>รายการขาย (ขาย)</button>
      </div>

      <div className="space-y-5">
        {myOrders.length === 0 ? (
          <div className="text-center py-24 text-slate-800 space-y-4">
             <div className="text-6xl">📄</div>
             <p className="text-xl font-extrabold">ยังไม่มีคำสั่งซื้อในขณะนี้</p>
          </div>
        ) : (
          myOrders.map(order => (
            <div key={order.id} className="bg-white rounded-[32px] p-5 shadow-lg border-2 border-slate-100 space-y-5 transition-all active:scale-[0.99]">
               <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <p className="text-[11px] text-slate-700 font-mono font-bold bg-slate-100 w-fit px-2 py-0.5 rounded-lg">#{order.id.slice(-6).toUpperCase()}</p>
                    <h4 className="font-extrabold text-slate-900 text-lg leading-tight">{order.productName}</h4>
                    <p className="text-sm text-slate-900 font-bold">จำนวน {order.quantity} ชุด | <span className="text-pink-700 text-base">฿{order.totalPrice}</span></p>
                  </div>
                  <StatusBadge status={order.status} />
               </div>

               <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                    <p className="text-[10px] text-slate-600 font-extrabold uppercase mb-1">จุดนัดรับ</p>
                    <p className="text-slate-900 font-extrabold text-sm leading-snug line-clamp-2">{order.pickupLocation}</p>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                    <p className="text-[10px] text-slate-600 font-extrabold uppercase mb-1">เวลานัดรับ</p>
                    <p className="text-slate-900 font-extrabold text-sm leading-snug">{formatThaiDate(order.pickupTime)}</p>
                  </div>
               </div>

               {tab === 'SELL' && order.status !== 'COMPLETED' && order.status !== 'CANCELLED' && (
                  <div className="flex flex-col space-y-2 pt-2">
                    <div className="flex space-x-2">
                      {order.status === 'PENDING' && (
                        <button onClick={() => updateStatus(order.id, 'ACCEPTED', order.buyerUid)} className="flex-1 py-4 bg-blue-600 text-white rounded-2xl text-sm font-extrabold shadow-lg active:scale-95 transition-transform">รับออเดอร์</button>
                      )}
                      {order.status === 'ACCEPTED' && (
                        <button onClick={() => updateStatus(order.id, 'PREPARING', order.buyerUid)} className="flex-1 py-4 bg-purple-600 text-white rounded-2xl text-sm font-extrabold shadow-lg active:scale-95 transition-transform">เริ่มเตรียมอาหาร</button>
                      )}
                      {order.status === 'PREPARING' && (
                        <button onClick={() => updateStatus(order.id, 'DELIVERING', order.buyerUid)} className="flex-1 py-4 bg-orange-600 text-white rounded-2xl text-sm font-extrabold shadow-lg active:scale-95 transition-transform">เริ่มจัดส่ง</button>
                      )}
                      {order.status === 'DELIVERING' && (
                        <button onClick={() => updateStatus(order.id, 'COMPLETED', order.buyerUid)} className="flex-1 py-4 bg-green-600 text-white rounded-2xl text-sm font-extrabold shadow-lg active:scale-95 transition-transform">จัดส่งสำเร็จแล้ว</button>
                      )}
                      <button onClick={() => updateStatus(order.id, 'CANCELLED', order.buyerUid)} className="px-5 py-4 border-2 border-red-200 text-red-600 rounded-2xl font-extrabold active:bg-red-50"><XCircle size={22} strokeWidth={3} /></button>
                    </div>
                  </div>
               )}

               {tab === 'BUY' && order.status === 'COMPLETED' && !order.hasReviewed && (
                  <button 
                    onClick={() => setShowReviewModal(order)}
                    className="w-full py-4 border-2 border-dashed border-pink-400 bg-pink-50/30 text-pink-700 rounded-2xl text-sm font-extrabold active:bg-pink-100 transition-colors shadow-sm"
                  >
                    ประเมินรสชาติความอร่อย ⭐
                  </button>
               )}
            </div>
          ))
        )}
      </div>

      {/* Review Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-6 animate-in fade-in">
          <div className="bg-white rounded-[40px] w-full max-w-sm p-8 space-y-7 shadow-2xl scale-in-95 animate-in">
            <div className="space-y-2 text-center">
              <h3 className="text-2xl font-extrabold text-slate-900">รีวิวเมนูนี้</h3>
              <p className="text-slate-700 font-bold text-sm">ออเดอร์ {showReviewModal.productName}</p>
            </div>
            
            <div className="flex justify-center space-x-3">
              {[1, 2, 3, 4, 5].map(s => (
                <button key={s} onClick={() => setRating(s)} className={`transition-all duration-200 ${s <= rating ? 'text-yellow-500 scale-125 drop-shadow-sm' : 'text-slate-200 scale-100'}`}>
                  <Star size={40} fill={s <= rating ? 'currentColor' : 'none'} strokeWidth={2.5} />
                </button>
              ))}
            </div>
            
            <textarea 
              placeholder="รสชาติถูกปากไหม? มีอะไรอยากแนะนำผู้ขายหรือไม่..." 
              value={comment}
              onChange={e => setComment(e.target.value)}
              className="w-full bg-slate-50 border-2 border-slate-200 rounded-3xl p-5 text-slate-900 font-bold outline-none focus:ring-4 focus:ring-pink-100 focus:border-pink-500 min-h-[140px] transition-all"
            />
            
            <div className="flex flex-col space-y-3">
               <button onClick={handleReview} className="w-full py-5 bg-pink-600 text-white rounded-2xl font-extrabold text-lg shadow-xl shadow-pink-100 active:scale-95 transition-transform">ส่งคำรีวิว</button>
               <button onClick={() => setShowReviewModal(null)} className="w-full py-3 text-slate-600 font-bold">ยังไม่สะดวกตอนนี้</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdersPage;
