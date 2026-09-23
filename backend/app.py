from flask import Flask, jsonify, request
from flask_cors import CORS
from datetime import date, datetime, time, timedelta
from decimal import Decimal
try:
    from .db import query
except ImportError:
    from db import query
import os

app = Flask(__name__)
CORS(app)

RESOURCE_CONFIG = {
    'students': {
        'select': "SELECT s.*, CONCAT(s.first_name, ' ', s.last_name) AS name, c.class_name, sec.section_name FROM students s JOIN sections sec ON s.section_id=sec.section_id JOIN classes c ON sec.class_id=c.class_id ORDER BY s.student_id DESC",
        'table': 'students', 'id': 'student_id',
        'fields': ['admission_no','first_name','last_name','gender','date_of_birth','email','phone','section_id']
    },
    'teachers': {
        'select': "SELECT t.*, CONCAT(t.first_name, ' ', t.last_name) AS name FROM teachers t ORDER BY t.teacher_id DESC",
        'table': 'teachers', 'id': 'teacher_id',
        'fields': ['first_name','last_name','gender','email','phone','hire_date']
    },
    'classes': {
        'select': "SELECT c.*, CONCAT(t.first_name, ' ', t.last_name) AS teacher_name, COUNT(s.student_id) AS student_count FROM classes c LEFT JOIN teachers t ON c.class_teacher_id=t.teacher_id LEFT JOIN sections sec ON c.class_id=sec.class_id LEFT JOIN students s ON sec.section_id=s.section_id GROUP BY c.class_id ORDER BY c.class_id",
        'table': 'classes', 'id': 'class_id', 'fields': ['class_name','class_teacher_id']
    },
    'subjects': {
        'select': "SELECT sub.*, sub.subject_name AS name, CONCAT(t.first_name, ' ', t.last_name) AS teacher_name, c.class_name FROM subjects sub LEFT JOIN teachers t ON sub.teacher_id=t.teacher_id JOIN classes c ON sub.class_id=c.class_id ORDER BY sub.subject_id DESC",
        'table': 'subjects', 'id': 'subject_id', 'fields': ['subject_name','subject_code','teacher_id','class_id']
    },
    'exams': {'select': "SELECT e.*, c.class_name FROM exams e JOIN classes c ON e.class_id=c.class_id ORDER BY e.exam_id DESC", 'table': 'exams', 'id': 'exam_id', 'fields': ['exam_name','exam_date','class_id']},
    'attendance': {'select': "SELECT a.*, CONCAT(s.first_name, ' ', s.last_name) AS student_name FROM attendance a JOIN students s ON a.student_id=s.student_id ORDER BY a.attendance_date DESC", 'table': 'attendance', 'id': 'attendance_id', 'fields': ['student_id','attendance_date','status']},
    'marks': {'select': "SELECT m.*, CONCAT(s.first_name, ' ', s.last_name) AS student_name, sub.subject_name, e.exam_name FROM marks m JOIN students s ON m.student_id=s.student_id JOIN subjects sub ON m.subject_id=sub.subject_id JOIN exams e ON m.exam_id=e.exam_id ORDER BY m.mark_id DESC", 'table': 'marks', 'id': 'mark_id', 'fields': ['exam_id','student_id','subject_id','marks_obtained']},
    'fees': {'select': "SELECT f.*, CONCAT(s.first_name, ' ', s.last_name) AS student_name, (f.total_fee-f.paid_amount) AS pending_amount, CASE WHEN f.paid_amount=0 THEN 'Pending' WHEN f.paid_amount>=f.total_fee THEN 'Paid' ELSE 'Partially Paid' END AS payment_status FROM fees f JOIN students s ON f.student_id=s.student_id ORDER BY f.fee_id DESC", 'table': 'fees', 'id': 'fee_id', 'fields': ['student_id','academic_year','total_fee','paid_amount','due_date']},
    'timetable': {'select': "SELECT tt.*, sub.subject_name, CONCAT(t.first_name, ' ', t.last_name) AS teacher_name FROM timetable tt JOIN subjects sub ON tt.subject_id=sub.subject_id LEFT JOIN teachers t ON tt.teacher_id=t.teacher_id ORDER BY FIELD(tt.day_of_week,'Monday','Tuesday','Wednesday','Thursday','Friday'), tt.start_time", 'table': 'timetable', 'id': 'timetable_id', 'fields': ['section_id','subject_id','teacher_id','day_of_week','start_time','end_time','room_number']},
}

def error_response(message, status=400):
    return jsonify({'error': message}), status

def json_safe(records):
    def convert(value):
        if isinstance(value, timedelta):
            return str(value)
        if isinstance(value, (date, datetime, time)):
            return value.isoformat()
        if isinstance(value, Decimal):
            return float(value)
        return value
    return [{key: convert(value) for key, value in record.items()} for record in records]

def list_resource(resource):
    try:
        return jsonify(json_safe(query(RESOURCE_CONFIG[resource]['select'])))
    except RuntimeError as error:
        return error_response(f'Database unavailable: {error}', 503)

def create_resource(resource):
    config = RESOURCE_CONFIG[resource]
    payload = request.get_json(silent=True) or {}
    fields = [field for field in config['fields'] if field in payload]
    if not fields:
        return error_response('No valid fields supplied')
    placeholders = ','.join(['%s'] * len(fields))
    try:
        record_id = query(f"INSERT INTO {config['table']} ({','.join(fields)}) VALUES ({placeholders})", [payload[field] for field in fields], fetch=False)
        return jsonify({'id': record_id, 'message': 'Created successfully'}), 201
    except RuntimeError as error:
        return error_response(str(error), 409)

def update_resource(resource, record_id):
    config = RESOURCE_CONFIG[resource]
    payload = request.get_json(silent=True) or {}
    fields = [field for field in config['fields'] if field in payload]
    if not fields:
        return error_response('No valid fields supplied')
    assignments = ','.join(f'{field}=%s' for field in fields)
    try:
        query(f"UPDATE {config['table']} SET {assignments} WHERE {config['id']}=%s", [payload[field] for field in fields] + [record_id], fetch=False)
        return jsonify({'message': 'Updated successfully'})
    except RuntimeError as error:
        return error_response(str(error), 409)

@app.get('/api/health')
def health():
    return jsonify({'status': 'ok', 'service': 'school-management-api'})

@app.post('/api/login')
def login():
    payload = request.get_json(silent=True) or {}
    if payload.get('username') == 'admin' and payload.get('password') == 'admin123':
        return jsonify({'authenticated': True, 'user': {'username': 'admin', 'role': 'admin'}})
    return error_response('Invalid username or password', 401)

@app.get('/api/<resource>')
def get_resource(resource):
    if resource not in RESOURCE_CONFIG:
        return error_response('Resource not found', 404)
    return list_resource(resource)

@app.get('/api/<resource>/<int:record_id>')
def get_one_resource(resource, record_id):
    if resource not in RESOURCE_CONFIG:
        return error_response('Resource not found', 404)
    config = RESOURCE_CONFIG[resource]
    try:
        records = query(f"SELECT * FROM ({config['select']}) AS resource_row WHERE {config['id']}=%s", [record_id])
        if not records:
            return error_response('Record not found', 404)
        return jsonify(json_safe(records)[0])
    except RuntimeError as error:
        return error_response(f'Database unavailable: {error}', 503)

@app.post('/api/<resource>')
def post_resource(resource):
    if resource not in RESOURCE_CONFIG:
        return error_response('Resource not found', 404)
    return create_resource(resource)

@app.put('/api/<resource>/<int:record_id>')
def put_resource(resource, record_id):
    if resource not in RESOURCE_CONFIG:
        return error_response('Resource not found', 404)
    return update_resource(resource, record_id)

@app.delete('/api/<resource>/<int:record_id>')
def delete_resource(resource, record_id):
    if resource not in RESOURCE_CONFIG:
        return error_response('Resource not found', 404)
    config = RESOURCE_CONFIG[resource]
    try:
        query(f"DELETE FROM {config['table']} WHERE {config['id']}=%s", [record_id], fetch=False)
        return jsonify({'message': 'Deleted successfully'})
    except RuntimeError as error:
        return error_response(str(error), 409)

@app.get('/api/dashboard')
def dashboard():
    try:
        counts = query("SELECT (SELECT COUNT(*) FROM students) AS students, (SELECT COUNT(*) FROM teachers) AS teachers, (SELECT COUNT(*) FROM classes) AS classes, (SELECT COUNT(*) FROM subjects) AS subjects, (SELECT COALESCE(ROUND(AVG(status='Present')*100,1),0) FROM attendance) AS attendance, (SELECT COALESCE(SUM(total_fee-paid_amount),0) FROM fees) AS pending_fees")[0]
        return jsonify({**counts, 'recent_activities': [{'label':'Attendance register updated','time':'Today, 09:42'}, {'label':'New student profile added','time':'Yesterday, 16:10'}, {'label':'Fee payment recorded','time':'Yesterday, 11:35'}]})
    except RuntimeError as error:
        return error_response(f'Database unavailable: {error}', 503)

if __name__ == '__main__':
    app.run(debug=True, port=int(os.getenv('FLASK_PORT', '5000')))
