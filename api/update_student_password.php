<?php
/**
 * ClassWave — Update Student Password API
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

require_once 'config.php';

if (!$db) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Database connection failed.']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);

if (!isset($input['student_id']) || !isset($input['new_password'])) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Student ID and new password are required.']);
    exit;
}

$student_id = $input['student_id'];
$new_password = $input['new_password'];

try {
    // Hash the password for security
    $hashed_password = password_hash($new_password, PASSWORD_DEFAULT);

    $query = "UPDATE students SET password = ? WHERE student_id = ?";
    $stmt = mysqli_prepare($db, $query);
    mysqli_stmt_bind_param($stmt, "ss", $hashed_password, $student_id);

    if (mysqli_stmt_execute($stmt)) {
        if (mysqli_stmt_affected_rows($stmt) > 0) {
            echo json_encode([
                'status' => 'success',
                'message' => 'Password updated successfully.'
            ]);
        } else {
            echo json_encode([
                'status' => 'error',
                'message' => 'Student not found or password unchanged.'
            ]);
        }
    } else {
        throw new Exception(mysqli_error($db));
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'System error: ' . $e->getMessage()]);
}
