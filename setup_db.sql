-- ClassWave Database Setup Script
-- Run this in your PostgreSQL environment

-- 1. Create the Database (Optional if already created)
-- CREATE DATABASE classwave_db;

-- 2. Create subjects table
CREATE TABLE subjects (
  subject_id SERIAL PRIMARY KEY,
  subject_name VARCHAR(100),
  course_code VARCHAR(50),
  instructor VARCHAR(100)
);

-- 3. Create schedules table
CREATE TABLE schedules (
  schedule_id SERIAL PRIMARY KEY,
  subject_id INT REFERENCES subjects(subject_id) ON DELETE CASCADE,
  room VARCHAR(50),
  day VARCHAR(20),
  start_time TIME,
  end_time TIME
);

-- 4. Create students table (School-Wide Registry)
CREATE TABLE students (
  student_id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100),
  course VARCHAR(100),
  year_level VARCHAR(50),
  section VARCHAR(50),
  is_active BOOLEAN DEFAULT TRUE
);

-- 5. Create enrollments table
CREATE TABLE enrollments (
  enrollment_id SERIAL PRIMARY KEY,
  schedule_id INT REFERENCES schedules(schedule_id) ON DELETE CASCADE,
  student_id VARCHAR(50) REFERENCES students(student_id) ON DELETE CASCADE,
  UNIQUE(schedule_id, student_id)
);

-- 6. Create users table for Admin Management
CREATE TABLE users (
  user_id SERIAL PRIMARY KEY,
  username VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL, -- Stored as plain text for now as per project style, though hashing is recommended
  role VARCHAR(20) NOT NULL DEFAULT 'admin', -- 'super_admin' or 'admin'
  full_name VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seed initial users
INSERT INTO users (username, password, role, full_name) VALUES 
('serenaaaronpoe', 'serenaaaronpoe123', 'super_admin', 'Serena Aaron Poe'),
('admin', 'password123', 'admin', 'System Administrator');



