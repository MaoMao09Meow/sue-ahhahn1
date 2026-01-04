
import React, { useState } from 'react';
import { User } from '../types';
import { db } from '../store';
import { Camera, User as UserIcon, Lock, AlignLeft } from 'lucide-react';

interface Props {
  onLogin: (user: User) => void;
}

const AuthPage: React.FC<Props> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [profilePic, setProfilePic] = useState('https://picsum.photos/200');
  const [error, setError] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePic(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username || !password) {
      setError('กรุณากรอกชื่อผู้ใช้และรหัสผ่าน');
      return;
    }

    const users = db.getUsers();

    if (isLogin) {
      const user = users.find(u => u.username === username && u.password === password);
      if (user) {
        onLogin(user);
      } else {
        setError('ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง');
      }
    } else {
      if (users.find(u => u.username === username)) {
        setError('ชื่อผู้ใช้นี้ถูกใช้งานแล้ว');
        return;
      }
      const newUser: User = {
        uid: 'u-' + Date.now(),
        username,
        password,
        displayName: displayName || username,
        profilePic,
        bio: bio || 'สวัสดี! ฉันเป็นสมาชิกใหม่ของ Sue AhHahn',
        friends: [],
        following: [],
        rating: 0,
        reviewCount: 0
      };
      db.addUser(newUser);
      onLogin(newUser);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-blue-50 flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <div className="inline-block p-4 rounded-3xl bg-white shadow-xl shadow-pink-100 mb-4 animate-bounce duration-1000">
             <div className="text-4xl">🍜</div>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Sue AhHahn</h1>
          <p className="text-slate-500 mt-2">ตลาดนัดอาหารออนไลน์เพื่อคุณ</p>
        </div>

        <div className="bg-white rounded-3xl p-8 shadow-2xl shadow-slate-200/50">
          <div className="flex space-x-1 bg-slate-100 p-1 rounded-2xl mb-8">
            <button 
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-2 text-sm font-semibold rounded-xl transition-all ${isLogin ? 'bg-white text-pink-500 shadow-sm' : 'text-slate-500'}`}
            >
              เข้าสู่ระบบ
            </button>
            <button 
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-2 text-sm font-semibold rounded-xl transition-all ${!isLogin ? 'bg-white text-pink-500 shadow-sm' : 'text-slate-500'}`}
            >
              สมัครสมาชิก
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="flex flex-col items-center mb-6">
                <div className="relative group">
                  <img src={profilePic} alt="Preview" className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg ring-4 ring-pink-50" />
                  <label className="absolute bottom-0 right-0 bg-pink-500 text-white p-2 rounded-full cursor-pointer shadow-lg hover:scale-110 transition-transform">
                    <Camera size={16} />
                    <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                  </label>
                </div>
                <p className="text-xs text-slate-400 mt-2">อัปโหลดรูปโปรไฟล์</p>
              </div>
            )}

            <div className="relative">
              <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="ชื่อผู้ใช้" 
                value={username}
                onChange={e => setUsername(e.target.value)}
                className="w-full bg-slate-50 border-none rounded-2xl py-4 pl-12 pr-4 text-slate-800 placeholder:text-slate-400 focus:ring-2 focus:ring-pink-400 transition-all outline-none"
              />
            </div>

            {!isLogin && (
              <div className="relative">
                <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="text" 
                  placeholder="ชื่อที่แสดง (Display Name)" 
                  value={displayName}
                  onChange={e => setDisplayName(e.target.value)}
                  className="w-full bg-slate-50 border-none rounded-2xl py-4 pl-12 pr-4 text-slate-800 placeholder:text-slate-400 focus:ring-2 focus:ring-pink-400 transition-all outline-none"
                />
              </div>
            )}

            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="password" 
                placeholder="รหัสผ่าน" 
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full bg-slate-50 border-none rounded-2xl py-4 pl-12 pr-4 text-slate-800 placeholder:text-slate-400 focus:ring-2 focus:ring-pink-400 transition-all outline-none"
              />
            </div>

            {!isLogin && (
              <div className="relative">
                <AlignLeft className="absolute left-4 top-4 text-slate-400" size={18} />
                <textarea 
                  placeholder="คำอธิบายเกี่ยวกับตัวเอง (Bio)" 
                  value={bio}
                  maxLength={500}
                  onChange={e => setBio(e.target.value)}
                  className="w-full bg-slate-50 border-none rounded-2xl py-4 pl-12 pr-4 text-slate-800 placeholder:text-slate-400 focus:ring-2 focus:ring-pink-400 transition-all outline-none min-h-[100px]"
                />
                <span className="absolute bottom-2 right-4 text-[10px] text-slate-400">{bio.length}/500</span>
              </div>
            )}

            {error && <p className="text-red-500 text-xs text-center font-medium px-2">{error}</p>}

            <button 
              type="submit" 
              className="w-full bg-gradient-to-r from-pink-500 to-blue-500 text-white py-4 rounded-2xl font-bold shadow-xl shadow-pink-100 active:scale-[0.98] transition-all"
            >
              {isLogin ? 'เข้าสู่ระบบ' : 'เริ่มใช้งานทันที'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
