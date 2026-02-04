const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const path = require('path');
const mongoose = require('mongoose');

const app = express();
const port = 3000;
const cors = require('cors');
app.use(cors()); // Place this above your routes
app.use(bodyParser.json());

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/todo-app')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Could not connect to MongoDB', err));

// --- SCHEMAS ---

// User Schema
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }
});
const User = mongoose.model('User', userSchema);

// Todo Schema
const todoSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  status: { 
    type: String, 
    enum: ['Pending', 'Completed'], 
    default: 'Pending' 
  },
  createdAt: { type: Date, default: Date.now },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
});
const Todo = mongoose.model('Todo', todoSchema);

// --- AUTH CONFIG ---

const tokenBlacklist = new Set();
const JWT_SECRET = 'your_secret_key';

// Middleware to verify JWT and attach user object
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) return res.sendStatus(401);
  if (tokenBlacklist.has(token)) return res.status(401).send('Token is blacklisted');

  jwt.verify(token, JWT_SECRET, async (err, decoded) => {
    if (err) return res.sendStatus(403);
    
    // Fetch user from DB to get the _id for associations
    const user = await User.findOne({ email: decoded.email });
    if (!user) return res.sendStatus(404);
    
    req.user = user; 
    next();
  });
};

// --- AUTH ROUTES ---

app.post('/register', async (req, res) => {
  try {
    const { email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ email, password: hashedPassword });
    await user.save();
    res.status(201).send('User registered successfully');
  } catch (error) {
    res.status(500).send('Error registering user');
  }
});

app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).send('Invalid credentials');
    }
    const token = jwt.sign({ email: user.email }, JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
  } catch (error) {
    res.status(500).send('Error logging in');
  }
});

// --- TODO ROUTES (The Logic You Requested) ---

// 1. Create Todo
app.post('/todos', authenticateToken, async (req, res) => {
  try {
    const { title, description } = req.body;
    const newTodo = new Todo({
      title,
      description,
      userId: req.user._id // Linked to logged-in user
    });
    await newTodo.save();
    res.status(201).json(newTodo);
  } catch (error) {
    res.status(400).send('Error creating todo: Title is required');
  }
});

/// GET /todos with Ownership check and Stats
app.get('/todos', authenticateToken, async (req, res) => {
  try {
    const { status } = req.query;
    let query = { userId: req.user._id }; // Strict ownership

    if (status && status !== 'All') {
      query.status = status;
    }

    const todos = await Todo.find(query).sort({ createdAt: -1 });
    
    // Get counts for the Todo Counter feature
    const pendingCount = await Todo.countDocuments({ userId: req.user._id, status: 'Pending' });
    const completedCount = await Todo.countDocuments({ userId: req.user._id, status: 'Completed' });

    res.json({ todos, stats: { pendingCount, completedCount } });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching todos' });
  }
});

// 3. Update Todo (Text or Status Toggle)
app.put('/todos/:id', authenticateToken, async (req, res) => {
  try {
    const { title, description, status } = req.body;
    // Ensure the todo belongs to the user before updating
    const updatedTodo = await Todo.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { title, description, status },
      { new: true, runValidators: true }
    );

    if (!updatedTodo) return res.status(404).send('Todo not found');
    res.json(updatedTodo);
  } catch (error) {
    res.status(400).send('Error updating todo');
  }
});

// 4. Delete Todo
app.delete('/todos/:id', authenticateToken, async (req, res) => {
  try {
    const deletedTodo = await Todo.findOneAndDelete({ 
      _id: req.params.id, 
      userId: req.user._id 
    });

    if (!deletedTodo) return res.status(404).send('Todo not found');
    res.send('Todo deleted successfully');
  } catch (error) {
    res.status(500).send('Error deleting todo');
  }
});

// --- SERVER & LOGOUT ---

app.post('/logout', (req, res) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (token) tokenBlacklist.add(token);
  res.send('Logged out successfully');
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});