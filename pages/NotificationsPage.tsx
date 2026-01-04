
import React, { useState, useEffect } from 'react';
import { User, AppNotification } from '../types';
import { db } from '../store';
import { Package, MessageCircle, Info, ChevronRight } from 'lucide-react';
import { formatThaiDate } from '../constants';

interface Props {
  currentUser: User;
}

const NotificationsPage: React.FC<Props> = ({ currentUser }) => {
  const [notifs, setNotifs] = useState<AppNotification[]>([]);

  useEffect(() => {
    const list = db.getNotifications().filter(n => n.userUid === currentUser.uid);
    setNotifs(list.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));

    const handleUpdate = () => {
        setNotifs(db.getNotifications().filter(n => n.userUid === currentUser.uid).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
    };
    window.addEventListener('db-update', handleUpdate);
    return () => window.removeEventListener('db-update', handleUpdate);
  }, [currentUser.uid]);

  const markAllRead = () => {
    notifs.forEach(n => db.markNotifRead(n.id));
  };

  return (
    <div className="p-4 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-extrabold text-slate-900">แจ้งเตือน</h2>
        <button onClick={markAllRead} className="text-sm font-extrabold text-blue-700 underline underline-offset-4">อ่านทั้งหมด</button>
      </div>

      <div className="space-y-4">
        {notifs.length === 0 ? (
          <div className="text-center py-24 text-slate-800 italic">
            <div className="text-6xl mb-4 opacity-30">🔔</div>
            <p className="text-xl font-extrabold">ไม่มีการแจ้งเตือนใหม่</p>
          </div>
        ) : (
          notifs.map(n => {
            const Icon = n.type === 'ORDER' ? Package : n.type === 'CHAT' ? MessageCircle : Info;
            const iconColor = n.type === 'ORDER' ? 'text-blue-800' : n.type === 'CHAT' ? 'text-pink-800' : 'text-slate-800';
            const bgColor = n.type === 'ORDER' ? 'bg-blue-200' : n.type === 'CHAT' ? 'bg-pink-200' : 'bg-slate-200';

            return (
              <div 
                key={n.id} 
                className={`p-5 rounded-[32px] flex items-start space-x-4 border-2 transition-all relative ${n.isRead ? 'bg-slate-50 border-slate-100 opacity-80' : 'bg-white shadow-md border-blue-50 ring-2 ring-blue-100 ring-inset'}`}
              >
                <div className={`p-3.5 rounded-2xl flex-shrink-0 ${bgColor} ${iconColor} shadow-sm`}>
                    <Icon size={24} strokeWidth={2.5} />
                </div>
                <div className="flex-1 space-y-1.5 pr-2">
                    <div className="flex justify-between items-start">
                        <h4 className="text-base font-extrabold text-slate-900 leading-tight">{n.title}</h4>
                        {!n.isRead && <div className="h-3 w-3 bg-blue-600 rounded-full border-2 border-white flex-shrink-0 mt-1 shadow-sm"></div>}
                    </div>
                    <p className="text-sm text-slate-800 font-bold leading-relaxed">{n.message}</p>
                    <p className="text-[11px] text-slate-700 font-extrabold pt-1">{formatThaiDate(n.timestamp)}</p>
                </div>
                <ChevronRight size={20} strokeWidth={3} className="text-slate-900 mt-5 opacity-40" />
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;
