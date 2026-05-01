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
    $query = "INSERT INTO users (username, password, full_name, role) VALUES ($1, $2, $3, 'admin')";
    $result = pg_query_params($db, $query, [
        $input['username'],
        $input['password'],
        $input['full_name']
    ]);

    if (!$result) {
        $error = pg_last_error($db);
        if (strpos($error, 'duplicate key') !== false) {
            http_response_code(409);
            echo json_encode(['message' => 'Username already exists.']);
        } else {
            throw new Exception($error);
        }
    } else {
        echo json_encode(['message' => 'Admin account created successfully.']);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['message' => 'System error: ' . $e->getMessage()]);
}
