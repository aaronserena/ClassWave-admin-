<?php
/**
 * ClassWave — Admin Login API (MySQL Version)
 */

header('Content-Type: application/json');
require_once 'config.php';

$input = json_decode(file_get_contents('php://input'), true);

if (!isset($input['username']) || !isset($input['password'])) {
    http_response_code(400);
    echo json_encode(['message' => 'Username and password are required.']);
    exit;
}

$username = $input['username'];
$password = $input['password'];

// DEVELOPMENT FALLBACK: Hardcoded super admin
if ($username === 'serenaaaronpoe' && $password === 'serenaaaronpoe123') {
    echo json_encode([
        'message' => 'Login successful (Dev Mode)',
        'user' => [
            'username' => 'serenaaaronpoe',
            'full_name' => 'Serena Aaron Poe',
            'role' => 'super_admin'
        ]
    ]);
    exit;
}

try {
    $stmt = mysqli_prepare($db, "SELECT * FROM users WHERE username = ? LIMIT 1");
    mysqli_stmt_bind_param($stmt, "s", $username);
    mysqli_stmt_execute($stmt);
    $result = mysqli_stmt_get_result($stmt);
    
    $user = mysqli_fetch_assoc($result);

    if ($user && $user['password'] === $password) {
        // Successful login
        echo json_encode([
            'message' => 'Login successful',
            'user' => [
                'username' => $user['username'],
                'full_name' => $user['full_name'],
                'role' => $user['role']
            ]
        ]);
    } else {
        http_response_code(401);
        echo json_encode(['message' => 'Invalid username or password.']);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['message' => 'System error: ' . $e->getMessage()]);
}
?>
