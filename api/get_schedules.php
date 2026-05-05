<?php
/**
 * GET Schedules (MySQL Version)
 */

header('Content-Type: application/json');
require_once 'config.php';

$query = "
    SELECT 
        sch.schedule_id as id,
        sub.subject_name as subject,
        sub.instructor as instructor,
        sch.room as room,
        sch.day as day,
        TIME_FORMAT(sch.start_time, '%H:%i') as timeStart,
        TIME_FORMAT(sch.end_time, '%H:%i') as timeEnd
    FROM schedules sch
    JOIN subjects sub ON sch.subject_id = sub.subject_id
    ORDER BY 
        FIELD(sch.day, 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'),
        sch.start_time ASC
";

$result = mysqli_query($db, $query);

if (!$result) {
    http_response_code(500);
    echo json_encode([
        "status" => "error",
        "message" => "Failed to fetch schedules: " . mysqli_error($db)
    ]);
    exit;
}

$schedules = [];
while ($row = mysqli_fetch_assoc($result)) {
    // Get enrollments for each schedule
    $schId = $row['id'];
    $enrQuery = "SELECT student_id FROM enrollments WHERE schedule_id = $schId";
    $enrRes = mysqli_query($db, $enrQuery);
    $enrollments = [];
    while ($enrRow = mysqli_fetch_assoc($enrRes)) {
        $enrollments[] = $enrRow['student_id'];
    }
    $row['enrollments'] = $enrollments;
    $schedules[] = $row;
}

echo json_encode($schedules);
?>
