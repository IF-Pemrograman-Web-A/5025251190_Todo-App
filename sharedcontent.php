<?php
if (isset($_GET['delete'])) {
    $id = $_GET['delete'];    
    $stmtSelect = $pdo->prepare("SELECT image FROM kegiatan WHERE id = ?");
    $stmtSelect->execute([$id]);
    $taskData = $stmtSelect->fetch(PDO::FETCH_ASSOC);

    if ($taskData && !empty($taskData['image']) && file_exists($taskData['image'])) {
        unlink($taskData['image']);
    }    
    $stmt = $pdo->prepare("DELETE FROM kegiatan WHERE id = ?");
    $stmt->execute([$id]);
    header("Location: index.php?page=shared");
    exit();
}
if (isset($_GET['toggle'])) {
    $id = $_GET['toggle'];
    $stmt = $pdo->prepare("UPDATE kegiatan SET completed = NOT completed WHERE id = ?");
    $stmt->execute([$id]);    
    header("Location: index.php?page=shared");
    exit();
}

$stmt = $pdo->prepare("SELECT * FROM kegiatan WHERE type = 'shared' ORDER BY id DESC");
$stmt->execute();
$kegiatan = $stmt->fetchAll(PDO::FETCH_ASSOC);
?>

<h3>Shared Tasks List</h3>
<p style="margin-bottom: 10px; color: #7f8c8d; font-size: 0.9rem;">Daftar tugas bersama</p>

<ul class="todo-list">
    <?php if (empty($kegiatan)): ?>
        <li class="todo-item">Tidak ada tugas bersama saat ini.</li>
    <?php else: ?>
        <?php foreach ($kegiatan as $todo): ?>
            <li class="todo-item" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                <div>
                    <input type="checkbox" onclick="window.location.href='index.php?page=shared&toggle=<?= $todo['id'] ?>'" <?= $todo['completed'] ? 'checked' : '' ?>>                    
                    <span style="text-decoration: <?= $todo['completed'] ? 'line-through' : 'none' ?>; margin-left: 8px;">
                        <strong><?= htmlspecialchars($todo['title']) ?></strong>
                    </span>
                    <small style="margin-left: 10px;"><?= $todo['priority'] ?> Priority</small>
                    <?php if (!empty($todo['image'])): ?>
                        <br><img src="<?= htmlspecialchars($todo['image']) ?>" alt="Task Image" style="max-width: 80px; margin-top: 5px; border-radius: 4px;">
                    <?php endif; ?>
                </div>
                <div>
                    <a href="index.php?page=shared&edit=<?= $todo['id'] ?>" class="btn-edit" style="padding: 5px 10px; text-decoration: none; border-radius: 4px; font-size: 0.8rem; background-color: #3498db; color: white; margin-right: 5px;">Edit</a>                    
                    <a href="index.php?page=shared&delete=<?= $todo['id'] ?>" class="btn-delete" style="padding: 5px 10px; text-decoration: none; border-radius: 4px; font-size: 0.8rem; background-color: #e74c3c; color: white;" onclick="return confirm('Yakin ingin menghapus tugas ini?')">Hapus</a>
                </div>
            </li>
        <?php endforeach; ?>
    <?php endif; ?>
</ul>