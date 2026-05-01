<?php
/**
 * UNENROLL Student
 * 
 * Removes a student from a schedule.
 */

header('Content-Type: application/json');
require_once 'config.php';

$input = json_decode(file_get_contents('php://input'), true);

if (!$input || empty($input['schedule_id']) || empty($input['student_id'])) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Missing schedule_id or student_id"]);
    exit;
}

$query = "DELETE FROM enrollments WHERE schedule_id = $1 AND student_id = $2";
$result = pg_query_params($db, $query, [$input['schedule_id'], $input['student_id']]);

if (!$result) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Unenrollment failed: " . pg_last_error($db)]);
    exit;
}

echo json_encode(["status" => "success", "message" => "Student unenrolled successfully"]);
?>
