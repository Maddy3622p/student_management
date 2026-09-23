# School Management System

A college mini project for Database Design and Management: a responsive React/Vite administration portal backed by a Flask REST API and a normalized MySQL database.

## Features

- Admin login with demo credentials
- Dashboard metrics for students, staff, classes, subjects, attendance, and fees
- Searchable management tables for students, teachers, classes, subjects, attendance, marks, fees, and timetable
- CRUD API endpoints with parameterized MySQL queries
- Attendance and marks datasets with grade calculation in the UI
- Fee balance and payment-status calculations
- SQL JOIN, aggregate, GROUP BY, ORDER BY, WHERE, and subquery examples
- Responsive sidebar navigation and mobile layout
- Graceful API/database error states with demo fallback data

## Technology Stack

- Frontend: React, Vite, React Router, Axios, Lucide React, CSS3
- Backend: Python, Flask, Flask-CORS, python-dotenv
- Database: MySQL

## Architecture

`frontend/src/services/api.js` contains the Axios client. `backend/app.py` contains the REST routes and a small resource configuration for consistent CRUD operations. `backend/db.py` owns parameterized database access. SQL is kept in `database/` so the schema and viva queries are easy to inspect.

The database is normalized around students, classes, sections, subjects, teachers, and transaction tables. `student_subjects` demonstrates a many-to-many relationship. Attendance, marks, fees, and timetable rows reference their parent entities through foreign keys.

## MySQL Setup

1. Install and start MySQL locally.
2. From the repository root, create the schema and sample records:

```powershell
Get-Content -Raw database\schema.sql | & 'C:\Program Files\MySQL\MySQL Server 8.4\bin\mysql.exe' -u root -p
Get-Content -Raw database\sample_data.sql | & 'C:\Program Files\MySQL\MySQL Server 8.4\bin\mysql.exe' -u root -p school_management
```

3. Copy `.env.example` to `.env` and set the local MySQL password:

```powershell
Copy-Item .env.example .env
```

## Backend Setup

```powershell
python -m venv venv
venv\Scripts\activate
python -m pip install -r backend\requirements.txt
python backend\app.py
```

If Windows Application Control blocks `pip.exe`, keep the environment activated and use `venv\Scripts\python.exe -m pip install -r backend\requirements.txt` instead.

The API runs at `http://localhost:5000`.

For this Windows development setup, MySQL Server 8.4 is initialized in the local `mysql-data` folder and started with:

```powershell
& 'C:\Program Files\MySQL\MySQL Server 8.4\bin\mysqld.exe' --basedir='C:\Program Files\MySQL\MySQL Server 8.4' --datadir="$PWD\mysql-data" --port=3306 --console
```

## Frontend Setup

```powershell
cd frontend
npm install
npm run dev
```

Open the Vite URL shown in the terminal, normally `http://localhost:5173`.

## Demo Login

- Username: `admin`
- Password: `admin123`

This is intentionally simple for a local college demonstration. The API also exposes `POST /api/login`; production authentication should use hashed passwords and session/token management.

## API Documentation

- `GET /api/dashboard`
- `GET|POST /api/students`, `PUT|DELETE /api/students/<id>`
- `GET|POST /api/teachers`, `PUT|DELETE /api/teachers/<id>`
- `GET|POST /api/classes`
- `GET|POST /api/subjects`
- `GET|POST /api/attendance`, `PUT /api/attendance/<id>`
- `GET|POST /api/marks`, `PUT /api/marks/<id>`
- `GET|POST /api/fees`, `PUT /api/fees/<id>`
- `GET|POST /api/timetable`
- `POST /api/login`

POST and PUT bodies are JSON objects. Invalid or duplicate database values return a friendly error response with an appropriate HTTP status code.

## Database Demonstration

Use `database/queries.sql` during the viva to show:

- Student to class and section joins
- Subject to teacher joins
- Average marks with `AVG` and `GROUP BY`
- Attendance below 75% with conditional aggregation and `HAVING`
- Total collection and pending fee aggregates
- Highest marks using a subquery

## Screenshots

Run the frontend locally and capture the login, dashboard, and one management table view here for the final submission.

## Future Enhancements

- Password hashing and JWT/session authentication
- Full modal forms with field-level validation for every resource
- Pagination and exportable reports
- MySQL migrations and automated API tests
- Role-specific teacher and administrator permissions
