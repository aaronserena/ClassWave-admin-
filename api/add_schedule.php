<?php
/**
 * ADD Schedule
 * 
 * Receives JSON input and creates a new schedule.
 * Automatically handles subject creation if it doesn't exist.
 */

header('Content-Type: application/json');
require_once 'config.php';

// Get JSON input
$input = json_decode(file_get_contents('php://input'), true);

if (!$input) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Invalid JSON input"]);
    exit;
}

// Validate required fields
$required = ['subject', 'instructor', 'room', 'day', 'timeStart', 'timeEnd'];
foreach ($required as $field) {
    if (empty($input[$field])) {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "Field '{$field}' is required"]);
        exit;
    }
}

// Start transaction
pg_query($db, "BEGIN");

try {
    // 1. Find or Create Subject
    // We check by name and instructor
    $subj_query = "SELECT subject_id FROM subjects WHERE subject_name = $1 AND instructor = $2 LIMIT 1";
    $subj_res = pg_query_params($db, $subj_query, [$input['subject'], $input['instructor']]);
    
    if (!$subj_res) throw new Exception("Query error: " . pg_last_error($db));
    
    $subj_row = pg_fetch_assoc($subj_res);
    
    if ($subj_row) {
        $subject_id = $subj_row['subject_id'];
    } else {
        // Create new subject
        $ins_subj = "INSERT INTO subjects (subject_name, instructor) VALUES ($1, $2) RETURNING subject_id";
        $ins_res = pg_query_params($db, $ins_subj, [$input['subject'], $input['instructor']]);
        if (!$ins_res) throw new Exception("Failed to create subject: " . pg_last_error($db));
        $subject_id = pg_fetch_result($ins_res, 0, 0);
    }
    
    // 2. Insert Schedule
    $sched_query = "
        INSERT INTO schedules (subject_id, room, day, start_time, end_time)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING schedule_id
    ";
    $sched_res = pg_query_params($db, $sched_query, [
        $subject_id,
        $input['room'],
        $input['day'],
        $input['timeStart'],
        $input['timeEnd']
    ]);
    
    if (!$sched_res) throw new Exception("Failed to create schedule: " . pg_last_error($db));
    
    $schedule_id = pg_fetch_result($sched_res, 0, 0);
    
    // Commit transaction
    pg_query($db, "COMMIT");
    
    echo json_encode([
        "status" => "success",
        "message" => "Schedule added successfully",
        "data" => ["schedule_id" => $schedule_id]
    ]);

} catch (Exception $e) {
    pg_query($db, "ROLLBACK");
    http_response_code(500);
    echo json_encode([
        "status" => "error",
        "message" => $e->getMessage()
    ]);
}
?>
