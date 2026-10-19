const inputFile = document.getElementById('todo-file-input');
const btnStartCamera = document.getElementById('btn-start-camera');
const videoStream = document.getElementById('camera-stream');
const btnCapture = document.getElementById('btn-capture');
const canvas = document.getElementById('camera-canvas');
const inputImageData = document.getElementById('todo-image-data');
const formImgPreview = document.getElementById('form-img-preview');
let mediaStream = null;

function stopCamera() {
    if (mediaStream) {
        mediaStream.getTracks().forEach(track => track.stop());
        mediaStream = null;
    }
    if (videoStream) videoStream.style.display = 'none';
    if (btnCapture) btnCapture.style.display = 'none';
}

function showPreview(src) {
    if (formImgPreview) {
        formImgPreview.innerHTML =
            `<img src="${src}" alt="Preview" style="max-width:100px;border-radius:4px;border:1px solid #ccc;">`;
    }
}

if (btnStartCamera && videoStream && btnCapture && canvas) {
    btnStartCamera.addEventListener('click', async () => {
        try {
            if (inputFile) inputFile.value = '';
            mediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
            videoStream.srcObject = mediaStream;
            videoStream.style.display = 'block';
            btnCapture.style.display = 'block';
        } catch (err) {
            alert('Tidak dapat mengakses kamera. Pastikan webcam terhubung dan izin akses diberikan.');
            console.error(err);
        }
    });

    btnCapture.addEventListener('click', () => {
        if (!mediaStream) return;
        canvas.width = videoStream.videoWidth || 640;
        canvas.height = videoStream.videoHeight || 480;
        canvas.getContext('2d').drawImage(videoStream, 0, 0, canvas.width, canvas.height);

        const base64Image = canvas.toDataURL('image/jpeg', 0.8);
        inputImageData.value = base64Image;
        showPreview(base64Image);
        stopCamera();
    });
}

if (inputFile) {
    inputFile.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        stopCamera();
        if (inputImageData) inputImageData.value = '';
        const reader = new FileReader();
        reader.onload = (ev) => showPreview(ev.target.result);
        reader.readAsDataURL(file);
    });
}

const themeToggleBtn = document.getElementById('theme-toggle');
if (themeToggleBtn) {
    if (localStorage.getItem('theme') === 'dark') {
        document.body.classList.add('dark-mode');
        themeToggleBtn.textContent = 'Light Mode';
    }
    themeToggleBtn.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        const theme = document.body.classList.contains('dark-mode') ? 'dark' : 'light';
        themeToggleBtn.textContent = theme === 'dark' ? 'Light Mode' : 'Dark Mode';
        localStorage.setItem('theme', theme);
    });
}

async function setupNotifications() {
    if (!('serviceWorker' in navigator) || !('Notification' in window)) return;

    let registration;
    try {
        registration = await navigator.serviceWorker.register('sw.js');
    } catch (err) {
        console.error('Gagal mendaftarkan service worker:', err);
        return;
    }

    if (Notification.permission === 'default') {
        await Notification.requestPermission();
    }
    if (Notification.permission !== 'granted') return;

    document.querySelectorAll('.todo-item[data-notification]').forEach(item => {
        if (item.dataset.completed === '1') return;
        const target = new Date(item.dataset.notification.replace(' ', 'T')).getTime();
        const delay = target - Date.now();
        if (isNaN(target) || delay <= 0 || delay > 2147483647) return;

        setTimeout(() => {
            registration.showNotification('Pengingat Tugas', {
                body: item.dataset.title || 'Ada tugas yang perlu dikerjakan',
                icon: 'icon.png'
            });
        }, delay);
    });
}
setupNotifications();