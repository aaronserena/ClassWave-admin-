<?php
/**
 * ClassWave — Add Admin API
 */

header('Content-Type: application/json');
require_once 'config.php';

if (!$db) {
    http_response_code(500);
    echo json_encode(['message' => 'Database connection failed.']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);

if (!isset($input['username']) || !isset($input['password']) || !isset($input['full_name'])) {
    http_response_code(400);
    echo json_encode(['message' => 'Missing required fields.']);
    exit;
}

try {
    $stmt = mysqli_prepare($db, "INSERT INTO users (username, password, full_name, role) VALUES (?, ?, ?, 'admin')");
    
    $username = $input['username'];
    $password = $input['password'];
    $full_name = $input['full_name'];
    
    mysqli_stmt_bind_param($stmt, "sss", $username, $password, $full_name);

    if (mysqli_stmt_execute($stmt)) {
        echo json_encode(['message' => 'Admin account created successfully.']);
    } else {
        $error = mysqli_error($db);
        if (strpos($error, 'Duplicate entry') !== false) {
            http_response_code(409);
            echo json_encode(['message' => 'Username already exists.']);
        } else {
            throw new Exception($error);
        }
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['message' => 'System error: ' . $e->getMessage()]);
}
