CREATE DATABASE IF NOT EXISTS classwave_db;
USE classwave_db;

CREATE TABLE IF NOT EXISTS subjects (
  subject_id   INT AUTO_INCREMENT PRIMARY KEY,
  subject_name VARCHAR(100),
  course_code  VARCHAR(50),
  instructor   VARCHAR(100)
);

CREATE TABLE IF NOT EXISTS schedules (
  schedule_id INT AUTO_INCREMENT PRIMARY KEY,
  subject_id  INT,
  room        VARCHAR(50),
  day         VARCHAR(20),
  start_time  TIME,
  end_time    TIME,
  FOREIGN KEY (subject_id) REFERENCES subjects(subject_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS students (
  student_id VARCHAR(50)  PRIMARY KEY,
  name       VARCHAR(100),
  course     VARCHAR(100),
  year_level VARCHAR(50),
  section    VARCHAR(50),
  is_active  TINYINT(1) DEFAULT 1
);

CREATE TABLE IF NOT EXISTS enrollments (
  enrollment_id INT AUTO_INCREMENT PRIMARY KEY,
  schedule_id   INT,
  student_id    VARCHAR(50),
  UNIQUE KEY uq_enroll (schedule_id, student_id),
  FOREIGN KEY (schedule_id) REFERENCES schedules(schedule_id) ON DELETE CASCADE,
  FOREIGN KEY (student_id)  REFERENCES students(student_id)  ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS users (
  user_id    INT AUTO_INCREMENT PRIMARY KEY,
  username   VARCHAR(100) UNIQUE NOT NULL,
  password   VARCHAR(255) NOT NULL,
  full_name  VARCHAR(100),
  role       VARCHAR(20) DEFAULT 'admin',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT IGNORE INTO users (username, password, role, full_name) VALUES
('serenaaaronpoe', 'serenaaaronpoe123', 'super_admin', 'Serena Aaron Poe'),
('admin',          'password123',        'admin',       'System Administrator');
