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

$query = "DELETE FROM schedules WHERE schedule_id = $1";
$result = pg_query_params($db, $query, [$input['id']]);

if (!$result) {
    http_response_code(500);
    echo json_encode([
        "status" => "error", 
        "message" => "Failed to delete schedule: " . pg_last_error($db)
    ]);
    exit;
}

if (pg_affected_rows($result) == 0) {
    http_response_code(404);
    echo json_encode(["status" => "error", "message" => "Schedule not found"]);
    exit;
}

echo json_encode(["status" => "success", "message" => "Schedule deleted successfully"]);
?>
