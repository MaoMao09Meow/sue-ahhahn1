
import React, { useState, useEffect } from 'react';
import { User, Product } from '../types';
import { db } from '../store';
import { Plus, Search, ShoppingCart, User as UserIcon, X, MapPin, Clock, Star, Camera, Image as ImageIcon } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Props {
  currentUser: User;
}

const MenuPage: React.FC<Props> = ({ currentUser }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  // Order Form
  const [qty, setQty] = useState(1);
  const [note, setNote] = useState('');
  const [buyerName, setBuyerName] = useState(currentUser.displayName);
  const [location, setLocation] = useState('');
  const [pickupTime, setPickupTime] = useState('');

  // Add Product Form
  const [newName, setNewName] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [newStock, setNewStock] = useState('10');
  const [newDesc, setNewDesc] = useState('');
  const [newImage, setNewImage] = useState('');

  useEffect(() => {
    const list = db.getProducts().filter(p => !p.isHidden);
    setProducts(list);

    const handleUpdate = () => {
      setProducts(db.getProducts().filter(p => !p.isHidden));
    };
    window.addEventListener('db-update', handleUpdate);
    return () => window.removeEventListener('db-update', handleUpdate);
  }, []);

  const handleProductImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== 'image/png' && file.type !== 'image/jpeg') {
        alert('กรุณาอัปโหลดไฟล์ PNG หรือ JPG เท่านั้น');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;

    const orderId = 'ord-' + Date.now();
    db.addOrder({
      id: orderId,
      buyerUid: currentUser.uid,
      sellerUid: selectedProduct.sellerUid,
      productId: selectedProduct.id,
      productName: selectedProduct.name,
      quantity: qty,
      totalPrice: selectedProduct.price * qty,
      note,
      buyerName,
      pickupLocation: location,
      pickupTime: pickupTime || new Date().toISOString(),
      status: 'PENDING',
      createdAt: new Date().toISOString(),
      hasReviewed: false
    });

    db.addNotification({
      id: 'notif-' + Date.now(),
      userUid: selectedProduct.sellerUid,
      title: 'มีออเดอร์ใหม่! 📦',
      message: `${buyerName} สั่ง ${selectedProduct.name} จำนวน ${qty} รายการ`,
      type: 'ORDER',
      isRead: false,
      timestamp: new Date().toISOString()
    });

    setShowOrderModal(false);
    setSelectedProduct(null);
    setQty(1);
    setNote('');
  };

  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newImage) {
      alert('กรุณาเพิ่มรูปภาพสินค้า');
      return;
    }
    db.addProduct({
      id: 'prod-' + Date.now(),
      sellerUid: currentUser.uid,
      name: newName,
      description: newDesc,
      price: Number(newPrice),
      image: newImage,
      stock: Number(newStock),
      isHidden: false
    });
    setShowAddModal(false);
    setNewName(''); setNewPrice(''); setNewDesc(''); setNewImage('');
  };

  const filtered = products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="p-4 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-extrabold text-slate-900">เมนูอาหาร</h2>
        <button 
          onClick={() => setShowAddModal(true)}
          className="bg-pink-600 text-white px-5 py-2.5 rounded-2xl shadow-xl shadow-pink-100 active:scale-95 transition-all flex items-center space-x-2"
        >
          <Plus size={22} strokeWidth={3} />
          <span className="text-base font-extrabold">เพิ่มสินค้า</span>
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-700" size={20} strokeWidth={2.5} />
        <input 
          type="text" 
          placeholder="ค้นหาเมนูอร่อย..." 
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="w-full bg-white border-2 border-slate-200 rounded-2xl py-4 pl-12 pr-4 text-slate-900 placeholder:text-slate-600 font-bold focus:ring-4 focus:ring-pink-100 focus:border-pink-500 outline-none transition-all"
        />
      </div>

      <div className="grid grid-cols-1 gap-5">
        {filtered.length === 0 ? (
          <div className="text-center py-24 text-slate-700 space-y-4">
            <div className="text-7xl">🥘</div>
            <p className="text-xl font-extrabold">ไม่พบรายการอาหารที่คุณค้นหา</p>
          </div>
        ) : (
          filtered.map(p => {
            const seller = db.getUser(p.sellerUid);
            const isOutOfStock = p.stock <= 0;
            return (
              <div key={p.id} className="bg-white rounded-[32px] overflow-hidden shadow-md border-2 border-slate-100 flex p-4 space-x-5 active:scale-[0.98] transition-transform">
                <img src={p.image} className="w-28 h-28 rounded-3xl object-cover shadow-sm" alt="" />
                <div className="flex-1 flex flex-col justify-between py-1">
                  <div>
                    <h4 className="font-extrabold text-slate-900 text-lg leading-tight">{p.name}</h4>
                    <p className="text-sm text-slate-700 font-medium line-clamp-1 mt-1">{p.description}</p>
                    <Link to={`/profile/${p.sellerUid}`} className="flex items-center space-x-1.5 mt-2 hover:bg-slate-50 w-fit p-1 -ml-1 rounded-lg transition-colors">
                      <img src={seller?.profilePic} className="w-5 h-5 rounded-full border border-slate-200" alt="" />
                      <span className="text-xs text-slate-900 font-extrabold">โดย {seller?.displayName}</span>
                      <div className="flex items-center text-yellow-600 text-[10px] ml-1 bg-yellow-50 px-1 rounded">
                        <Star size={10} fill="currentColor" strokeWidth={3} />
                        <span className="ml-0.5 font-bold">{seller?.rating.toFixed(1)}</span>
                      </div>
                    </Link>
                  </div>
                  <div className="flex items-end justify-between mt-3">
                    <div className="flex flex-col">
                      <p className="text-pink-700 font-extrabold text-2xl">฿{p.price}</p>
                      <div className="text-[11px] font-extrabold text-slate-600 mt-0.5">คงเหลือ: {p.stock}</div>
                    </div>
                    {isOutOfStock ? (
                      <span className="bg-slate-200 text-slate-700 px-4 py-2 rounded-2xl text-xs font-extrabold">หมดแล้ว</span>
                    ) : (
                      <button 
                        onClick={() => { setSelectedProduct(p); setShowOrderModal(true); }}
                        className="bg-blue-600 text-white p-3 rounded-2xl active:scale-90 transition-all shadow-lg shadow-blue-100"
                      >
                        <ShoppingCart size={22} strokeWidth={2.5} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Order Modal */}
      {showOrderModal && selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-0 animate-in fade-in duration-300">
          <div className="bg-white rounded-t-[40px] w-full max-w-md p-7 space-y-6 animate-in slide-in-from-bottom-full duration-300 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-extrabold text-slate-900">สั่งซื้อสินค้า</h3>
              <button onClick={() => setShowOrderModal(false)} className="text-slate-900 bg-slate-100 p-2 rounded-full"><X size={26} strokeWidth={3} /></button>
            </div>

            <div className="flex space-x-5 items-center p-4 bg-slate-50 rounded-3xl border-2 border-slate-100">
              <img src={selectedProduct.image} className="w-20 h-20 rounded-2xl object-cover shadow-sm" alt="" />
              <div className="space-y-1">
                <p className="font-extrabold text-slate-900 text-lg leading-tight">{selectedProduct.name}</p>
                <p className="text-pink-700 font-extrabold text-xl">฿{selectedProduct.price}</p>
              </div>
            </div>

            <form onSubmit={handlePlaceOrder} className="space-y-5 max-h-[60vh] overflow-y-auto pr-1">
              <div className="space-y-3">
                <label className="text-base font-extrabold text-slate-900">ระบุจำนวน</label>
                <div className="flex items-center space-x-6 bg-slate-100 w-fit p-1 rounded-2xl">
                   <button type="button" onClick={() => setQty(Math.max(1, qty-1))} className="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center font-extrabold text-2xl text-slate-900 active:bg-slate-50">-</button>
                   <span className="text-2xl font-extrabold text-slate-900 min-w-[20px] text-center">{qty}</span>
                   <button type="button" onClick={() => setQty(Math.min(selectedProduct.stock, qty+1))} className="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center font-extrabold text-2xl text-slate-900 active:bg-slate-50">+</button>
                </div>
              </div>

              <div className="space-y-4">
                <div className="relative">
                  <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-800" size={20} strokeWidth={2.5} />
                  <input type="text" placeholder="ชื่อผู้รับ" value={buyerName} onChange={e => setBuyerName(e.target.value)} required className="w-full bg-slate-50 border-2 border-slate-200 rounded-2xl py-4 pl-12 pr-4 text-slate-900 font-bold placeholder:text-slate-500 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none" />
                </div>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-800" size={20} strokeWidth={2.5} />
                  <input type="text" placeholder="สถานที่นัดรับ (เช่น ตึกA ชั้น1)" value={location} onChange={e => setLocation(e.target.value)} required className="w-full bg-slate-50 border-2 border-slate-200 rounded-2xl py-4 pl-12 pr-4 text-slate-900 font-bold placeholder:text-slate-500 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none" />
                </div>
                <div className="relative">
                  <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-800" size={20} strokeWidth={2.5} />
                  <input type="datetime-local" placeholder="เวลานัดรับ" value={pickupTime} onChange={e => setPickupTime(e.target.value)} required className="w-full bg-slate-50 border-2 border-slate-200 rounded-2xl py-4 pl-12 pr-4 text-slate-900 font-bold placeholder:text-slate-500 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none" />
                </div>
                <textarea placeholder="หมายเหตุเพิ่มเติม (เช่น ไม่เผ็ด, ฝากไว้ที่รปภ.)" value={note} onChange={e => setNote(e.target.value)} className="w-full bg-slate-50 border-2 border-slate-200 rounded-2xl py-4 px-4 text-slate-900 font-bold placeholder:text-slate-500 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none min-h-[100px]" />
              </div>

              <div className="border-t-2 border-slate-100 pt-5 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-slate-700 font-extrabold text-lg">ราคารวมทั้งสิ้น</span>
                  <span className="text-3xl font-extrabold text-pink-700">฿{selectedProduct.price * qty}</span>
                </div>
                <button type="submit" className="w-full bg-pink-600 text-white py-5 rounded-[24px] font-extrabold text-lg shadow-xl shadow-pink-100 active:scale-[0.98] transition-transform">
                  ยืนยันการสั่งซื้อเลย!
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-6 animate-in fade-in duration-300">
          <div className="bg-white rounded-[40px] w-full max-w-sm p-8 space-y-6 animate-in scale-95 max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-extrabold text-slate-900">เพิ่มเมนูอร่อย</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-900 bg-slate-100 p-2 rounded-full"><X size={26} strokeWidth={3} /></button>
            </div>
            
            <form onSubmit={handleAddProduct} className="space-y-5">
               <div className="flex flex-col items-center justify-center space-y-2">
                  <div className="w-full h-48 bg-slate-50 border-4 border-dashed border-slate-200 rounded-3xl overflow-hidden relative flex items-center justify-center group">
                    {newImage ? (
                      <>
                        <img src={newImage} className="w-full h-full object-cover" alt="Product Preview" />
                        <label className="absolute bottom-3 right-3 bg-pink-600 text-white p-2.5 rounded-2xl cursor-pointer shadow-xl opacity-0 group-hover:opacity-100 transition-opacity">
                           <Camera size={22} strokeWidth={2.5} />
                           <input type="file" className="hidden" accept="image/png, image/jpeg" onChange={handleProductImageChange} />
                        </label>
                      </>
                    ) : (
                      <label className="flex flex-col items-center justify-center cursor-pointer w-full h-full text-slate-700 hover:text-pink-600 transition-colors">
                        <ImageIcon size={50} strokeWidth={2} />
                        <span className="text-sm font-extrabold mt-3">กดเพื่อเลือกรูปภาพสินค้า</span>
                        <span className="text-[11px] font-bold text-slate-500">PNG หรือ JPG เท่านั้น</span>
                        <input type="file" className="hidden" accept="image/png, image/jpeg" onChange={handleProductImageChange} />
                      </label>
                    )}
                  </div>
               </div>

               <div className="space-y-4">
                 <input type="text" placeholder="ชื่อเมนูอาหาร" value={newName} onChange={e => setNewName(e.target.value)} required className="w-full bg-slate-50 border-2 border-slate-200 rounded-2xl py-4 px-5 text-slate-900 font-bold focus:ring-4 focus:ring-pink-100 focus:border-pink-500 outline-none transition-all" />
                 
                 <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-1.5">
                     <label className="text-xs font-extrabold text-slate-900 ml-2">ราคา (฿)</label>
                     <input type="number" placeholder="ราคา" value={newPrice} onChange={e => setNewPrice(e.target.value)} required className="w-full bg-slate-50 border-2 border-slate-200 rounded-2xl py-4 px-5 text-slate-900 font-bold focus:ring-4 focus:ring-pink-100 focus:border-pink-500 outline-none" />
                   </div>
                   <div className="space-y-1.5">
                     <label className="text-xs font-extrabold text-slate-900 ml-2">สต็อก (ชิ้น)</label>
                     <input type="number" placeholder="สต็อก" value={newStock} onChange={e => setNewStock(e.target.value)} required className="w-full bg-slate-50 border-2 border-slate-200 rounded-2xl py-4 px-5 text-slate-900 font-bold focus:ring-4 focus:ring-pink-100 focus:border-pink-500 outline-none" />
                   </div>
                 </div>

                 <textarea placeholder="บอกรายละเอียดเมนูนี้หน่อย (เช่น รสชาติ, วัตถุดิบพิเศษ)" value={newDesc} onChange={e => setNewDesc(e.target.value)} className="w-full bg-slate-50 border-2 border-slate-200 rounded-2xl py-4 px-5 text-slate-900 font-bold min-h-[120px] focus:ring-4 focus:ring-pink-100 focus:border-pink-500 outline-none transition-all" />
               </div>
               
               <button type="submit" className="w-full bg-pink-600 text-white py-5 rounded-[24px] font-extrabold text-lg shadow-xl shadow-pink-100 active:scale-[0.98] transition-all">
                 ลงขายเมนูนี้ทันที
               </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MenuPage;
