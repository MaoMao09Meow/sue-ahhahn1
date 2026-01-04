
import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { User } from './types';
import AuthPage from './pages/AuthPage';
import HomePage from './pages/HomePage';
import MenuPage from './pages/MenuPage';
import OrdersPage from './pages/OrdersPage';
import ChatPage from './pages/ChatPage';
import ProfilePage from './pages/ProfilePage';
import NotificationsPage from './pages/NotificationsPage';
import MainLayout from './components/MainLayout';
import { db } from './store';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const uid = localStorage.getItem('SUE_AHHAHN_UID');
    if (uid) {
      const user = db.getUser(uid);
      if (user) setCurrentUser(user);
    }
    setLoading(false);

    const handleDBUpdate = () => {
      if (uid) {
        const user = db.getUser(uid);
        if (user) setCurrentUser({...user});
      }
    };
    window.addEventListener('db-update', handleDBUpdate);
    return () => window.removeEventListener('db-update', handleDBUpdate);
  }, []);

  const handleLogin = (user: User) => {
    localStorage.setItem('SUE_AHHAHN_UID', user.uid);
    setCurrentUser(user);
  };

  const handleLogout = () => {
    localStorage.removeItem('SUE_AHHAHN_UID');
    setCurrentUser(null);
  };

  if (loading) return <div className="flex h-screen items-center justify-center text-pink-500 font-bold">กำลังโหลด...</div>;

  return (
    <Router>
      <Routes>
        {!currentUser ? (
          <>
            <Route path="/auth" element={<AuthPage onLogin={handleLogin} />} />
            <Route path="*" element={<Navigate to="/auth" replace />} />
          </>
        ) : (
          <Route element={<MainLayout currentUser={currentUser} onLogout={handleLogout} />}>
            <Route path="/" element={<HomePage currentUser={currentUser} />} />
            <Route path="/menu" element={<MenuPage currentUser={currentUser} />} />
            <Route path="/orders" element={<OrdersPage currentUser={currentUser} />} />
            <Route path="/chat" element={<ChatPage currentUser={currentUser} />} />
            <Route path="/profile/:uid" element={<ProfilePage currentUser={currentUser} />} />
            <Route path="/notifications" element={<NotificationsPage currentUser={currentUser} />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        )}
      </Routes>
    </Router>
  );
};

export default App;
