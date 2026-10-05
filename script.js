let db;
let todos = [];
let selectedTodoId = null;

const todoListContainer = document.querySelector('.todo-list');
const form = document.querySelector('form');
const inputTitle = document.getElementById('todo-title');
const inputPriority = document.getElementById('todo-priority');
const inputNotification = document.getElementById('todo-notification');
const inputFile = document.getElementById('todo-file-input');
const btnStartCamera = document.getElementById('btn-start-camera');
const videoStream = document.getElementById('camera-stream');
const btnCapture = document.getElementById('btn-capture');
const canvas = document.getElementById('camera-canvas');
const inputImageData = document.getElementById('todo-image-data');
const formImgPreview = document.getElementById('form-img-preview');
let mediaStream = null;
const detailTitle = document.getElementById('detail-title');
const detailStatus = document.getElementById('detail-status');
const detailDate = document.getElementById('detail-date');
const detailPriority = document.getElementById('detail-priority'); 
const detailBadge = document.getElementById('detail-priority-badge');
const btnEdit = document.getElementById('btn-edit');
const btnDelete = document.getElementById('btn-delete');
const btnSave = document.getElementById('btn-save');

function initDB() {
    const request = indexedDB.open('TodoAppDB', 1);
    request.onerror = (event) => {
        console.error("IndexedDB error:", event.target.error);
    };
    request.onsuccess = (event) => {
        db = event.target.result;
        loadTodosFromDB();
    };
    request.onupgradeneeded = (event) => {
        const dbInstance = event.target.result;
        if (!dbInstance.objectStoreNames.contains('todos')) {
            dbInstance.createObjectStore('todos', { keyPath: 'id' });
        }
    };
}
function loadTodosFromDB() {
    const transaction = db.transaction(['todos'], 'readonly');
    const store = transaction.objectStore('todos');
    const request = store.getAll();
    request.onsuccess = (event) => {
        todos = event.target.result || [];
        renderTodos();
        checkNotifications();
    };
}
function saveTodoToDB(todo, callback) {
    const transaction = db.transaction(['todos'], 'readwrite');
    const store = transaction.objectStore('todos');
    const request = store.put(todo);
    request.onsuccess = () => {
        if (callback) callback();
    };
}
function deleteTodoFromDB(id, callback) {
    const transaction = db.transaction(['todos'], 'readwrite');
    const store = transaction.objectStore('todos');
    const request = store.delete(id);
    request.onsuccess = () => {
        if (callback) callback();
    };
}
if (btnStartCamera) {
    btnStartCamera.addEventListener('click', async () => {
        try {
            if (inputFile) inputFile.value = ''; 
            mediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
            videoStream.style.display = 'block';
            btnCapture.style.display = 'block';
            videoStream.srcObject = mediaStream;
        } catch (err) {
            alert("Tidak dapat mengakses kamera laptop. Pastikan webcam terhubung dan izin akses diberikan melalui localhost/HTTPS.");
            console.error(err);
        }
    });
    btnCapture.addEventListener('click', () => {
        if (!mediaStream) return;
        canvas.width = videoStream.videoWidth || 640;
        canvas.height = videoStream.videoHeight || 480;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(videoStream, 0, 0, canvas.width, canvas.height);
        const base64Image = canvas.toDataURL('image/png');
        inputImageData.value = base64Image;
        formImgPreview.innerHTML = `<img src="${base64Image}" alt="Preview" style="max-width: 100px; border-radius: 4px; border: 1px solid #ccc;">`;
        mediaStream.getTracks().forEach(track => track.stop());
        videoStream.style.display = 'none';
        btnCapture.style.display = 'none';
    });
}
if (inputFile) {
    inputFile.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            if (mediaStream) {
                mediaStream.getTracks().forEach(track => track.stop());
                videoStream.style.display = 'none';
                btnCapture.style.display = 'none';
            }
            const reader = new FileReader();
            reader.onload = function(uploadEvent) {
                const base64File = uploadEvent.target.result;
                inputImageData.value = base64File;
                formImgPreview.innerHTML = `<img src="${base64File}" alt="Preview" style="max-width: 100px; border-radius: 4px; border: 1px solid #ccc;">`;
            };
            reader.readAsDataURL(file);
        }
    });
}
const themeToggleBtn = document.getElementById('theme-toggle');
const currentTheme = localStorage.getItem('theme');
if (currentTheme === 'dark') {
    document.body.classList.add('dark-mode');
    themeToggleBtn.textContent = 'Light Mode';
}
themeToggleBtn.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    let theme = 'light';
    if (document.body.classList.contains('dark-mode')) {
        theme = 'dark';
        themeToggleBtn.textContent = 'Light Mode';
    } else {
        themeToggleBtn.textContent = 'Dark Mode';
    }
    localStorage.setItem('theme', theme);
});
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
            saveTodoToDB(todo, () => {
                if (selectedTodoId === todo.id) showDetail(todo);
                renderTodos();
            });
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
    detailDate.value = todo.date || '';
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
    let imgPreview = document.getElementById('detail-img-preview');
    if (!imgPreview) {
        const editorBody = document.querySelector('.editor-body');
        imgPreview = document.createElement('div');
        imgPreview.id = 'detail-img-preview';
        imgPreview.style.margin = '10px 0';
        editorBody.insertBefore(imgPreview, document.querySelector('.editor-actions'));
    }
    if (todo.image) {
        imgPreview.innerHTML = `<label>Foto Tugas:</label><br><img src="${todo.image}" alt="Task Image" style="max-width: 100%; max-height: 150px; border-radius: 4px; margin-top: 5px;">`;
    } else {
        imgPreview.innerHTML = '';
    }
    detailTitle.readOnly = true;
    detailPriority.disabled = true; 
    detailDate.disabled = true;
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
        date: new Date().toISOString().split('T')[0],
        image: inputImageData.value || null,
        notificationTime: inputNotification ? inputNotification.value : null
    };
    todos.push(newTodo);
    saveTodoToDB(newTodo, () => {
        inputTitle.value = '';
        inputImageData.value = '';
        if (inputFile) inputFile.value = '';
        formImgPreview.innerHTML = '';
        if (inputNotification) inputNotification.value = '';
        renderTodos();
        scheduleNotification(newTodo);
    });
});
btnDelete.addEventListener('click', () => {
    if (!selectedTodoId) return alert("Pilih tugas yang ingin dihapus dari list!");    
    deleteTodoFromDB(selectedTodoId, () => {
        todos = todos.filter(t => t.id !== selectedTodoId);
        selectedTodoId = null;
        detailTitle.value = '';
        detailStatus.value = '';
        detailDate.value = ''; 
        detailPriority.value = 'Low';
        detailBadge.textContent = 'Priority';
        detailBadge.className = 'badge';
        detailBadge.style.backgroundColor = ''; 
        const imgPreview = document.getElementById('detail-img-preview');
        if (imgPreview) imgPreview.innerHTML = '';
        renderTodos();
    });
});
btnEdit.addEventListener('click', () => {
    if (!selectedTodoId) return alert("Pilih tugas yang ingin diedit dari list!");    
    detailTitle.readOnly = false;
    detailPriority.disabled = false;
    detailDate.disabled = false; 
    detailTitle.focus(); 
    btnEdit.style.display = 'none';
    btnSave.style.display = 'inline-block';
});
btnSave.addEventListener('click', () => {
    const todoIndex = todos.findIndex(t => t.id === selectedTodoId);
    if (todoIndex !== -1) {
        todos[todoIndex].title = detailTitle.value;
        todos[todoIndex].priority = detailPriority.value;       
        todos[todoIndex].date = detailDate.value; 
        
        saveTodoToDB(todos[todoIndex], () => {
            showDetail(todos[todoIndex]); 
            renderTodos();
        });
    }
});
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
            .then(reg => console.log('SW registered:', reg.scope))
            .catch(err => console.error('SW registration failed:', err));
    });
}
function requestNotificationPermission() {
    if ('Notification' in window && Notification.permission !== 'granted') {
        Notification.requestPermission();
    }
}
requestNotificationPermission();
function scheduleNotification(todo) {
    if (!todo.notificationTime) return;
    const notificationTime = new Date(todo.notificationTime).getTime();
    const now = new Date().getTime();
    const delay = notificationTime - now;
    if (delay > 0) {
        setTimeout(() => {
            if (Notification.permission === 'granted') {
                if (navigator.serviceWorker && navigator.serviceWorker.controller) {
                    navigator.serviceWorker.controller.postMessage({
                        type: 'SHOW_NOTIFICATION',
                        title: 'Pengingat Tugas!',
                        body: `Tugas "${todo.title}" sudah waktunya!`
                    });
                } else {
                    new Notification('Pengingat Tugas!', {
                        body: `Tugas "${todo.title}" sudah waktunya!`
                    });
                }
            }
        }, delay);
    }
}
function checkNotifications() {
    todos.forEach(todo => {
        if (todo.notificationTime && !todo.completed) {
            scheduleNotification(todo);
        }
    });
}
initDB();