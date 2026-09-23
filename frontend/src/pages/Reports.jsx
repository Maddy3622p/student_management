import { useEffect, useState } from 'react';
import { BarChart3, CheckCircle2, CreditCard, Printer, Users } from 'lucide-react';
import { fetchResource } from '../services/api';

export default function Reports() {
  const [data, setData] = useState({ students: [], attendance: [], marks: [], fees: [] });
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    Promise.all(['students', 'attendance', 'marks', 'fees'].map(resource => fetchResource(resource)))
      .then(([students, attendance, marks, fees]) => setData({ students, attendance, marks, fees }))
      .finally(() => setLoading(false));
  }, []);
  const present = data.attendance.filter(row => row.status === 'Present').length;
  const attendanceRate = data.attendance.length ? Math.round((present / data.attendance.length) * 100) : 0;
  const collected = data.fees.reduce((sum, row) => sum + Number(row.paid_amount || 0), 0);
  const pending = data.fees.reduce((sum, row) => sum + Number(row.pending_amount || 0), 0);
  return <><div className="page-intro"><div><span className="eyebrow">REPORTING / SCHOOL PERFORMANCE</span><h2>Reports</h2><p className="muted">A live summary of the records currently stored in MySQL.</p></div><button className="secondary-button" onClick={() => window.print()}><Printer size={16} /> Print report</button></div>{loading ? <div className="panel empty-state">Loading reports...</div> : <><div className="report-grid"><div className="report-card"><Users size={20} /><span>Student report</span><strong>{data.students.length}</strong><small>active student records</small></div><div className="report-card"><CheckCircle2 size={20} /><span>Attendance report</span><strong>{attendanceRate}%</strong><small>present in recorded sessions</small></div><div className="report-card"><BarChart3 size={20} /><span>Marks report</span><strong>{data.marks.length}</strong><small>assessment entries</small></div><div className="report-card"><CreditCard size={20} /><span>Fee report</span><strong>₹{pending.toLocaleString('en-IN')}</strong><small>pending balance, ₹{collected.toLocaleString('en-IN')} collected</small></div></div><section className="panel report-table"><div className="panel-header"><div><span className="eyebrow">STUDENT REPORT</span><h3>Recent learners</h3></div></div><div className="table-wrap"><table><thead><tr><th>Admission No.</th><th>Name</th><th>Class</th><th>Email</th></tr></thead><tbody>{data.students.slice(0, 10).map(student => <tr key={student.student_id}><td>{student.admission_no}</td><td>{student.name}</td><td>{student.class_name} / {student.section_name}</td><td>{student.email}</td></tr>)}</tbody></table></div></section></>}</>;
}
