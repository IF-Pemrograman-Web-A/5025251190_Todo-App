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
    header("Location: index.php?page=personal");
    exit();
}

if (isset($_GET['toggle'])) {
    $id = $_GET['toggle'];
    $stmt = $pdo->prepare("UPDATE kegiatan SET completed = NOT completed WHERE id = ?");
    $stmt->execute([$id]);
    header("Location: index.php?page=personal");
    exit();
}

$stmt = $pdo->prepare("SELECT * FROM kegiatan WHERE type = 'personal' ORDER BY id DESC");
$stmt->execute();
$kegiatan = $stmt->fetchAll(PDO::FETCH_ASSOC);
?>

<h3>Personal Tasks List</h3>
<ul class="todo-list" style="margin-top: 15px;">
    <?php if (empty($kegiatan)): ?>
        <li>Tidak ada tugas personal saat ini.</li>
    <?php else: ?>
        <?php foreach ($kegiatan as $todo): ?>
            <li class="todo-item"
                data-title="<?= htmlspecialchars($todo['title']) ?>"
                data-notification="<?= htmlspecialchars($todo['notification_time'] ?? '') ?>"
                data-completed="<?= $todo['completed'] ? '1' : '0' ?>"
                style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                <div>
                    <input type="checkbox" onclick="window.location.href='index.php?page=personal&toggle=<?= $todo['id'] ?>'" <?= $todo['completed'] ? 'checked' : '' ?>>
                    <span style="text-decoration: <?= $todo['completed'] ? 'line-through' : 'none' ?>; margin-left: 8px;">
                        <strong><?= htmlspecialchars($todo['title']) ?></strong>
                    </span>
                    <small style="margin-left: 10px;"><?= $todo['priority'] ?> Priority</small>
                    <?php if (!empty($todo['image'])): ?>
                        <br><img src="<?= htmlspecialchars($todo['image']) ?>" alt="Img" style="max-width: 60px; margin-top: 4px; border-radius: 4px;">
                    <?php endif; ?>
                </div>
                <div>
                    <a href="index.php?page=personal&delete=<?= $todo['id'] ?>" class="btn-delete" style="padding: 4px 8px; text-decoration: none; border-radius: 4px; font-size: 0.75rem; background: #e74c3c; color: white;" onclick="return confirm('Hapus tugas ini?')">Delete</a>
                </div>
            </li>
        <?php endforeach; ?>
    <?php endif; ?>
</ul>