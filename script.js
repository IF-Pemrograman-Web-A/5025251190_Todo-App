let todos = [];
let selectedTodoId = null;

const todoListContainer = document.querySelector('.todo-list');
const form = document.querySelector('form');
const inputTitle = document.getElementById('todo-title');
const inputPriority = document.getElementById('todo-priority');
const detailTitle = document.getElementById('detail-title');
const detailStatus = document.getElementById('detail-status');
const detailDate = document.getElementById('detail-date');
const detailPriority = document.getElementById('detail-priority'); 
const detailBadge = document.getElementById('detail-priority-badge');
const btnEdit = document.getElementById('btn-edit');
const btnDelete = document.getElementById('btn-delete');
const btnSave = document.getElementById('btn-save');

function renderTodos() {
    todoListContainer.innerHTML = '';
    todos.forEach(todo => {
        const li = document.createElement('li');
        li.className = `todo-item ${selectedTodoId === todo.id ? 'active' : ''}`;
        li.innerHTML = `
            <input type="checkbox" class="todo-checkbox" ${todo.completed ? 'checked' : ''}>
            <span style="text-decoration: ${todo.completed ? 'line-through' : 'none'}">${todo.title}</span>
            <small>${todo.priority} Priority</small>
        `;
        const checkbox = li.querySelector('.todo-checkbox');
        checkbox.addEventListener('change', (e) => {
            todo.completed = e.target.checked;
            if (selectedTodoId === todo.id) showDetail(todo);
            renderTodos();
        });
        li.addEventListener('click', (e) => {
            if (e.target !== checkbox) {
                selectedTodoId = todo.id;
                showDetail(todo);
                renderTodos();
            }
        });
        todoListContainer.appendChild(li);
    });
}

function showDetail(todo) {
    detailTitle.value = todo.title;
    detailStatus.value = todo.completed ? "Completed" : "In Progress";
    detailDate.value = todo.date;
    detailPriority.value = todo.priority;
    detailBadge.textContent = `${todo.priority} Priority`;    
    detailBadge.className = 'badge';
    if (todo.priority === 'High') {
        detailBadge.classList.add('high');
        detailBadge.style.backgroundColor = ''; 
    } else if (todo.priority === 'Medium') {
        detailBadge.style.backgroundColor = '#3498db';
        detailBadge.style.color = 'white';
    } else {
        detailBadge.style.backgroundColor = '#95a5a6';
        detailBadge.style.color = 'white';
    }
    detailTitle.readOnly = true;
    detailPriority.disabled = true; 
    btnSave.style.display = 'none';
    btnEdit.style.display = 'inline-block';
}

form.addEventListener('submit', (e) => {
    e.preventDefault();     
    const newTodo = {
        id: Date.now(), 
        title: inputTitle.value,
        priority: inputPriority.value,
        completed: false,
        date: new Date().toISOString().split('T')[0]
    };
    todos.push(newTodo);
    inputTitle.value = '';
    renderTodos(); 
});

btnDelete.addEventListener('click', () => {
    if (!selectedTodoId) return alert("Pilih tugas yang ingin dihapus dari list!");    
    todos = todos.filter(t => t.id !== selectedTodoId);
    selectedTodoId = null;
    detailTitle.value = '';
    detailStatus.value = '';
    detailDate.value = ''; 
    detailPriority.value = 'Low';
    detailBadge.textContent = 'Priority';
    detailBadge.className = 'badge';
    detailBadge.style.backgroundColor = '';    
    renderTodos();
});

btnEdit.addEventListener('click', () => {
    if (!selectedTodoId) return alert("Pilih tugas yang ingin diedit dari list!");    
    detailTitle.readOnly = false;
    detailPriority.disabled = false;
    detailTitle.focus(); 
    btnEdit.style.display = 'none';
    btnSave.style.display = 'inline-block';
});
btnSave.addEventListener('click', () => {
    const todoIndex = todos.findIndex(t => t.id === selectedTodoId);
    if (todoIndex !== -1) {
        todos[todoIndex].title = detailTitle.value;
        todos[todoIndex].priority = detailPriority.value;      
        showDetail(todos[todoIndex]); 
        renderTodos();
    }
});

const themeToggleBtn = document.getElementById('theme-toggle');
themeToggleBtn.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
});

renderTodos();