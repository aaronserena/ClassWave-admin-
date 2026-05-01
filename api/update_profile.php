<?php
/**
 * ClassWave — Update Profile API
 */

header('Content-Type: application/json');
require_once 'config.php';

if (!$db) {
    http_response_code(500);
    echo json_encode(['message' => 'Database connection failed.']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);

if (!isset($input['current_username'])) {
    http_response_code(400);
    echo json_encode(['message' => 'Current username is required for identification.']);
    exit;
}

$current_username = $input['current_username'];
$new_fullname = isset($input['full_name']) ? $input['full_name'] : null;
$new_username = isset($input['username']) ? $input['username'] : null;
$new_password = isset($input['password']) ? $input['password'] : null;

try {
    // 1. Build the update query dynamically
    $fields = [];
    $params = [];
    $i = 1;

    if ($new_fullname) {
        $fields[] = "full_name = $" . $i++;
        $params[] = $new_fullname;
    }
    if ($new_username) {
        $fields[] = "username = $" . $i++;
        $params[] = $new_username;
    }
    if ($new_password) {
        $fields[] = "password = $" . $i++;
        $params[] = $new_password;
    }

    if (empty($fields)) {
        http_response_code(400);
        echo json_encode(['message' => 'No fields to update.']);
        exit;
    }

    $params[] = $current_username;
    $query = "UPDATE users SET " . implode(', ', $fields) . " WHERE username = $" . $i;
    
    $result = pg_query_params($db, $query, $params);

    if (!$result) {
        $error = pg_last_error($db);
        if (strpos($error, 'duplicate key') !== false) {
            http_response_code(409);
            echo json_encode(['message' => 'New username already exists.']);
        } else {
            throw new Exception($error);
        }
    } else {
        echo json_encode([
            'message' => 'Profile updated successfully.',
            'new_username' => $new_username ? $new_username : $current_username
        ]);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['message' => 'System error: ' . $e->getMessage()]);
}
