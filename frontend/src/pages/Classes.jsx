import { useEffect, useState } from 'react';
import { BookOpen, ChevronDown, DoorOpen, GraduationCap, Users } from 'lucide-react';
import { fetchResource } from '../services/api';
import './classes.css';

export default function Classes() {
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [expanded, setExpanded] = useState(null);
  const [message, setMessage] = useState('');
  useEffect(() => {
    Promise.all([fetchResource('classes'), fetchResource('students')]).then(([classRows, studentRows]) => {
      setClasses(classRows.map(classRow => ({ ...classRow, learners: studentRows.filter(student => student.class_name === classRow.class_name) })));
    }).catch(() => setMessage('Could not load class categories from the database.'));
  }, []);
  const toggle = classId => setExpanded(current => current === classId ? null : classId);
  return <><div className="page-intro"><div><span className="eyebrow">ACADEMIC STRUCTURE / CLASS CATEGORIES</span><h2>Classes</h2><p className="muted">Choose a grade to see its teacher, sections, rooms, and learners.</p></div><div className="class-summary"><BookOpen size={16} /> {classes.length} grade categories</div></div>{message && <div className="notice">{message}</div>}<div className="class-category-grid">{classes.map(classRow => { const isOpen = expanded === classRow.class_id; return <section className={isOpen ? 'class-category open' : 'class-category'} key={classRow.class_id}><button className="class-category-header" onClick={() => toggle(classRow.class_id)}><span className="class-number">{String(classRow.class_name).replace('Grade ', '')}</span><span className="class-category-title"><b>{classRow.class_name}</b><small>{classRow.student_count || classRow.learners.length} learners enrolled</small></span><ChevronDown size={19} /></button>{isOpen && <div className="class-details"><div className="class-detail-row"><span><GraduationCap size={15} /> Class teacher</span><b>{classRow.teacher_name || 'Not assigned'}</b></div><div className="class-detail-row"><span><Users size={15} /> Learners</span><b>{classRow.student_count || classRow.learners.length}</b></div><div className="class-detail-row"><span><DoorOpen size={15} /> Sections and rooms</span><b>Section details available in database</b></div>{classRow.learners.length > 0 && <div className="class-learners"><span className="eyebrow">LEARNERS IN THIS GRADE</span>{classRow.learners.slice(0, 5).map(student => <div key={student.student_id}><span>{student.name}</span><small>{student.section_name} · {student.admission_no}</small></div>)}</div>}</div>}</section>; })}</div></>;
}
