import { useEffect, useMemo, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { ChevronDown, Mail, Phone, UserRound, Users } from 'lucide-react';
import { fetchResource } from '../services/api';
import './students.css';

export default function Students() {
  const [students, setStudents] = useState([]);
  const [expanded, setExpanded] = useState(null);
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState('');
  const [message, setMessage] = useState('');
  useEffect(() => { fetchResource('students').then(setStudents).catch(() => setMessage('Could not load students from the database.')); }, []);
  const groups = useMemo(() => Object.entries(students.filter(student => Object.values(student).some(value => String(value ?? '').toLowerCase().includes(search.toLowerCase()))).reduce((result, student) => { const key = student.class_name || 'Unassigned grade'; (result[key] ||= []).push(student); return result; }, {})), [students, search]);
  return <><div className="page-intro"><div><span className="eyebrow">STUDENT DIRECTORY / GRADE CATEGORIES</span><h2>Students</h2><p className="muted">Choose a grade to view the learners and their complete details.</p></div><div className="student-tools"><div className="search-box"><UserRound size={16} /><input placeholder="Search students" value={search} onChange={event => setSearch(event.target.value)} /></div><span className="student-count"><Users size={15} /> {students.length} students</span><NavLink className="primary-button" to="/student-records">Manage records</NavLink></div></div>{message && <div className="notice">{message}</div>}<div className="student-category-grid">{groups.map(([grade, learners]) => { const isOpen = expanded === grade; return <section className={isOpen ? 'student-category open' : 'student-category'} key={grade}><button className="student-category-header" onClick={() => setExpanded(isOpen ? null : grade)}><span className="student-grade-badge">{grade.replace('Grade ', '')}</span><span><b>{grade}</b><small>{learners.length} learners</small></span><ChevronDown size={18} /></button>{isOpen && <div className="student-list">{learners.map(student => <button className={selected?.student_id === student.student_id ? 'student-row selected' : 'student-row'} key={student.student_id} onClick={() => setSelected(selected?.student_id === student.student_id ? null : student)}><span className="student-avatar">{student.name?.split(' ').map(part => part[0]).join('').slice(0, 2)}</span><span className="student-main"><b>{student.name}</b><small>{student.admission_no} · Section {student.section_name || '—'}</small></span><ChevronDown size={15} />{selected?.student_id === student.student_id && <span className="student-detail"><span><Mail size={14} /> {student.email || 'No email'}</span><span><Phone size={14} /> {student.phone || 'No phone'}</span><span><UserRound size={14} /> {student.gender} · Born {student.date_of_birth}</span></span>}</button>)}</div>}</section>; })}</div></>;
}
