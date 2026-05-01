<?php
/**
 * ENROLL Student
 * 
 * Links a student to a schedule.
 */

header('Content-Type: application/json');
require_once 'config.php';

$input = json_decode(file_get_contents('php://input'), true);

if (!$input || empty($input['schedule_id']) || empty($input['student_id'])) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Missing schedule_id or student_id"]);
    exit;
}

$query = "INSERT INTO enrollments (schedule_id, student_id) VALUES ($1, $2) ON CONFLICT DO NOTHING";
$result = pg_query_params($db, $query, [$input['schedule_id'], $input['student_id']]);

if (!$result) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Enrollment failed: " . pg_last_error($db)]);
    exit;
}

echo json_encode(["status" => "success", "message" => "Student enrolled successfully"]);
?>
