<?php
/**
 * Database Configuration & Connection
 * 
 * Provides a shared PostgreSQL connection for all API endpoints.
 */

// Database credentials - Update these to match your local setup
// Database credentials - Updated for Supabase
$host     = "db.oxrypntbjpjlanbdvbpm.supabase.co";
$port     = "5432";
$dbname   = "postgres";
$user     = "postgres";
$password = "VOgnXcmMFdVyj2pp";

// Set up connection string
$connection_string = "host={$host} port={$port} dbname={$dbname} user={$user} password={$password} sslmode=require";

// Attempt connection
$db = @pg_connect($connection_string);

// If connection fails, individual scripts will handle it (e.g. for fallbacks)
if (!$db) {
    // We don't exit here to allow login fallback
}
?>
