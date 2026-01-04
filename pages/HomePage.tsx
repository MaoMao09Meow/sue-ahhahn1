
import React, { useState } from 'react';
import { User, Product } from '../types';
import { db } from '../store';
import { Link } from 'react-router-dom';
import { ShoppingBag, Users, Zap, Search, UserCheck } from 'lucide-react';

interface Props {
  currentUser: User;
}

const HomePage: React.FC<Props> = ({ currentUser }) => {
  const [userSearch, setUserSearch] = useState('');
  const products = db.getProducts().filter(p => !p.isHidden).slice(0, 4);
  const allUsers = db.getUsers();

  const searchResults = userSearch.trim() 
    ? allUsers.filter(u => 
        u.uid.toLowerCase().includes(userSearch.toLowerCase()) || 
        u.displayName.toLowerCase().includes(userSearch.toLowerCase())
      ).slice(0, 5)
    : [];

  return (
    <div className="p-6 space-y-8 animate-in slide-in-from-bottom-4 duration-500">
      <section className="space-y-2">
        <h2 className="text-3xl font-extrabold text-slate-900">
          สวัสดี, {currentUser.displayName}! 👋
        </h2>
        <p className="text-slate-700 font-medium text-lg">วันนี้อยากทานอะไรเป็นพิเศษไหม?</p>
      </section>

      {/* User Search Section */}
      <section className="space-y-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-700" size={20} />
          <input 
            type="text" 
            placeholder="ค้นหาเพื่อนจากชื่อหรือ UID..." 
            value={userSearch}
            onChange={e => setUserSearch(e.target.value)}
            className="w-full bg-white border-2 border-slate-200 shadow-sm rounded-2xl py-4 pl-12 pr-4 text-slate-900 placeholder:text-slate-500 font-medium focus:ring-4 focus:ring-pink-100 focus:border-pink-500 outline-none transition-all"
          />
        </div>

        {userSearch && (
          <div className="bg-white rounded-3xl p-2 shadow-2xl border-2 border-slate-100 animate-in fade-in zoom-in-95 duration-200">
            {searchResults.length === 0 ? (
              <p className="text-center py-8 text-slate-600 font-bold italic">ไม่พบผู้ใช้งานที่ตรงกับ "{userSearch}"</p>
            ) : (
              <div className="divide-y-2 divide-slate-50">
                {searchResults.map(u => (
                  <Link 
                    key={u.uid} 
                    to={`/profile/${u.uid}`}
                    className="flex items-center space-x-4 p-4 hover:bg-slate-50 rounded-2xl transition-colors"
                  >
                    <img src={u.profilePic} className="w-14 h-14 rounded-full object-cover border-2 border-pink-100 shadow-sm" alt="" />
                    <div className="flex-1">
                      <p className="font-extrabold text-slate-900 text-base">{u.displayName}</p>
                      <p className="text-xs text-slate-600 font-mono">UID: {u.uid.toUpperCase()}</p>
                    </div>
                    {currentUser.following.includes(u.uid) && (
                      <UserCheck size={20} className="text-pink-600" strokeWidth={3} />
                    )}
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}
      </section>

      <div className="grid grid-cols-2 gap-4">
        <Link to="/menu" className="bg-pink-50 p-5 rounded-3xl space-y-3 border-2 border-pink-100 active:scale-95 transition-transform shadow-sm">
           <div className="bg-pink-600 text-white p-2.5 w-fit rounded-xl">
             <ShoppingBag size={22} strokeWidth={2.5} />
           </div>
           <div>
             <p className="text-base font-extrabold text-pink-900">ตลาดนัด</p>
             <p className="text-xs text-pink-700 font-bold">สินค้า {db.getProducts().length} รายการ</p>
           </div>
        </Link>
        <div className="bg-blue-50 p-5 rounded-3xl space-y-3 border-2 border-blue-100 shadow-sm">
           <div className="bg-blue-600 text-white p-2.5 w-fit rounded-xl">
             <Users size={22} strokeWidth={2.5} />
           </div>
           <div>
             <p className="text-base font-extrabold text-blue-900">กำลังติดตาม</p>
             <p className="text-xs text-blue-700 font-bold">{currentUser.following.length} คน</p>
           </div>
        </div>
      </div>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-extrabold text-slate-900 flex items-center space-x-2">
            <Zap className="text-yellow-600" size={22} fill="currentColor" />
            <span>เมนูแนะนำ</span>
          </h3>
          <Link to="/menu" className="text-pink-700 text-sm font-extrabold underline underline-offset-4">ดูทั้งหมด</Link>
        </div>

        {products.length === 0 ? (
          <div className="bg-white border-2 border-dashed border-slate-300 rounded-3xl p-12 text-center space-y-3">
             <div className="text-5xl">🍽️</div>
             <p className="text-slate-700 font-bold">ยังไม่มีสินค้าในขณะนี้</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {products.map(product => {
              const seller = db.getUser(product.sellerUid);
              return (
                <div key={product.id} className="bg-white rounded-2xl overflow-hidden shadow-lg border border-slate-100 flex flex-col group active:scale-95 transition-transform">
                  <div className="relative">
                    <img src={product.image} className="w-full h-36 object-cover" alt={product.name} />
                    <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg shadow-sm">
                      <p className="text-pink-700 font-extrabold text-sm">฿{product.price}</p>
                    </div>
                  </div>
                  <div className="p-3 flex-1 flex flex-col space-y-2">
                    <p className="font-extrabold text-slate-900 line-clamp-1 leading-tight">{product.name}</p>
                    <div className="flex items-center space-x-1.5">
                      <img src={seller?.profilePic} className="w-5 h-5 rounded-full border border-slate-200" alt="" />
                      <span className="text-xs text-slate-700 font-bold truncate">{seller?.displayName}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <section className="bg-slate-900 rounded-3xl p-7 text-white overflow-hidden relative shadow-xl">
        <div className="relative z-10 space-y-4">
          <h3 className="text-2xl font-extrabold">เปิดร้านของคุณวันนี้!</h3>
          <p className="text-slate-200 text-sm font-medium leading-relaxed">เริ่มสร้างรายได้จากการขายอาหารที่คุณถนัด ง่ายๆ ในไม่กี่ขั้นตอน</p>
          <Link to={`/profile/${currentUser.uid}`} className="inline-block bg-white text-slate-900 px-8 py-3 rounded-2xl font-extrabold text-base shadow-lg active:scale-95 transition-transform">
            จัดการหน้าร้าน
          </Link>
        </div>
        <div className="absolute -right-6 -bottom-6 text-9xl opacity-10 rotate-12">🥘</div>
      </section>
    </div>
  );
};

export default HomePage;
