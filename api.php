<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

require_once 'config.php'; 

$method = $_SERVER['REQUEST_METHOD'];
$id = isset($_GET['id']) ? intval($_GET['id']) : null;

switch ($method) {
    case 'GET':
        try {
            if ($id) {
                $stmt = $pdo->prepare("SELECT * FROM kegiatan WHERE id = ?");
                $stmt->execute([$id]);
                $task = $stmt->fetch(PDO::FETCH_ASSOC);
                if ($task) {
                    http_response_code(200);
                    echo json_encode(["status" => "success", "data" => $task]);
                } else {
                    http_response_code(404); 
                    echo json_encode(["status" => "error", "message" => "Tugas dengan ID tersebut tidak ditemukan."]);
                }
            } else {
                $stmt = $pdo->prepare("SELECT * FROM kegiatan ORDER BY id DESC");
                $stmt->execute();
                $tasks = $stmt->fetchAll(PDO::FETCH_ASSOC);
                http_response_code(200);
                echo json_encode(["status" => "success", "count" => count($tasks), "data" => $tasks]);
            }
        } catch (Exception $e) {
            http_response_code(550); 
            echo json_encode(["status" => "error", "message" => $e->getMessage()]);
        }
        break;
    case 'POST':
        $data = json_decode(file_get_contents("php://input"), true);
        $title = isset($data['title']) ? trim($data['title']) : (isset($_POST['title']) ? trim($_POST['title']) : null);
        $priority = isset($data['priority']) ? $data['priority'] : (isset($_POST['priority']) ? $_POST['priority'] : 'Medium');
        $type = isset($data['type']) ? $data['type'] : (isset($_POST['type']) ? $_POST['type'] : 'personal');
        if (empty($title)) {
            http_response_code(400); 
            echo json_encode(["status" => "error", "message" => "Judul tugas wajib diisi."]);
            break;
        }
        try {
            $stmt = $pdo->prepare("INSERT INTO kegiatan (title, priority, date, type, completed) VALUES (?, ?, CURDATE(), ?, 0)");
            $stmt->execute([$title, $priority, $type]);
            $newId = $pdo->lastInsertId();
            http_response_code(201); 
            echo json_encode([
                "status" => "success",
                "message" => "Tugas berhasil ditambahkan.",
                "data" => ["id" => $newId, "title" => $title, "priority" => $priority, "type" => $type]
            ]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(["status" => "error", "message" => $e->getMessage()]);
        }
        break;
    case 'PUT':
        if (!$id) {
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => "Butuh ID tugas buat melakukan update."]);
            break;
        }
        $data = json_decode(file_get_contents("php://input"), true);        
        $check = $pdo->prepare("SELECT * FROM kegiatan WHERE id = ?");
        $check->execute([$id]);
        if (!$check->fetch()) {
            http_response_code(404); 
            echo json_encode(["status" => "error", "message" => "Tugas tidak ditemukan untuk di-update."]);
            break;
        }
        $title = isset($data['title']) ? trim($data['title']) : null;
        $priority = isset($data['priority']) ? $data['priority'] : null;
        $completed = isset($data['completed']) ? $data['completed'] : null;
        if (empty($title)) {
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => "Judul tugas gaboleh kosong."]);
            break;
        }
        try {
            $stmt = $pdo->prepare("UPDATE kegiatan SET title = ?, priority = ?, completed = ? WHERE id = ?");
            $stmt->execute([$title, $priority, $completed, $id]);
            http_response_code(200);
            echo json_encode(["status" => "success", "message" => "Tugas berhasil diupdate."]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(["status" => "error", "message" => $e->getMessage()]);
        }
        break;
    case 'DELETE':
        if (!$id) {
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => "Butuh ID tugas buat menghapus."]);
            break;
        }
        try {
            $stmtSelect = $pdo->prepare("SELECT image FROM kegiatan WHERE id = ?");
            $stmtSelect->execute([$id]);
            $taskData = $stmtSelect->fetch(PDO::FETCH_ASSOC);
            if (!$taskData) {
                http_response_code(404); 
                echo json_encode(["status" => "error", "message" => "Tugas yang mau dihapus tidak ditemukan."]);
                break;
            }
            if (!empty($taskData['image']) && file_exists($taskData['image'])) {
                unlink($taskData['image']);
            }
            $stmt = $pdo->prepare("DELETE FROM kegiatan WHERE id = ?");
            $stmt->execute([$id]);
            http_response_code(200);
            echo json_encode(["status" => "success", "message" => "Tugas berhasil dihapus."]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(["status" => "error", "message" => $e->getMessage()]);
        }
        break;
    case 'PATCH':
        if (!$id) {
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => "ID tugas diperlukan untuk melakukan patch."]);
            break;
        }
        $data = json_decode(file_get_contents("php://input"), true);
        $check = $pdo->prepare("SELECT * FROM kegiatan WHERE id = ?");
        $check->execute([$id]);
        $current = $check->fetch(PDO::FETCH_ASSOC);
        if (!$current) {
            http_response_code(404); 
            echo json_encode(["status" => "error", "message" => "Tugas tidak ditemukan untuk di-patch."]);
            break;
        }
        $title = isset($data['title']) ? trim($data['title']) : $current['title'];
        $priority = isset($data['priority']) ? $data['priority'] : $current['priority'];
        $completed = isset($data['completed']) ? $data['completed'] : $current['completed'];
        try {
            $stmt = $pdo->prepare("UPDATE kegiatan SET title = ?, priority = ?, completed = ? WHERE id = ?");
            $stmt->execute([$title, $priority, $completed, $id]);
            http_response_code(200); 
            echo json_encode(["status" => "success", "message" => "Tugas berhasil diperbarui sebagian (PATCH)."]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(["status" => "error", "message" => $e->getMessage()]);
        }
        break;
    default:
        http_response_code(405); 
        echo json_encode(["status" => "error", "message" => "Metode HTTP tidak diizinkan."]);
        break;
}
?>