<?php
/**
 * ClassWave — Delete Admin API
 */

header('Content-Type: application/json');
require_once 'config.php';

if (!$db) {
    http_response_code(500);
    echo json_encode(['message' => 'Database connection failed.']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);

if (!isset($input['user_id'])) {
    http_response_code(400);
    echo json_encode(['message' => 'User ID is required.']);
    exit;
}

try {
    // 1. Check role
    $check_query = "SELECT role FROM users WHERE user_id = $1";
    $check_res = pg_query_params($db, $check_query, [$input['user_id']]);
    $user = pg_fetch_assoc($check_res);

    if ($user && $user['role'] === 'super_admin') {
        http_response_code(403);
        echo json_encode(['message' => 'Cannot delete a super admin account.']);
        exit;
    }

    // 2. Delete
    $del_query = "DELETE FROM users WHERE user_id = $1";
    $del_res = pg_query_params($db, $del_query, [$input['user_id']]);

    if (!$del_res) throw new Exception(pg_last_error($db));

    echo json_encode(['message' => 'Admin account deleted.']);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['message' => 'System error: ' . $e->getMessage()]);
}
