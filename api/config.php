<?php
/**
 * Database Configuration & Connection (MySQL)
 */

// Allow CORS for Flutter Web testing
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS, DELETE, PUT");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

// Handle preflight OPTIONS requests gracefully
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

$host     = "localhost";
$user     = "root";     // Default XAMPP user
$password = "";         // Default XAMPP password
$dbname   = "classwave_db";

// Create connection
$conn = mysqli_connect($host, $user, $password, $dbname);

// Check connection
if (!$conn) {
    die("Connection failed: " . mysqli_connect_error());
}

// Global variable for other scripts to use
$db = $conn;
?>
