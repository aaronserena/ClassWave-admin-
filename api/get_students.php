<?php
/**
 * GET Students
 * 
 * Fetches all students from the registry.
 */

header('Content-Type: application/json');
require_once 'config.php';

$query = "SELECT student_id as id, name, course, year_level as year, section, is_active as active FROM students ORDER BY name ASC";
$result = pg_query($db, $query);

if (!$result) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Failed to fetch students: " . pg_last_error($db)]);
    exit;
}

$students = [];
while ($row = pg_fetch_assoc($result)) {
    // Convert boolean string/type to actual boolean
    $row['active'] = ($row['active'] === 't' || $row['active'] === true);
    $students[] = $row;
}

echo json_encode($students);
?>
