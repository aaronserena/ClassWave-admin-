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
    $check_stmt = mysqli_prepare($db, "SELECT role FROM users WHERE user_id = ?");
    $user_id = $input['user_id'];
    mysqli_stmt_bind_param($check_stmt, "i", $user_id);
    mysqli_stmt_execute($check_stmt);
    $check_res = mysqli_stmt_get_result($check_stmt);
    $user = mysqli_fetch_assoc($check_res);

    if ($user && $user['role'] === 'super_admin') {
        http_response_code(403);
        echo json_encode(['message' => 'Cannot delete a super admin account.']);
        exit;
    }

    // 2. Delete
    $del_stmt = mysqli_prepare($db, "DELETE FROM users WHERE user_id = ?");
    mysqli_stmt_bind_param($del_stmt, "i", $user_id);
    
    if (!mysqli_stmt_execute($del_stmt)) {
        throw new Exception(mysqli_error($db));
    }

    echo json_encode(['message' => 'Admin account deleted.']);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['message' => 'System error: ' . $e->getMessage()]);
}
