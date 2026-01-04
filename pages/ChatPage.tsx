
import React, { useState, useEffect, useRef } from 'react';
import { User, ChatMessage } from '../types';
import { db } from '../store';
import { Send, Image, Trash2, ArrowLeft, Search, User as UserIcon } from 'lucide-react';
import { formatThaiDate } from '../constants';

interface Props {
  currentUser: User;
}

const ChatPage: React.FC<Props> = ({ currentUser }) => {
  const [selectedChat, setSelectedChat] = useState<User | null>(null);
  const [message, setMessage] = useState('');
  const [allMessages, setAllMessages] = useState<ChatMessage[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setAllMessages(db.getChats());
    setAllUsers(db.getUsers());

    const handleUpdate = () => {
      setAllMessages([...db.getChats()]);
      setAllUsers([...db.getUsers()]);
    };
    window.addEventListener('db-update', handleUpdate);
    return () => window.removeEventListener('db-update', handleUpdate);
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [selectedChat, allMessages]);

  const handleSend = (image?: string) => {
    if (!selectedChat) return;
    if (!message.trim() && !image) return;

    db.addChat({
      id: 'msg-' + Date.now(),
      senderUid: currentUser.uid,
      receiverUid: selectedChat.uid,
      text: message,
      image,
      timestamp: new Date().toISOString()
    });

    // Notify receiver
    db.addNotification({
        id: 'notif-' + Date.now(),
        userUid: selectedChat.uid,
        title: `ข้อความใหม่จาก ${currentUser.displayName} 💬`,
        message: image ? 'ส่งรูปภาพให้คุณ' : message.slice(0, 30),
        type: 'CHAT',
        isRead: false,
        timestamp: new Date().toISOString()
    });

    setMessage('');
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => handleSend(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleDelete = (id: string) => {
    db.deleteChat(id);
  };

  const activeMessages = allMessages.filter(m => 
    (m.senderUid === currentUser.uid && m.receiverUid === selectedChat?.uid) ||
    (m.senderUid === selectedChat?.uid && m.receiverUid === currentUser.uid)
  ).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

  // Conversation list
  const otherUsers = allUsers.filter(u => u.uid !== currentUser.uid && u.displayName.toLowerCase().includes(searchTerm.toLowerCase()));
  
  if (selectedChat) {
    return (
      <div className="flex flex-col h-full bg-slate-50 animate-in slide-in-from-right duration-300">
        <div className="bg-white border-b px-4 py-3 flex items-center space-x-3 sticky top-0 z-10">
          <button onClick={() => setSelectedChat(null)} className="p-2 text-slate-500"><ArrowLeft size={20} /></button>
          <img src={selectedChat.profilePic} className="w-10 h-10 rounded-full object-cover" alt="" />
          <div className="flex-1">
            <h4 className="font-bold text-slate-800 text-sm">{selectedChat.displayName}</h4>
            <p className="text-[10px] text-green-500 font-medium">ออนไลน์ขณะนี้</p>
          </div>
        </div>

        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
          {activeMessages.map(m => {
            const isMe = m.senderUid === currentUser.uid;
            return (
              <div key={m.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} group`}>
                <div className={`max-w-[80%] relative space-y-1 ${isMe ? 'items-end' : 'items-start'}`}>
                  {m.image && <img src={m.image} className="rounded-2xl max-w-full shadow-sm" alt="" />}
                  {m.text && (
                    <div className={`px-4 py-3 rounded-2xl text-sm shadow-sm ${isMe ? 'bg-pink-500 text-white rounded-tr-none' : 'bg-white text-slate-800 rounded-tl-none'}`}>
                      {m.text}
                    </div>
                  )}
                  <div className={`flex items-center space-x-2 text-[8px] text-slate-400 ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <span>{new Date(m.timestamp).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })} น.</span>
                    {isMe && (
                      <button onClick={() => handleDelete(m.id)} className="opacity-0 group-hover:opacity-100 text-red-400 transition-opacity">
                        <Trash2 size={10} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="bg-white border-t p-4 flex items-center space-x-3 safe-bottom">
          <label className="p-2 text-slate-400 cursor-pointer active:scale-90 transition-all">
            <Image size={24} />
            <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
          </label>
          <input 
            type="text" 
            placeholder="พิมพ์ข้อความ..." 
            value={message}
            onChange={e => setMessage(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            className="flex-1 bg-slate-100 rounded-full px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-pink-400"
          />
          <button 
            onClick={() => handleSend()}
            className="bg-pink-500 text-white p-3 rounded-full shadow-lg shadow-pink-100 active:scale-95 transition-all"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6 animate-in slide-in-from-left duration-300">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-800">แชทของคุณ</h2>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        <input 
          type="text" 
          placeholder="ค้นหาผู้ติดต่อ..." 
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="w-full bg-slate-100 border-none rounded-2xl py-4 pl-12 pr-4 text-slate-800 outline-none"
        />
      </div>

      <div className="space-y-2">
        {otherUsers.length === 0 ? (
          <div className="text-center py-20 text-slate-400 italic">ไม่พบผู้ใช้งานอื่น</div>
        ) : (
          otherUsers.map(user => {
            const lastMsg = allMessages.filter(m => 
                (m.senderUid === currentUser.uid && m.receiverUid === user.uid) ||
                (m.senderUid === user.uid && m.receiverUid === currentUser.uid)
            ).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];

            return (
              <button 
                key={user.uid} 
                onClick={() => setSelectedChat(user)}
                className="w-full bg-white flex items-center p-4 space-x-4 border-b border-slate-50 active:bg-slate-50 transition-colors"
              >
                <div className="relative">
                    <img src={user.profilePic} className="w-14 h-14 rounded-full object-cover border-2 border-slate-100" alt="" />
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                </div>
                <div className="flex-1 text-left">
                    <div className="flex justify-between items-center">
                        <h4 className="font-bold text-slate-800">{user.displayName}</h4>
                        {lastMsg && <span className="text-[10px] text-slate-400">{new Date(lastMsg.timestamp).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })} น.</span>}
                    </div>
                    <p className="text-xs text-slate-500 line-clamp-1">
                        {lastMsg ? (lastMsg.text || 'ส่งรูปภาพ') : user.bio}
                    </p>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ChatPage;
