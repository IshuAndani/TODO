import React, { useState } from 'react';
import Login from './components/Login';
import TodoApp from './components/TodoApp';

function App() {
  // Check localStorage so user stays logged in on refresh
  const [token, setToken] = useState(localStorage.getItem('token') || '');

  const handleLogin = (newToken) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken('');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm p-4 flex justify-between items-center px-8">
        <span className="font-bold text-xl text-indigo-600">DoneDeal.io</span>
        {token && (
          <button 
            onClick={handleLogout}
            className="text-sm font-medium text-gray-600 hover:text-red-500 transition"
          >
            Sign Out
          </button>
        )}
      </nav>

      <main className="container mx-auto py-8">
        {!token ? (
          <Login onLogin={handleLogin} />
        ) : (
          <TodoApp token={token} />
        )}
      </main>
    </div>
  );
}

export default App;