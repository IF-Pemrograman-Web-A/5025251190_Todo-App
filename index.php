<?php
ob_start();
require_once 'config.php';
$page = isset($_GET['page']) ? $_GET['page'] : 'personal';

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['add_task_form'])) {
    $title = $_POST['title'];
    $priority = $_POST['priority'];
    $date = date('Y-m-d');
    $notification_time = !empty($_POST['notification_time']) ? $_POST['notification_time'] : null;
    $type = ($page == 'shared') ? 'shared' : 'personal';
    $imagePath = null;

    if (isset($_FILES['image_file']) && $_FILES['image_file']['error'] === UPLOAD_ERR_OK) {
        $fileTmpPath = $_FILES['image_file']['tmp_name'];
        $fileName = $_FILES['image_file']['name'];
        $fileExtension = strtolower(pathinfo($fileName, PATHINFO_EXTENSION));
        $allowedExtensions = ['jpg', 'jpeg', 'png', 'gif'];
        if (in_array($fileExtension, $allowedExtensions)) {
            $uploadFileDir = 'uploads/';
            if (!is_dir($uploadFileDir)) { mkdir($uploadFileDir, 0755, true); }
            $newFileName = md5(time() . $fileName) . '.' . $fileExtension;
            $dest_path = $uploadFileDir . $newFileName;
            if (move_uploaded_file($fileTmpPath, $dest_path)) {
                $imagePath = $dest_path;
            }
        }
    } elseif (!empty($_POST['image_base64'])) {
        $data = $_POST['image_base64'];
        if (preg_match('/^data:image\/(\w+);base64,/', $data, $type_match)) {
            $extension = $type_match[1];
            $data = substr($data, strpos($data, ',') + 1);
            $data = base64_decode($data);
            if ($data !== false) {
                $uploadFileDir = 'uploads/';
                if (!is_dir($uploadFileDir)) { mkdir($uploadFileDir, 0755, true); }
                $newFileName = md5(time() . rand()) . '.' . $extension;
                $dest_path = $uploadFileDir . $newFileName;
                if (file_put_contents($dest_path, $data)) {
                    $imagePath = $dest_path;
                }
            }
        }
    }

    $stmt = $pdo->prepare("INSERT INTO kegiatan (title, priority, date, notification_time, image, type) VALUES (?, ?, ?, ?, ?, ?)");
    $stmt->execute([$title, $priority, $date, $notification_time, $imagePath, $type]);
    
    header("Location: index.php?page=" . $page);
    exit();
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Todo List Webpage</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <header>
        <h1>To Do List Webpage (<?= ucfirst($page) ?> Mode)</h1>
        <button id="theme-toggle" aria-label="Toggle Dark Mode">Dark Mode</button>
    </header>
    <main class="todo-container">
        <aside class="left-panel">
            <?php include 'menubar.php'; ?>
            
            <section class="form-section">
                <h3>Add New task</h3>
                <form method="POST" action="index.php?page=<?= $page ?>" enctype="multipart/form-data">
    <div class="form-group">
        <label for="todo-title">Nama Tugas</label>
        <input type="text" name="title" id="todo-title" placeholder="Enter new task" required>
    </div>
    <div class="form-group">
        <label for="todo-priority">Priority</label>
        <select name="priority" id="todo-priority">
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
        </select>
    </div>
    <div class="form-group">
        <label>Foto Tugas / Kamera</label>
        <button type="button" id="btn-start-camera" class="btn-edit" style="background-color: #8e44ad; color: white; margin-bottom: 5px;">Buka Kamera</button>
        <video id="camera-stream" autoplay playsinline style="width: 100%; max-height: 180px; display: none; background: #000; border-radius: 4px; margin-bottom: 5px;"></video>
        <button type="button" id="btn-capture" class="btn-submit" style="display: none; background-color: #e67e22; margin-bottom: 5px;">Ambil Foto</button>
        <canvas id="camera-canvas" style="display: none;"></canvas>
        
        <input type="file" name="image_file" id="todo-file-input" accept="image/*" style="margin-top: 5px;">
        <input type="hidden" name="image_base64" id="todo-image-data">
        <div id="form-img-preview" style="margin-top: 5px;"></div>
    </div>
    <div class="form-group">
        <label for="todo-notification">Waktu Notifikasi</label>
        <input type="datetime-local" name="notification_time" id="todo-notification">
    </div>
    <button type="submit" name="add_task_form" class="btn-submit">Save To Do</button>
</form>
            </section>
        </aside>
        
        <section class="right-panel">
            <div class="editor-header">
                <h2>To Do Detail / Management</h2>
                <span id="detail-priority-badge" class="badge">Priority</span>
            </div>
            
            <div class="editor-body">
                <?php
                if ($page == 'personal') {
                    include 'personalcontent.php';
                } elseif ($page == 'shared') {
                    include 'sharedcontent.php';
                } else {
                    echo "<p>Halaman tidak ditemukan.</p>";
                }
                ?>
            </div>
        </section>
    </main>
    <script src="script.js"></script>
</body>
</html>