# ClassWave — Admin Dashboard

A premium, glassmorphic management dashboard for the ClassWave ecosystem.

## 🚀 Features
- **Dashboard Stats**: Real-time overview of students, subjects, and schedules.
- **Schedule Management**: Full CRUD for class schedules.
- **Student Registry**: School-wide registry for student management.
- **Enrollment System**: Easy student-to-class assignment.
- **Admin Management**: Role-based access control for administrators.

## 🛠 Tech Stack
- **Frontend**: HTML5, Vanilla CSS, JavaScript (ES6+).
- **Backend**: PHP 8.x.
- **Database**: PostgreSQL (Supabase).

## 📦 Setup & Deployment
1. **Database**: 
   - Execute the SQL script in `setup_db.sql` on your PostgreSQL database.
2. **Configuration**:
   - Update `api/config.php` with your database host, user, and password.
3. **Web Server**:
   - Host the files on a PHP-compatible server (Apache/Nginx).
   - Ensure the server has the `php-pgsql` extension enabled.

## 🎨 Design
The UI utilizes a **Glassmorphic** design language with:
- **Font**: Inter (Variable Weights).
- **Primary Color**: #7c4dff (Premium Purple).
- **Background**: Textured with subtle school doodles (4% opacity).
