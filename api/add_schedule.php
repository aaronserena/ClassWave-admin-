<?php
/**
 * ADD Schedule (MySQL Version)
 * Handles time format conversion from 12-hour (AM/PM) to 24-hour MySQL TIME format.
 */

header('Content-Type: application/json');
require_once 'config.php';

$input = json_decode(file_get_contents('php://input'), true);

if (!$input) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Invalid JSON input"]);
    exit;
}

$required = ['subject', 'instructor', 'room', 'day', 'timeStart', 'timeEnd'];
foreach ($required as $field) {
    if (empty($input[$field])) {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "Field '{$field}' is required"]);
        exit;
    }
}

// Convert 12-hour time (e.g. "07:30 AM") to 24-hour MySQL TIME format ("07:30:00")
function toMysqlTime($timeStr) {
    $t = date_create_from_format('h:i A', strtoupper(trim($timeStr)));
    if (!$t) {
        // Already in 24-hour format or HH:MM
        $t = date_create_from_format('H:i', trim($timeStr));
    }
    return $t ? date_format($t, 'H:i:s') : null;
}

$startTime = toMysqlTime($input['timeStart']);
$endTime   = toMysqlTime($input['timeEnd']);

if (!$startTime || !$endTime) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Invalid time format. Use HH:MM AM/PM or HH:MM (24h)."]);
    exit;
}

mysqli_begin_transaction($db);

try {
    // 1. Find or Create Subject
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

    // 2. Insert Schedule
    $sched_stmt = mysqli_prepare($db, "INSERT INTO schedules (subject_id, room, day, start_time, end_time) VALUES (?, ?, ?, ?, ?)");
    mysqli_stmt_bind_param($sched_stmt, "issss",
        $subject_id,
        $input['room'],
        $input['day'],
        $startTime,
        $endTime
    );

    if (!mysqli_stmt_execute($sched_stmt)) throw new Exception("Failed to create schedule: " . mysqli_error($db));
    $schedule_id = mysqli_insert_id($db);

    mysqli_commit($db);

    echo json_encode([
        "status"  => "success",
        "message" => "Schedule added successfully",
        "data"    => ["schedule_id" => $schedule_id]
    ]);

} catch (Exception $e) {
    mysqli_rollback($db);
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>
