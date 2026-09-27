import { useEffect, useState } from 'react';
import { Activity, CheckCircle2, XCircle } from 'lucide-react';
import { fetchResource, updateResource } from '../services/api';
import './attendance.css';

export default function Attendance() {
  const [rows, setRows] = useState([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const load = () => fetchResource('attendance').then(setRows).catch(() => setMessage('Could not load attendance from the database.')).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);
  const toggle = async row => {
    try {
      await updateResource('attendance', row.attendance_id, { status: row.status === 'Present' ? 'Absent' : 'Present' });
      setMessage(`${row.student_name} marked ${row.status === 'Present' ? 'Absent' : 'Present'}.`);
      load();
    } catch (error) { setMessage(error.response?.data?.error || 'Could not update attendance.'); }
  };
  return <><div className="page-intro"><div><span className="eyebrow">DAILY REGISTER / QUICK UPDATE</span><h2>Attendance</h2><p className="muted">Click a status to mark a student present or absent instantly.</p></div><button className="secondary-button" onClick={load}><Activity size={16} /> Refresh</button></div>{message && <div className="notice"><Activity size={16} />{message}</div>}<section className="panel table-panel">{loading ? <div className="empty-state">Loading attendance...</div> : <div className="table-wrap"><table><thead><tr><th>Student</th><th>Date</th><th>Status</th><th>Quick action</th></tr></thead><tbody>{rows.map(row => <tr key={row.attendance_id}><td>{row.student_name}</td><td>{row.attendance_date}</td><td><span className={`status ${row.status.toLowerCase()}`}>{row.status}</span></td><td><button className={`attendance-toggle ${row.status === 'Present' ? 'make-absent' : 'make-present'}`} onClick={() => toggle(row)}>{row.status === 'Present' ? <><XCircle size={15} /> Mark absent</> : <><CheckCircle2 size={15} /> Mark present</>}</button></td></tr>)}</tbody></table></div>}</section></>;
}
