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
    $types = "";

    if ($new_fullname) {
        $fields[] = "full_name = ?";
        $params[] = $new_fullname;
        $types .= "s";
    }
    if ($new_username) {
        $fields[] = "username = ?";
        $params[] = $new_username;
        $types .= "s";
    }
    if ($new_password) {
        $fields[] = "password = ?";
        $params[] = $new_password;
        $types .= "s";
    }

    if (empty($fields)) {
        http_response_code(400);
        echo json_encode(['message' => 'No changes provided.']);
        exit;
    }

    $query = "UPDATE users SET " . implode(', ', $fields) . " WHERE username = ?";
    $params[] = $current_username;
    $types .= "s";

    $stmt = mysqli_prepare($db, $query);
    mysqli_stmt_bind_param($stmt, $types, ...$params);

    if (!mysqli_stmt_execute($stmt)) {
        $error = mysqli_error($db);
        if (strpos($error, 'Duplicate entry') !== false) {
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
