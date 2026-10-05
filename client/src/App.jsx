import { useEffect, useState } from 'react';
import { api, getToken, setToken } from './api.js';
import AuthForm from './AuthForm.jsx';
import Tasks from './Tasks.jsx';

export default function App() {
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(!!getToken());

  useEffect(() => {
    if (!getToken()) return;
    api.me().then((r) => setUser(r.user)).catch(() => setToken(null)).finally(() => setChecking(false));
  }, []);

  const onAuth = ({ token, user }) => { setToken(token); setUser(user); };
  const logout = () => { setToken(null); setUser(null); };

  if (checking) return <p className="center">Loading…</p>;
  return (
    <div className="app">
      <header>
        <h1>TaskFlow</h1>
        {user && <div><span>{user.name}</span> <button className="ghost" onClick={logout}>Log out</button></div>}
      </header>
      {user ? <Tasks onUnauthorized={logout} /> : <AuthForm onAuth={onAuth} />}
    </div>
  );
}
