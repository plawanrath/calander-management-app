import React, { useEffect, useState } from 'react';
import LoginPage from './LoginPage';
import AdminDashboard from './AdminDashboard';
import CustomerDashboard from './CustomerDashboard';
import SpecialistDashboard from './SpecialistDashboard';
import { getMe, setToken } from './api';

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setToken(token);
      fetchUser();
    }
  }, []);

  const fetchUser = async () => {
    try {
      const u = await getMe();
      setUser(u);
    } catch {
      setUser(null);
    }
  };

  const handleLogin = async () => {
    await fetchUser();
  };

  if (!user) {
    return <LoginPage onLogin={handleLogin} />;
  }

  if (user.type === 'admin') {
    return <AdminDashboard />;
  }

  if (user.type === 'customer') {
    return <CustomerDashboard user={user} />;
  }

  if (user.type === 'specialist') {
    return <SpecialistDashboard user={user} />;
  }

  return <div>Unknown user type</div>;
}

export default App;
