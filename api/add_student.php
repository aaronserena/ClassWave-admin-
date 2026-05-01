<?php
/**
 * ADD Student
 * 
 * Registers a new student in the system.
 */

header('Content-Type: application/json');
require_once 'config.php';

$input = json_decode(file_get_contents('php://input'), true);

if (!$input) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Invalid JSON input"]);
    exit;
}

$required = ['id', 'name', 'course', 'year', 'section'];
foreach ($required as $field) {
    if (empty($input[$field])) {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "Field '{$field}' is required"]);
        exit;
    }
}

$query = "
    INSERT INTO students (student_id, name, course, year_level, section, is_active)
    VALUES ($1, $2, $3, $4, $5, $6)
    ON CONFLICT (student_id) DO UPDATE 
    SET name = EXCLUDED.name, course = EXCLUDED.course, year_level = EXCLUDED.year_level, section = EXCLUDED.section, is_active = EXCLUDED.is_active
";

$active = isset($input['active']) ? ($input['active'] ? 'true' : 'false') : 'true';

$result = pg_query_params($db, $query, [
    $input['id'],
    $input['name'],
    $input['course'],
    $input['year'],
    $input['section'],
    $active
]);

if (!$result) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Failed to add student: " . pg_last_error($db)]);
    exit;
}

echo json_encode(["status" => "success", "message" => "Student registered successfully"]);
?>
