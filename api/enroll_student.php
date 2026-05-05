<?php
/**
 * ENROLL Student (MySQL Version)
 */

header('Content-Type: application/json');
require_once 'config.php';

$input = json_decode(file_get_contents('php://input'), true);

if (!$input || empty($input['schedule_id']) || empty($input['student_id'])) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Missing schedule_id or student_id"]);
    exit;
}

$query = "INSERT IGNORE INTO enrollments (schedule_id, student_id) VALUES (?, ?)";
$stmt = mysqli_prepare($db, $query);
$schedule_id = $input['schedule_id'];
$student_id = $input['student_id'];
mysqli_stmt_bind_param($stmt, "is", $schedule_id, $student_id);

if (!mysqli_stmt_execute($stmt)) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Enrollment failed: " . mysqli_error($db)]);
    exit;
}

echo json_encode(["status" => "success", "message" => "Student enrolled successfully"]);
?>
