<?php
/**
 * ADD Student (MySQL Version)
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

$active = isset($input['active']) ? ($input['active'] ? 1 : 0) : 1;

$query = "
    INSERT INTO students (student_id, name, course, year_level, section, is_active)
    VALUES (?, ?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE 
    name = VALUES(name), 
    course = VALUES(course), 
    year_level = VALUES(year_level), 
    section = VALUES(section), 
    is_active = VALUES(is_active)
";

$stmt = mysqli_prepare($db, $query);
mysqli_stmt_bind_param($stmt, "sssssi", 
    $input['id'],
    $input['name'],
    $input['course'],
    $input['year'],
    $input['section'],
    $active
);

if (!mysqli_stmt_execute($stmt)) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Failed to add student: " . mysqli_error($db)]);
    exit;
}

echo json_encode(["status" => "success", "message" => "Student registered successfully"]);
?>
