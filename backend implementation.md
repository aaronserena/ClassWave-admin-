# **🧠 CLASSWAVE ADMIN BACKEND IMPLEMENTATION PROMPT**

You are a senior full-stack developer.

## **🎯 TASK**

Build the **Admin Backend (Server Side)** for a system called **ClassWave (Class Schedule Management System)** using:

* PHP (REST-style API)  
* PostgreSQL  
* JSON-based communication  
* No framework  
* Clean, production-ready code

The frontend already exists and must NOT be modified.

---

## **🗄️ DATABASE (POSTGRESQL)**

Create and use this database:

CREATE DATABASE classwave\_db;

Connect to it and create the following tables:

CREATE TABLE subjects (  
 subject\_id SERIAL PRIMARY KEY,  
 subject\_name VARCHAR(100),  
 course\_code VARCHAR(50),  
 instructor VARCHAR(100)  
);

CREATE TABLE schedules (  
 schedule\_id SERIAL PRIMARY KEY,  
 subject\_id INT REFERENCES subjects(subject\_id) ON DELETE CASCADE,  
 room VARCHAR(50),  
 day VARCHAR(20),  
 start\_time TIME,  
 end\_time TIME  
);  
---

## **📁 BACKEND STRUCTURE**

Create this folder structure inside `admin/api/`:

api/  
├── config.php  
├── add\_schedule.php  
├── get\_schedules.php  
├── update\_schedule.php  
├── delete\_schedule.php  
---

## **🔌 REQUIREMENTS**

### **1\. Database Connection (config.php)**

* Use `pg_connect`  
* Must return JSON error if connection fails

---

### **2\. API ENDPOINTS**

#### **➕ add\_schedule.php**

* Accept JSON input  
* Insert schedule using `pg_query_params`  
* Return JSON success/error

#### **📥 get\_schedules.php**

* JOIN schedules \+ subjects  
* Return all schedules ordered by day and time  
* Output JSON array

#### **✏️ update\_schedule.php**

* Update schedule by `schedule_id`  
* Use safe parameterized queries

#### **🗑️ delete\_schedule.php**

* Delete schedule by `schedule_id`  
* Return JSON response

---

## **🔐 RULES**

* Use ONLY PostgreSQL functions (`pg_query_params`, `pg_fetch_assoc`)  
* No raw SQL injection-prone queries  
* All endpoints must return JSON only  
* No HTML output in backend  
* Keep code clean and modular  
* Do NOT modify frontend code  
* Assume frontend uses `fetch()` with JSON requests

---

## **🔗 FRONTEND COMPATIBILITY**

Ensure API works with:

* `fetch('api/get_schedules.php')`  
* `fetch('api/add_schedule.php')`  
* `fetch('api/update_schedule.php')`  
* `fetch('api/delete_schedule.php')`

---

## **🎯 OUTPUT EXPECTATION**

Generate:

* Working PHP backend files  
* PostgreSQL-compatible queries  
* Clean REST-style structure  
* Ready to plug into existing admin UI

---

## **🚀 GOAL**

A fully functional backend where the admin panel can:

* Add schedules  
* View schedules  
* Edit schedules  
* Delete schedules

All data must persist in PostgreSQL and be accessible in real-time via API.

