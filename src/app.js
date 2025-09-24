const path = require('path');
const express = require('express');
const { nanoid } = require('nanoid');

const app = express();

// Core middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static frontend
app.use(express.static(path.join(__dirname, '..', 'public')));

// Health probe (kept from your starter)
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'mini-todo-vibecode' });
});

// In‑memory data store (resets on restart; fine for the kata)
const db = {
  lists: [
    { id: nanoid(8), name: 'General', todos: [] }
  ]
};

// Helpers
function getList(id) { return db.lists.find(l => l.id === id); }

// Lists
app.get('/api/lists', (req, res) => {
  res.json(db.lists);
});

app.post('/api/lists', (req, res) => {
  const name = (req.body.name || '').trim();
  if (!name) return res.status(400).json({ error: 'List name required' });
  const list = { id: nanoid(8), name, todos: [] };
  db.lists.push(list);
  res.status(201).json(list);
});

// Todos within a list
app.get('/api/lists/:listId/todos', (req, res) => {
  const list = getList(req.params.listId);
  if (!list) return res.status(404).json({ error: 'List not found' });
  res.json(list.todos);
});

app.post('/api/lists/:listId/todos', (req, res) => {
  const list = getList(req.params.listId);
  if (!list) return res.status(404).json({ error: 'List not found' });
  const text = (req.body.text || '').trim();
  if (!text) return res.status(400).json({ error: 'Todo text required' });
  const todo = { id: nanoid(8), text, completed: false, createdAt: Date.now() };
  list.todos.push(todo);
  res.status(201).json(todo);
});

app.patch('/api/lists/:listId/todos/:todoId', (req, res) => {
  const list = getList(req.params.listId);
  if (!list) return res.status(404).json({ error: 'List not found' });
  const todo = list.todos.find(t => t.id === req.params.todoId);
  if (!todo) return res.status(404).json({ error: 'Todo not found' });
  if (typeof req.body.completed === 'boolean') todo.completed = req.body.completed;
  if (typeof req.body.text === 'string') todo.text = req.body.text.trim();
  res.json(todo);
});

// Root → serve the app
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

module.exports = app;
