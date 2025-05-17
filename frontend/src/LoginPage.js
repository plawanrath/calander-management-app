import React, { useState } from 'react';
import { login, setToken } from './api';

function LoginPage({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = await login(username, password);
      setToken(data.access_token);
      localStorage.setItem('token', data.access_token);
      onLogin();
    } catch (err) {
      setError('Login failed');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Login</h2>
      {error && <p>{error}</p>}
      <div>
        <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Username" />
      </div>
      <div>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" />
      </div>
      <button type="submit">Login</button>
    </form>
  );
}

export default LoginPage;
