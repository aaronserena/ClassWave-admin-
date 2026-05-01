<?php
/**
 * ClassWave — Student Login API
 * Validates a student using their Student ID.
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

require_once 'config.php';

$input = json_decode(file_get_contents('php://input'), true);

if (!isset($input['student_id']) || !isset($input['password'])) {
    http_response_code(400);
    echo json_encode(['message' => 'Student ID and Password are required.']);
    exit;
}

$student_id = $input['student_id'];
$password = $input['password'];

if (!$db) {
    http_response_code(500);
    echo json_encode(['message' => 'Database connection failed.']);
    exit;
}

try {
    $query = "SELECT * FROM students WHERE student_id = $1 AND is_active = TRUE LIMIT 1";
    $result = pg_query_params($db, $query, [$student_id]);
    
    if (!$result) throw new Exception(pg_last_error($db));
    
    $student = pg_fetch_assoc($result);

    if ($student) {
        $default_password = 'student' . $student['student_id'];
        $db_password = isset($student['password']) ? $student['password'] : null;

        if ($db_password) {
            // Check stored password (either plain or hashed)
            $is_valid = password_verify($password, $db_password) || $password === $db_password;
        } else {
            // Check against default password
            $is_valid = ($password === $default_password);
        }

        if ($is_valid) {
            echo json_encode([
                'success' => true,
                'message' => 'Login successful',
                'student' => $student
            ]);
        } else {
            http_response_code(401);
            echo json_encode([
                'success' => false,
                'message' => 'Incorrect password.'
            ]);
        }
    } else {
        http_response_code(401);
        echo json_encode([
            'success' => false,
            'message' => 'Invalid Student ID or account inactive.'
        ]);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['message' => 'System error: ' . $e->getMessage()]);
}
?>
