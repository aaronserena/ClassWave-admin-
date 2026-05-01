<?php
/**
 * GET Schedules
 * 
 * Fetches all schedules with their subject information.
 * Output is JSON array.
 */

header('Content-Type: application/json');
require_once 'config.php';

// SQL query to join schedules and subjects
// Alias columns to match frontend expectations
$query = "
    SELECT 
        sch.schedule_id as id,
        sub.subject_name as subject,
        sub.instructor as instructor,
        sch.room as room,
        sch.day as day,
        to_char(sch.start_time, 'HH24:MI') as \"timeStart\",
        to_char(sch.end_time, 'HH24:MI') as \"timeEnd\",
        COALESCE((SELECT json_agg(student_id) FROM enrollments WHERE schedule_id = sch.schedule_id), '[]') as enrollments
    FROM schedules sch
    JOIN subjects sub ON sch.subject_id = sub.subject_id
    ORDER BY 
        CASE 
            WHEN sch.day = 'Monday' THEN 1
            WHEN sch.day = 'Tuesday' THEN 2
            WHEN sch.day = 'Wednesday' THEN 3
            WHEN sch.day = 'Thursday' THEN 4
            WHEN sch.day = 'Friday' THEN 5
            WHEN sch.day = 'Saturday' THEN 6
            WHEN sch.day = 'Sunday' THEN 7
        END, 
        sch.start_time ASC
";

$result = pg_query($db, $query);

if (!$result) {
    http_response_code(500);
    echo json_encode([
        "status" => "error",
        "message" => "Failed to fetch schedules: " . pg_last_error($db)
    ]);
    exit;
}

$schedules = [];
while ($row = pg_fetch_assoc($result)) {
    // Decode the JSON array from Postgres
    $row['enrollments'] = json_decode($row['enrollments'], true) ?? [];
    $schedules[] = $row;
}

echo json_encode($schedules);
?>
