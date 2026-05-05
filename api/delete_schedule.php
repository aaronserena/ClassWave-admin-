<?php
/**
 * DELETE Schedule
 * 
 * Receives JSON input with schedule_id and deletes the record.
 */

header('Content-Type: application/json');
require_once 'config.php';

// Get JSON input
$input = json_decode(file_get_contents('php://input'), true);

if (!$input || empty($input['id'])) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Invalid JSON input or missing schedule ID"]);
    exit;
}

$stmt = mysqli_prepare($db, "DELETE FROM schedules WHERE schedule_id = ?");
$schedule_id = $input['id'];
mysqli_stmt_bind_param($stmt, "i", $schedule_id);

if (!mysqli_stmt_execute($stmt)) {
    http_response_code(500);
    echo json_encode([
        "status" => "error", 
        "message" => "Failed to delete schedule: " . mysqli_error($db)
    ]);
    exit;
}

if (mysqli_affected_rows($db) == 0) {
    http_response_code(404);
    echo json_encode(["status" => "error", "message" => "Schedule not found"]);
    exit;
}

echo json_encode(["status" => "success", "message" => "Schedule deleted successfully"]);
?>
