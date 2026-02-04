// frontend/src/components/TodoApp.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Trash2, CheckCircle, Circle, Plus, Loader2 } from 'lucide-react';

const API_URL = 'http://localhost:3000';

export default function TodoApp({ token }) {
  const [todos, setTodos] = useState([]);
  const [stats, setStats] = useState({ pendingCount: 0, completedCount: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('All');
  const [newTodo, setNewTodo] = useState({ title: '', description: '' });

  const axiosConfig = { headers: { Authorization: `Bearer ${token}` } };

  useEffect(() => {
    fetchTodos();
  }, [filter]);

  const fetchTodos = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/todos?status=${filter}`, axiosConfig);
      setTodos(res.data.todos);
      setStats(res.data.stats);
    } catch (err) {
      setError('Failed to load todos.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddTodo = async (e) => {
    e.preventDefault();
    if (!newTodo.title.trim()) return alert("Title is required");
    
    try {
      await axios.post(`${API_URL}/todos`, newTodo, axiosConfig);
      setNewTodo({ title: '', description: '' });
      fetchTodos();
    } catch (err) {
      setError('Could not create todo.');
    }
  };

  const toggleStatus = async (todo) => {
    const newStatus = todo.status === 'Pending' ? 'Completed' : 'Pending';
    await axios.put(`${API_URL}/todos/${todo._id}`, { status: newStatus }, axiosConfig);
    fetchTodos();
  };

  const deleteTodo = async (id) => {
    if (window.confirm("Delete this todo?")) {
      await axios.delete(`${API_URL}/todos/${id}`, axiosConfig);
      fetchTodos();
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
      {/* Todo Counter */}
      <div className="flex flex-wrap gap-4 mb-8 justify-between items-center bg-gray-50 p-4 rounded-lg">
        <h1 className="text-2xl font-bold text-gray-800">My Tasks</h1>
        <div className="flex gap-4">
          <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
            Pending: {stats.pendingCount}
          </span>
          <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
            Done: {stats.completedCount}
          </span>
        </div>
      </div>

      {/* Form Validation & Input */}
      <form onSubmit={handleAddTodo} className="mb-8 space-y-3 bg-white shadow-sm p-4 rounded-md border">
        <input
          className="w-full p-2 border rounded"
          placeholder="Todo Title (Required)"
          value={newTodo.title}
          onChange={(e) => setNewTodo({...newTodo, title: e.target.value})}
          required
        />
        <textarea
          className="w-full p-2 border rounded"
          placeholder="Description (Optional)"
          value={newTodo.description}
          onChange={(e) => setNewTodo({...newTodo, description: e.target.value})}
        />
        <button className="flex items-center justify-center w-full bg-indigo-600 text-white p-2 rounded hover:bg-indigo-700 transition">
          <Plus size={18} className="mr-2" /> Add Task
        </button>
      </form>

      {/* Filtering */}
      <div className="flex gap-2 mb-6">
        {['All', 'Pending', 'Completed'].map(f => (
          <button 
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1 rounded-md text-sm ${filter === f ? 'bg-indigo-600 text-white' : 'bg-gray-200'}`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Loading & Empty States */}
      {loading ? (
        <div className="flex justify-center py-10"><Loader2 className="animate-spin text-indigo-600" /></div>
      ) : error ? (
        <div className="text-red-500 bg-red-50 p-4 rounded">{error}</div>
      ) : todos.length === 0 ? (
        <div className="text-center py-10 text-gray-500 border-2 border-dashed rounded-lg">
          No tasks found. Start by adding one above!
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {todos.map(todo => (
            <div key={todo._id} className="flex items-center justify-between p-4 bg-white border rounded-lg shadow-sm hover:shadow-md transition">
              <div className="flex items-start gap-3">
                <button onClick={() => toggleStatus(todo)} className="mt-1">
                  {todo.status === 'Completed' ? <CheckCircle className="text-green-500" /> : <Circle className="text-gray-400" />}
                </button>
                <div>
                  <h3 className={`font-semibold ${todo.status === 'Completed' ? 'line-through text-gray-400' : ''}`}>{todo.title}</h3>
                  <p className="text-sm text-gray-500">{todo.description}</p>
                </div>
              </div>
              <button onClick={() => deleteTodo(todo._id)} className="text-red-400 hover:text-red-600">
                <Trash2 size={20} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}