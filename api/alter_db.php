<?php
require_once 'config.php';

// Add password column
$query = "ALTER TABLE students ADD COLUMN IF NOT EXISTS password VARCHAR(255)";
$result = pg_query($db, $query);

if ($result) {
    echo "Added password column successfully.\n";
} else {
    echo "Error adding password column: " . pg_last_error($db) . "\n";
}
?>
