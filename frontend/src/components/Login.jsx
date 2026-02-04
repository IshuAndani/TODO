import React, { useState } from 'react';
import axios from 'axios';
import { Loader2, Lock, Mail } from 'lucide-react';

const API_URL = 'http://localhost:3000';

export default function Login({ onLogin }) {
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: '', type: '' });

    const endpoint = isRegistering ? '/register' : '/login';
    
    try {
      const res = await axios.post(`${API_URL}${endpoint}`, { email, password });
      
      if (isRegistering) {
        setMessage({ text: 'Account created! Please login.', type: 'success' });
        setIsRegistering(false);
      } else {
        onLogin(res.data.token); // Pass token up to App.jsx
      }
    } catch (err) {
      setMessage({ 
        text: err.response?.data || 'Something went wrong. Please try again.', 
        type: 'error' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-12 p-8 bg-white rounded-xl shadow-lg border border-gray-100">
      <h2 className="text-3xl font-extrabold text-center text-gray-800 mb-2">
        {isRegistering ? 'Create Account' : 'Welcome Back'}
      </h2>
      <p className="text-center text-gray-500 mb-8">
        {isRegistering ? 'Sign up to manage your tasks' : 'Login to access your todos'}
      </p>

      {message.text && (
        <div className={`p-3 mb-4 rounded text-sm ${
          message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
        }`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="relative">
          <Mail className="absolute left-3 top-3 text-gray-400" size={20} />
          <input
            type="email"
            placeholder="Email Address"
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="relative">
          <Lock className="absolute left-3 top-3 text-gray-400" size={20} />
          <input
            type="password"
            placeholder="Password"
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button
          disabled={loading}
          className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition flex justify-center items-center"
        >
          {loading ? <Loader2 className="animate-spin" /> : (isRegistering ? 'Sign Up' : 'Sign In')}
        </button>
      </form>

      <div className="mt-6 text-center">
        <button
          onClick={() => setIsRegistering(!isRegistering)}
          className="text-indigo-600 hover:underline text-sm font-medium"
        >
          {isRegistering ? 'Already have an account? Login' : "Don't have an account? Register"}
        </button>
      </div>
    </div>
  );
}