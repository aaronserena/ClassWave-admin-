<?php
/**
 * GET Students (MySQL Version)
 */

header('Content-Type: application/json');
require_once 'config.php';

$query = "SELECT student_id as id, name, course, year_level as year, section, is_active as active FROM students ORDER BY name ASC";
$result = mysqli_query($db, $query);

if (!$result) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Failed to fetch students: " . mysqli_error($db)]);
    exit;
}

$students = [];
while ($row = mysqli_fetch_assoc($result)) {
    // MySQL handles booleans as 1/0
    $row['active'] = ($row['active'] == 1);
    $students[] = $row;
}

echo json_encode($students);
?>
