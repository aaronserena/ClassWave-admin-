<?php
/**
 * UPDATE Schedule
 * 
 * Receives JSON input including schedule_id and updates the record.
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

// Start transaction
pg_query($db, "BEGIN");

try {
    // 1. Find or Create Subject (if subject/instructor provided)
    $subject_id = null;
    if (!empty($input['subject']) && !empty($input['instructor'])) {
        $subj_query = "SELECT subject_id FROM subjects WHERE subject_name = $1 AND instructor = $2 LIMIT 1";
        $subj_res = pg_query_params($db, $subj_query, [$input['subject'], $input['instructor']]);
        
        if ($subj_row = pg_fetch_assoc($subj_res)) {
            $subject_id = $subj_row['subject_id'];
        } else {
            $ins_subj = "INSERT INTO subjects (subject_name, instructor) VALUES ($1, $2) RETURNING subject_id";
            $ins_res = pg_query_params($db, $ins_subj, [$input['subject'], $input['instructor']]);
            $subject_id = pg_fetch_result($ins_res, 0, 0);
        }
    }

    // 2. Update Schedule
    $update_query = "
        UPDATE schedules 
        SET 
            room = COALESCE($1, room),
            day = COALESCE($2, day),
            start_time = COALESCE($3, start_time),
            end_time = COALESCE($4, end_time),
            subject_id = COALESCE($5, subject_id)
        WHERE schedule_id = $6
    ";
    
    $update_res = pg_query_params($db, $update_query, [
        $input['room'] ?? null,
        $input['day'] ?? null,
        $input['timeStart'] ?? null,
        $input['timeEnd'] ?? null,
        $subject_id,
        $input['id']
    ]);
    
    if (!$update_res) throw new Exception("Failed to update schedule: " . pg_last_error($db));
    if (pg_affected_rows($update_res) == 0) throw new Exception("Schedule not found");

    pg_query($db, "COMMIT");
    echo json_encode(["status" => "success", "message" => "Schedule updated successfully"]);

} catch (Exception $e) {
    pg_query($db, "ROLLBACK");
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>
