<?php
/**
 * UPDATE Schedule (MySQL Version)
 * Handles time format conversion from 12-hour (AM/PM) to 24-hour MySQL TIME format.
 */

header('Content-Type: application/json');
require_once 'config.php';

$input = json_decode(file_get_contents('php://input'), true);

if (!$input || empty($input['id'])) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Invalid JSON input or missing schedule ID"]);
    exit;
}

// Convert 12-hour time (e.g. "07:30 AM") to 24-hour MySQL TIME format ("07:30:00")
function toMysqlTime($timeStr) {
    $t = date_create_from_format('h:i A', strtoupper(trim($timeStr)));
    if (!$t) {
        $t = date_create_from_format('H:i', trim($timeStr));
    }
    return $t ? date_format($t, 'H:i:s') : null;
}

mysqli_begin_transaction($db);

try {
    // 1. Find or Create Subject
    $subject_id = null;
    if (!empty($input['subject']) && !empty($input['instructor'])) {
        $stmt = mysqli_prepare($db, "SELECT subject_id FROM subjects WHERE subject_name = ? AND instructor = ? LIMIT 1");
        mysqli_stmt_bind_param($stmt, "ss", $input['subject'], $input['instructor']);
        mysqli_stmt_execute($stmt);
        $res = mysqli_stmt_get_result($stmt);
        $subj_row = mysqli_fetch_assoc($res);

        if ($subj_row) {
            $subject_id = $subj_row['subject_id'];
        } else {
            $ins_stmt = mysqli_prepare($db, "INSERT INTO subjects (subject_name, instructor) VALUES (?, ?)");
            mysqli_stmt_bind_param($ins_stmt, "ss", $input['subject'], $input['instructor']);
            if (!mysqli_stmt_execute($ins_stmt)) throw new Exception("Failed to create subject: " . mysqli_error($db));
            $subject_id = mysqli_insert_id($db);
        }
    }

    // 2. Convert times
    $startTime = !empty($input['timeStart']) ? toMysqlTime($input['timeStart']) : null;
    $endTime   = !empty($input['timeEnd'])   ? toMysqlTime($input['timeEnd'])   : null;

    // 3. Update Schedule
    $room = $input['room'] ?? null;
    $day = $input['day'] ?? null;
    $schedule_id = $input['id'];

    $update_stmt = mysqli_prepare($db, "
        UPDATE schedules SET
            room       = COALESCE(?, room),
            day        = COALESCE(?, day),
            start_time = COALESCE(?, start_time),
            end_time   = COALESCE(?, end_time),
            subject_id = COALESCE(?, subject_id)
        WHERE schedule_id = ?
    ");
    mysqli_stmt_bind_param($update_stmt, "ssssii",
        $room,
        $day,
        $startTime,
        $endTime,
        $subject_id,
        $schedule_id
    );

    if (!mysqli_stmt_execute($update_stmt)) throw new Exception("Failed to update schedule: " . mysqli_error($db));
    if (mysqli_affected_rows($db) == 0) throw new Exception("Schedule not found");

    mysqli_commit($db);
    echo json_encode(["status" => "success", "message" => "Schedule updated successfully"]);

} catch (Exception $e) {
    mysqli_rollback($db);
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>
