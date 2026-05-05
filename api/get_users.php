<?php
/**
 * ClassWave — Get Admins API
 */

header('Content-Type: application/json');
require_once 'config.php';

if (!$db) {
    http_response_code(500);
    echo json_encode(['message' => 'Database connection failed.']);
    exit;
}

try {
    $query = "SELECT user_id, username, password, full_name, role, created_at FROM users ORDER BY role DESC, username ASC";
    $result = mysqli_query($db, $query);
    
    if (!$result) throw new Exception("Query error: " . mysqli_error($db));
    
    $users = [];
    while ($row = mysqli_fetch_assoc($result)) {
        $users[] = $row;
    }

    echo json_encode($users);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['message' => 'System error: ' . $e->getMessage()]);
}
