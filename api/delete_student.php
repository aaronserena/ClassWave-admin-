<?php
/**
 * DELETE Student (MySQL Version)
 */

header('Content-Type: application/json');
require_once 'config.php';

$input = json_decode(file_get_contents('php://input'), true);

if (!$input || empty($input['id'])) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Missing student ID"]);
    exit;
}

$query = "DELETE FROM students WHERE student_id = ?";
$stmt = mysqli_prepare($db, $query);
$student_id = $input['id'];
mysqli_stmt_bind_param($stmt, "s", $student_id);

if (!mysqli_stmt_execute($stmt)) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Failed to delete student: " . mysqli_error($db)]);
    exit;
}

echo json_encode(["status" => "success", "message" => "Student removed from registry"]);
?>
