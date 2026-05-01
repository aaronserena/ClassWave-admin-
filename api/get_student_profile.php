<?php
/**
 * ClassWave — Get Student Profile API
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

require_once 'config.php';

$student_id = isset($_GET['student_id']) ? $_GET['student_id'] : null;

if (!$student_id) {
    http_response_code(400);
    echo json_encode(['message' => 'Student ID is required.']);
    exit;
}

if (!$db) {
    http_response_code(500);
    echo json_encode(['message' => 'Database connection failed.']);
    exit;
}

try {
    $query = "SELECT * FROM students WHERE student_id = $1 LIMIT 1";
    $result = pg_query_params($db, $query, [$student_id]);
    
    if (!$result) throw new Exception(pg_last_error($db));
    
    $student = pg_fetch_assoc($result);

    if ($student) {
        echo json_encode([
            'success' => true,
            'student' => $student
        ]);
    } else {
        http_response_code(404);
        echo json_encode(['message' => 'Student not found.']);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['message' => 'System error: ' . $e->getMessage()]);
}
?>
