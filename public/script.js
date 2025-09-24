const els = {
  lists: document.getElementById('lists'),
  todos: document.getElementById('todos'),
  newListName: document.getElementById('newListName'),
  addListBtn: document.getElementById('addListBtn'),
  newTodoText: document.getElementById('newTodoText'),
  addTodoBtn: document.getElementById('addTodoBtn'),
  todosTitle: document.getElementById('todosTitle'),
};

let state = { lists: [], activeListId: null };

async function api(path, opts = {}) {
  const res = await fetch(path, { headers: { 'Content-Type': 'application/json' }, ...opts });
  if (!res.ok) throw new Error((await res.json()).error || res.statusText);
  return res.json();
}

async function load() {
  state.lists = await api('/api/lists');
  if (!state.activeListId && state.lists[0]) state.activeListId = state.lists[0].id;
  renderLists();
  renderTodos();
}

function renderLists() {
  els.lists.innerHTML = '';
  state.lists.forEach(list => {
    const li = document.createElement('li');
    li.className = list.id === state.activeListId ? 'active' : '';
    li.innerHTML = `<span class="name">${list.name}</span>`;
    li.onclick = () => { state.activeListId = list.id; renderLists(); renderTodos(); };
    els.lists.appendChild(li);
  });
}

async function renderTodos() {
  els.todos.innerHTML = '';
  const list = state.lists.find(l => l.id === state.activeListId);
  if (!list) return;
  els.todosTitle.textContent = `Todos — ${list.name}`;
  const todos = await api(`/api/lists/${list.id}/todos`);
  todos.forEach(todo => {
    const li = document.createElement('li');
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = !!todo.completed;
    checkbox.onchange = async () => {
      await api(`/api/lists/${list.id}/todos/${todo.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ completed: checkbox.checked })
      });
      textSpan.classList.toggle('completed', checkbox.checked);
    };
    const textSpan = document.createElement('span');
    textSpan.className = 'todo-text' + (todo.completed ? ' completed' : '');
    textSpan.textContent = todo.text;
    li.append(checkbox, textSpan);
    els.todos.appendChild(li);
  });
}

// Events
els.addListBtn.onclick = async () => {
  const name = els.newListName.value.trim();
  if (!name) return;
  const list = await api('/api/lists', { method: 'POST', body: JSON.stringify({ name }) });
  state.lists.push(list);
  state.activeListId = list.id;
  els.newListName.value = '';
  renderLists();
  renderTodos();
};

els.addTodoBtn.onclick = async () => {
  const text = els.newTodoText.value.trim();
  if (!text) return;
  const list = state.lists.find(l => l.id === state.activeListId);
  if (!list) return;
  await api(`/api/lists/${list.id}/todos`, { method: 'POST', body: JSON.stringify({ text }) });
  els.newTodoText.value = '';
  renderTodos();
};

load().catch(err => alert(err.message));
