<?php
/**
 * ClassWave — Get Student Schedule API
 * Fetches the specific schedule for a logged-in student.
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

require_once 'config.php';

$student_id = isset($_GET['student_id']) ? $_GET['student_id'] : null;

if (!$student_id) {
    http_response_code(400);
    echo json_encode(['message' => 'Student ID is required.']);
    exit;
}

if (!$db) {
    http_response_code(500);
    echo json_encode(['message' => 'Database connection failed.']);
    exit;
}

try {
    $query = "
        SELECT 
            s.schedule_id,
            sub.subject_name as subject,
            sub.course_code,
            sub.instructor,
            sub.units,
            s.room,
            s.day,
            s.start_time,
            s.end_time
        FROM enrollments e
        JOIN schedules s ON e.schedule_id = s.schedule_id
        JOIN subjects sub ON s.subject_id = sub.subject_id
        WHERE e.student_id = ?
        ORDER BY 
            CASE 
                WHEN s.day = 'Monday' THEN 1
                WHEN s.day = 'Tuesday' THEN 2
                WHEN s.day = 'Wednesday' THEN 3
                WHEN s.day = 'Thursday' THEN 4
                WHEN s.day = 'Friday' THEN 5
                WHEN s.day = 'Saturday' THEN 6
                WHEN s.day = 'Sunday' THEN 7
            END,
            s.start_time
    ";
    
    $stmt = mysqli_prepare($db, $query);
    mysqli_stmt_bind_param($stmt, "s", $student_id);
    mysqli_stmt_execute($stmt);
    $result = mysqli_stmt_get_result($stmt);
    
    if (!$result) throw new Exception(mysqli_error($db));
    
    $schedules = [];
    while ($row = mysqli_fetch_assoc($result)) {
        $schedules[] = $row;
    }

    echo json_encode($schedules);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['message' => 'System error: ' . $e->getMessage()]);
}
?>
