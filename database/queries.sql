USE school_management;
-- Students with their class and section (JOIN)
SELECT s.admission_no, CONCAT(s.first_name, ' ', s.last_name) AS student_name, c.class_name, sec.section_name
FROM students s JOIN sections sec ON s.section_id = sec.section_id JOIN classes c ON sec.class_id = c.class_id ORDER BY c.class_name, s.last_name;
-- Average marks by student (GROUP BY)
SELECT student_id, ROUND(AVG(marks_obtained), 2) AS average_marks FROM marks GROUP BY student_id ORDER BY average_marks DESC;
-- Students below 75% attendance (conditional aggregate)
SELECT s.student_id, CONCAT(s.first_name, ' ', s.last_name) AS student_name,
ROUND(100 * SUM(a.status = 'Present') / COUNT(a.attendance_id), 2) AS attendance_percentage
FROM students s JOIN attendance a ON s.student_id = a.student_id GROUP BY s.student_id HAVING attendance_percentage < 75;
-- Total fee collection and pending fees (aggregate)
SELECT SUM(total_fee) AS billed, SUM(paid_amount) AS collected, SUM(total_fee - paid_amount) AS pending FROM fees;
SELECT s.admission_no, CONCAT(s.first_name, ' ', s.last_name) AS student_name, f.total_fee - f.paid_amount AS pending
FROM fees f JOIN students s ON f.student_id = s.student_id WHERE f.total_fee > f.paid_amount ORDER BY pending DESC;
-- Highest mark (subquery)
SELECT * FROM marks WHERE marks_obtained = (SELECT MAX(marks_obtained) FROM marks);
-- Subject and teacher (JOIN)
SELECT sub.subject_name, sub.subject_code, CONCAT(t.first_name, ' ', t.last_name) AS teacher_name
FROM subjects sub LEFT JOIN teachers t ON sub.teacher_id = t.teacher_id;
