
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { User, Product, Review } from '../types';
import { db } from '../store';
import { Settings, UserPlus, MessageCircle, Star, Edit3, Grid, Star as StarIcon, Eye, EyeOff, Trash2, Camera, X, Plus, Image as ImageIcon, UserCheck } from 'lucide-react';
import { formatThaiDate } from '../constants';

interface Props {
  currentUser: User;
}

const ProfilePage: React.FC<Props> = ({ currentUser }) => {
  const { uid } = useParams<{ uid: string }>();
  const navigate = useNavigate();
  const [profileUser, setProfileUser] = useState<User | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [tab, setTab] = useState<'PRODUCTS' | 'REVIEWS'>('PRODUCTS');
  const [isEditing, setIsEditing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  // Edit profile fields
  const [editName, setEditName] = useState('');
  const [editBio, setEditBio] = useState('');
  const [editPic, setEditPic] = useState('');

  // Add Product Form
  const [newName, setNewName] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [newStock, setNewStock] = useState('10');
  const [newDesc, setNewDesc] = useState('');
  const [newImage, setNewImage] = useState('');

  useEffect(() => {
    if (!uid) return;
    const user = db.getUser(uid);
    if (user) {
      setProfileUser(user);
      setEditName(user.displayName);
      setEditBio(user.bio);
      setEditPic(user.profilePic);
      setProducts(db.getProducts().filter(p => p.sellerUid === uid));
      setReviews(db.getReviews().filter(r => r.sellerUid === uid));
    }

    const handleUpdate = () => {
      const u = db.getUser(uid);
      if (u) {
        setProfileUser({...u});
        setProducts(db.getProducts().filter(p => p.sellerUid === uid));
        setReviews(db.getReviews().filter(r => r.sellerUid === uid));
      }
    };
    window.addEventListener('db-update', handleUpdate);
    return () => window.removeEventListener('db-update', handleUpdate);
  }, [uid]);

  const isMe = currentUser.uid === uid;
  const isFollowing = currentUser.following.includes(uid || '');
  const followersCount = db.getUsers().filter(u => u.following.includes(uid || '')).length;

  const handleToggleFollow = () => {
    if (!uid) return;
    db.toggleFollow(currentUser.uid, uid);
    
    if (!isFollowing) {
      db.addNotification({
        id: 'notif-' + Date.now(),
        userUid: uid,
        title: 'มีเพื่อนใหม่ติดตามคุณ! 👤',
        message: `${currentUser.displayName} เริ่มติดตามคุณแล้ว`,
        type: 'SYSTEM',
        isRead: false,
        timestamp: new Date().toISOString()
      });
    }
  };

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    db.updateUser(currentUser.uid, {
        displayName: editName,
        bio: editBio,
        profilePic: editPic
    });
    setIsEditing(false);
  };

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== 'image/png' && file.type !== 'image/jpeg') {
        alert('กรุณาอัปโหลดไฟล์ PNG หรือ JPG เท่านั้น');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditPic(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleProductHidden = (id: string, current: boolean) => {
    db.updateProduct(id, { isHidden: !current });
  };

  const deleteProduct = (id: string) => {
    if (confirm('ยืนยันลบรายการอาหารนี้?')) {
        db.deleteProduct(id);
    }
  };

  if (!profileUser) return <div className="p-10 text-center text-slate-500 font-bold">ไม่พบผู้ใช้งาน</div>;

  return (
    <div className="animate-in fade-in duration-500">
      <div className="h-40 bg-gradient-to-r from-pink-500 to-blue-500 relative">
         <div className="absolute -bottom-12 left-6 flex items-end space-x-4">
            <div className="relative">
              <img src={profileUser.profilePic} className="w-24 h-24 rounded-3xl object-cover border-4 border-white shadow-xl bg-white" alt="" />
            </div>
            <div className="mb-2">
                <h2 className="text-xl font-bold text-slate-800 bg-white/80 px-3 py-1 rounded-xl backdrop-blur-sm shadow-sm">{profileUser.displayName}</h2>
                <p className="text-xs text-slate-500 ml-1">UID: {profileUser.uid}</p>
            </div>
         </div>
         {isMe && (
            <button 
                onClick={() => setIsEditing(true)}
                className="absolute top-4 right-4 bg-white/20 hover:bg-white/40 p-2 rounded-full backdrop-blur-sm text-white transition-colors"
            >
                <Edit3 size={20} />
            </button>
         )}
      </div>

      <div className="mt-16 px-6 space-y-4">
        <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-wrap">{profileUser.bio}</p>
        
        <div className="flex space-x-8 py-2 border-y border-slate-50">
            <div className="text-center">
                <p className="text-lg font-extrabold text-slate-800">{profileUser.rating.toFixed(1)}</p>
                <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">คะแนน</p>
            </div>
            <div className="text-center">
                <p className="text-lg font-extrabold text-slate-800">{followersCount}</p>
                <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">ผู้ติดตาม</p>
            </div>
            <div className="text-center">
                <p className="text-lg font-extrabold text-slate-800">{products.length}</p>
                <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">สินค้า</p>
            </div>
        </div>

        {!isMe && (
            <div className="flex space-x-3">
                <button 
                  onClick={handleToggleFollow}
                  className={`flex-1 py-3 rounded-2xl font-bold flex items-center justify-center space-x-2 active:scale-95 transition-all shadow-lg ${isFollowing ? 'bg-slate-100 text-slate-600 shadow-slate-50' : 'bg-pink-500 text-white shadow-pink-100'}`}
                >
                    {isFollowing ? <UserCheck size={18} /> : <UserPlus size={18} />}
                    <span>{isFollowing ? 'กำลังติดตาม' : 'ติดตาม'}</span>
                </button>
                <button 
                    onClick={() => navigate('/chat')}
                    className="flex-1 bg-white border border-slate-200 text-slate-600 py-3 rounded-2xl font-bold flex items-center justify-center space-x-2 active:scale-95 transition-transform"
                >
                    <MessageCircle size={18} />
                    <span>ส่งแชท</span>
                </button>
            </div>
        )}

        <div className="flex border-b">
            <button onClick={() => setTab('PRODUCTS')} className={`flex-1 py-3 text-sm font-bold border-b-2 transition-all ${tab === 'PRODUCTS' ? 'border-pink-500 text-pink-500' : 'border-transparent text-slate-400'}`}>
                <div className="flex items-center justify-center space-x-2">
                    <Grid size={16} />
                    <span>หน้าร้าน</span>
                </div>
            </button>
            <button onClick={() => setTab('REVIEWS')} className={`flex-1 py-3 text-sm font-bold border-b-2 transition-all ${tab === 'REVIEWS' ? 'border-pink-500 text-pink-500' : 'border-transparent text-slate-400'}`}>
                <div className="flex items-center justify-center space-x-2">
                    <StarIcon size={16} />
                    <span>รีวิว</span>
                </div>
            </button>
        </div>

        <div className="py-4">
            {tab === 'PRODUCTS' ? (
                <div className="space-y-4">
                    {isMe && (
                      <button 
                        onClick={() => setShowAddModal(true)}
                        className="w-full flex items-center justify-center space-x-2 py-4 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 font-bold hover:border-pink-300 hover:text-pink-500 transition-all mb-4"
                      >
                        <Plus size={20} />
                        <span>เพิ่มสินค้าใหม่ลงในร้าน</span>
                      </button>
                    )}
                    
                    {products.length === 0 ? (
                        <p className="text-center py-10 text-slate-400 italic">ยังไม่ได้ลงขายสินค้า</p>
                    ) : (
                        products.map(p => (
                            <div key={p.id} className="flex space-x-4 bg-white p-3 rounded-2xl shadow-sm border border-slate-100 group">
                                <img src={p.image} className="w-20 h-20 rounded-xl object-cover" alt="" />
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between">
                                        <h4 className="font-bold text-slate-800 truncate">{p.name}</h4>
                                        <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            {isMe && (
                                                <>
                                                    <button onClick={() => toggleProductHidden(p.id, p.isHidden)} className="text-blue-500">
                                                        {p.isHidden ? <EyeOff size={16} /> : <Eye size={16} />}
                                                    </button>
                                                    <button onClick={() => deleteProduct(p.id)} className="text-red-500"><Trash2 size={16} /></button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                    <p className="text-xs text-slate-500 line-clamp-1">{p.description}</p>
                                    <div className="flex items-center justify-between mt-2">
                                        <p className="text-pink-600 font-bold">฿{p.price}</p>
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${p.stock > 0 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                                            สต็อก: {p.stock}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            ) : (
                <div className="space-y-4">
                    {reviews.length === 0 ? (
                        <p className="text-center py-10 text-slate-400 italic">ยังไม่มีใครมารีวิว</p>
                    ) : (
                        reviews.map(r => {
                            const buyer = db.getUser(r.buyerUid);
                            return (
                                <div key={r.id} className="bg-slate-50 p-4 rounded-2xl space-y-2">
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center space-x-2">
                                            <img src={buyer?.profilePic} className="w-6 h-6 rounded-full" alt="" />
                                            <span className="text-xs font-bold text-slate-800">{buyer?.displayName}</span>
                                        </div>
                                        <div className="flex text-yellow-400">
                                            {[...Array(r.rating)].map((_, i) => <Star size={10} key={i} fill="currentColor" />)}
                                        </div>
                                    </div>
                                    <p className="text-xs text-slate-600 italic">"{r.comment}"</p>
                                    <p className="text-[8px] text-slate-400 text-right">{formatThaiDate(r.timestamp)}</p>
                                </div>
                            );
                        })
                    )}
                </div>
            )}
        </div>
      </div>

      {/* Edit Profile Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-6 animate-in fade-in">
            <div className="bg-white rounded-3xl w-full max-w-sm p-6 space-y-4 max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-slate-800">แก้ไขข้อมูลส่วนตัว</h3>
                  <button onClick={() => setIsEditing(false)} className="text-slate-400 p-1"><X size={24} /></button>
                </div>

                <form onSubmit={handleUpdateProfile} className="space-y-4">
                    <div className="flex flex-col items-center py-4">
                      <div className="relative group">
                        <img src={editPic} className="w-28 h-28 rounded-full object-cover border-4 border-slate-50 shadow-lg" alt="Profile Preview" />
                        <label className="absolute bottom-0 right-0 bg-pink-500 text-white p-2 rounded-full cursor-pointer shadow-lg hover:scale-110 transition-transform active:scale-90">
                          <Camera size={20} />
                          <input type="file" className="hidden" accept="image/png, image/jpeg" onChange={handleFileChange} />
                        </label>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-2 font-medium">รองรับไฟล์ PNG, JPG</p>
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-500 ml-2">ชื่อที่แสดง</label>
                        <input type="text" value={editName} onChange={e => setEditName(e.target.value)} className="w-full bg-slate-100 rounded-2xl py-3 px-4 outline-none focus:ring-2 focus:ring-pink-400" placeholder="ชื่อที่ต้องการให้คนอื่นเห็น" />
                    </div>
                    
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-500 ml-2">Bio (แนะนำตัวเอง)</label>
                        <textarea value={editBio} onChange={e => setEditBio(e.target.value)} maxLength={500} className="w-full bg-slate-100 rounded-2xl py-3 px-4 outline-none min-h-[120px] focus:ring-2 focus:ring-pink-400" placeholder="เขียนคำอธิบายเกี่ยวกับตัวคุณหรือร้านค้า..." />
                        <div className="text-right text-[10px] text-slate-400 px-2">{editBio.length}/500</div>
                    </div>

                    <div className="flex space-x-3 pt-4">
                        <button type="button" onClick={() => setIsEditing(false)} className="flex-1 py-3 text-slate-500 font-bold active:bg-slate-50 rounded-2xl transition-colors">ยกเลิก</button>
                        <button type="submit" className="flex-2 bg-pink-500 text-white px-8 py-3 rounded-2xl font-bold shadow-lg shadow-pink-100 active:scale-95 transition-transform">บันทึกข้อมูล</button>
                    </div>
                </form>
            </div>
        </div>
      )}

      {/* Add Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-6 animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl w-full max-w-sm p-6 space-y-4 animate-in scale-95 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-800">เพิ่มรายการอาหาร</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 p-1"><X size={24} /></button>
            </div>
            
            <form onSubmit={handleAddProduct} className="space-y-4">
               {/* Product Image Upload */}
               <div className="flex flex-col items-center justify-center">
                  <div className="w-full h-40 bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl overflow-hidden relative flex items-center justify-center group">
                    {newImage ? (
                      <>
                        <img src={newImage} className="w-full h-full object-cover" alt="Product Preview" />
                        <label className="absolute bottom-2 right-2 bg-pink-500 text-white p-2 rounded-xl cursor-pointer shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
                           <Camera size={18} />
                           <input type="file" className="hidden" accept="image/png, image/jpeg" onChange={handleProductImageChange} />
                        </label>
                      </>
                    ) : (
                      <label className="flex flex-col items-center justify-center cursor-pointer w-full h-full text-slate-400 hover:text-pink-500 transition-colors">
                        <ImageIcon size={40} strokeWidth={1.5} />
                        <span className="text-xs font-bold mt-2">เพิ่มรูปสินค้า (PNG, JPG)</span>
                        <input type="file" className="hidden" accept="image/png, image/jpeg" onChange={handleProductImageChange} />
                      </label>
                    )}
                  </div>
               </div>

               <input type="text" placeholder="ชื่ออาหาร" value={newName} onChange={e => setNewName(e.target.value)} required className="w-full bg-slate-100 rounded-2xl py-3 px-4 outline-none focus:ring-2 focus:ring-pink-400" />
               
               <div className="grid grid-cols-2 gap-3">
                 <div className="space-y-1">
                   <label className="text-[10px] font-bold text-slate-400 ml-2">ราคา (฿)</label>
                   <input type="number" placeholder="ราคา" value={newPrice} onChange={e => setNewPrice(e.target.value)} required className="w-full bg-slate-100 rounded-2xl py-3 px-4 outline-none focus:ring-2 focus:ring-pink-400" />
                 </div>
                 <div className="space-y-1">
                   <label className="text-[10px] font-bold text-slate-400 ml-2">สต็อก (ชิ้น)</label>
                   <input type="number" placeholder="สต็อก" value={newStock} onChange={e => setNewStock(e.target.value)} required className="w-full bg-slate-100 rounded-2xl py-3 px-4 outline-none focus:ring-2 focus:ring-pink-400" />
                 </div>
               </div>

               <textarea placeholder="คำอธิบาย..." value={newDesc} onChange={e => setNewDesc(e.target.value)} className="w-full bg-slate-100 rounded-2xl py-3 px-4 outline-none h-24 focus:ring-2 focus:ring-pink-400" />
               
               <button type="submit" className="w-full bg-pink-500 text-white py-4 rounded-2xl font-bold shadow-lg shadow-pink-100 active:scale-95 transition-all">
                 ลงขายสินค้า
               </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
