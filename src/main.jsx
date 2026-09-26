import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';

const subjects = ['Maths', 'Physics', 'Chemistry'];
const subjectMeta = { Maths: ['#a78bfa', '∑'], Physics: ['#67e8f9', '⌁'], Chemistry: ['#f0abfc', '⚗'] };
const seed = [
  { id: 1, date: '2026-09-26', subject: 'Maths', topic: 'Differentiation', status: 'correct', error: '' },
  { id: 2, date: '2026-09-26', subject: 'Physics', topic: 'Electrostatics', status: 'incorrect', error: 'Unknown concept' },
  { id: 3, date: '2026-09-25', subject: 'Chemistry', topic: 'Organic Reactions', status: 'correct', error: '' },
  { id: 4, date: '2026-09-25', subject: 'Maths', topic: 'Matrices', status: 'incorrect', error: 'Calculation error' },
  { id: 5, date: '2026-09-24', subject: 'Physics', topic: 'Kinematics', status: 'correct', error: '' }
];

function loadPractice() {
  try { return JSON.parse(localStorage.getItem('vanta-practice')) || seed; } catch { return seed; }
}
function formatDate(date) { return new Date(`${date}T12:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }); }
function today() { return new Date().toISOString().slice(0, 10); }

function ParticleSphere() {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current, ctx = canvas.getContext('2d');
    let raf, t = 0;
    const resize = () => { const dpr = Math.min(devicePixelRatio || 1, 2); canvas.width = canvas.clientWidth * dpr; canvas.height = canvas.clientHeight * dpr; ctx.scale(dpr, dpr); };
    resize(); window.addEventListener('resize', resize);
    const draw = () => {
      const w = canvas.clientWidth, h = canvas.clientHeight; ctx.clearRect(0, 0, w, h); t += .006;
      const cx = w * .5, cy = h * .48, rx = Math.min(w * .39, 150), ry = Math.min(h * .42, 185);
      const glow = ctx.createRadialGradient(cx, cy, 8, cx, cy, rx * 1.2); glow.addColorStop(0, 'rgba(91,79,255,.18)'); glow.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = glow; ctx.fillRect(0, 0, w, h);
      for (let i = 0; i < 210; i++) {
        const a = i * 2.399 + t * (i % 3 ? .45 : -.7), y = (i / 210) * 2 - 1, r = Math.sqrt(1 - y * y);
        const x = Math.cos(a) * r, z = Math.sin(a) * r, px = cx + x * rx * (.92 + z * .08), py = cy + y * ry;
        const alpha = .25 + (z + 1) * .3, size = z > 0 ? 1.35 : .75;
        ctx.beginPath(); ctx.arc(px, py, size, 0, Math.PI * 2); ctx.fillStyle = i % 3 ? `rgba(103,232,249,${alpha})` : `rgba(167,139,250,${alpha})`; ctx.fill();
      }
      for (let j = 0; j < 7; j++) { ctx.beginPath(); for (let k = 0; k <= 80; k++) { const p = k / 80, x = cx + Math.sin(p * 9 + j + t * 2) * rx * .72 + (p - .5) * 20, y = cy + (p - .5) * ry * 2.05; k ? ctx.lineTo(x, y) : ctx.moveTo(x, y); } ctx.strokeStyle = j % 2 ? 'rgba(103,232,249,.2)' : 'rgba(167,139,250,.22)'; ctx.lineWidth = 1; ctx.stroke(); }
      raf = requestAnimationFrame(draw);
    }; draw(); return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize); };
  }, []);
  return <div className="sphere-wrap"><div className="orbit orbit-one" /><div className="orbit orbit-two" /><canvas ref={canvasRef} /></div>;
}

function App() {
  const [practice, setPractice] = useState(loadPractice);
  const [tab, setTab] = useState('home');
  const [subject, setSubject] = useState('All');
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ subject: 'Maths', topic: '', status: 'correct', error: 'Calculation error' });
  useEffect(() => localStorage.setItem('vanta-practice', JSON.stringify(practice)), [practice]);
  const filtered = subject === 'All' ? practice : practice.filter(x => x.subject === subject);
  const total = filtered.length, correct = filtered.filter(x => x.status === 'correct').length;
  const accuracy = total ? Math.round(correct / total * 100) : 0;
  const todayCount = practice.filter(x => x.date === today()).length;
  const streak = useMemo(() => { const days = new Set(practice.map(x => x.date)); let count = 0, d = new Date(); while (days.has(d.toISOString().slice(0, 10))) { count++; d.setDate(d.getDate() - 1); } return count || (practice.length ? 1 : 0); }, [practice]);
  const addPractice = e => { e.preventDefault(); if (!form.topic.trim()) return; setPractice(p => [{ ...form, id: Date.now(), date: today(), topic: form.topic.trim() }, ...p]); setForm({ ...form, topic: '' }); setShowAdd(false); setTab('home'); };
  const remove = id => setPractice(p => p.filter(x => x.id !== id));
  const counts = subjects.map(s => ({ subject: s, total: practice.filter(x => x.subject === s).length, correct: practice.filter(x => x.subject === s && x.status === 'correct').length }));

  return <div className="app-shell">
    <header className="topbar"><div className="brand-mark">V</div><div><div className="eyebrow">PRACTICE INTELLIGENCE</div><div className="brand-name">Vanta<span>°</span></div></div><button className="icon-button" onClick={() => setTab('settings')} aria-label="Settings">⚙</button></header>
    {tab === 'home' && <main className="page home-page">
      <section className="hero"><div className="hero-copy"><p className="eyebrow cyan">GOOD EVENING, AYUSH</p><h1>Build your<br /><em>edge.</em></h1><p className="subcopy">Small repetitions. Unmistakable progress.</p></div><ParticleSphere /><div className="sphere-label"><span className="pulse" /> LIVE FOCUS<br /><strong>{todayCount} questions today</strong></div></section>
      <div className="subject-pills"><button className={subject === 'All' ? 'active' : ''} onClick={() => setSubject('All')}>Overview</button>{subjects.map(s => <button key={s} className={subject === s ? 'active' : ''} onClick={() => setSubject(s)}>{s}</button>)}</div>
      <section className="stats-grid"><div className="glass stat-card accent"><span className="stat-icon">◎</span><strong>{accuracy}%</strong><small>ACCURACY</small><div className="mini-bars"><i /><i /><i /><i /><i /></div></div><div className="glass stat-card"><span className="stat-icon fire">✦</span><strong>{streak}<small className="inline"> days</small></strong><small>STREAK</small><div className="streak-line" /></div></section>
      <section className="section-head"><div><p className="eyebrow">YOUR MOMENTUM</p><h2>Practice overview</h2></div><button className="text-button" onClick={() => setTab('analytics')}>Details →</button></section>
      <div className="glass momentum"><div className="momentum-top"><span>Weekly consistency</span><strong>{Math.min(100, Math.round(practice.length / 7 * 100))}%</strong></div><div className="progress"><i style={{ width: `${Math.min(100, Math.round(practice.length / 7 * 100))}%` }} /></div><div className="week"><span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span><span className="today-dot">S</span></div></div>
      <section className="section-head recent-head"><div><p className="eyebrow">LATEST SIGNALS</p><h2>Recent practice</h2></div><button className="text-button" onClick={() => setTab('practice')}>View all</button></section>
      <div className="activity-list">{filtered.slice(0, 3).map(item => <Activity key={item.id} item={item} onRemove={remove} />)}{!filtered.length && <div className="empty glass">No practice logged yet. Start your first session.</div>}</div>
    </main>}
    {tab === 'practice' && <Practice practice={practice} setShowAdd={setShowAdd} remove={remove} />}
    {tab === 'analytics' && <Analytics counts={counts} practice={practice} accuracy={accuracy} />}
    {tab === 'settings' && <Settings practice={practice} setPractice={setPractice} />}
    <nav className="bottom-nav"><Nav icon="⌂" label="Home" active={tab === 'home'} onClick={() => setTab('home')} /><Nav icon="＋" label="Log" active={tab === 'practice'} onClick={() => setTab('practice')} /><button className="add-button" onClick={() => setShowAdd(true)}>+</button><Nav icon="◒" label="Insights" active={tab === 'analytics'} onClick={() => setTab('analytics')} /><Nav icon="◉" label="Profile" active={tab === 'settings'} onClick={() => setTab('settings')} /></nav>
    {showAdd && <div className="modal-backdrop" onClick={() => setShowAdd(false)}><form className="modal glass" onSubmit={addPractice} onClick={e => e.stopPropagation()}><div className="modal-head"><div><p className="eyebrow cyan">NEW SIGNAL</p><h2>Log practice</h2></div><button type="button" className="close" onClick={() => setShowAdd(false)}>×</button></div><label>SUBJECT<select value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })}>{subjects.map(s => <option key={s}>{s}</option>)}</select></label><label>TOPIC NAME<input autoFocus placeholder="e.g. Thermodynamics" value={form.topic} onChange={e => setForm({ ...form, topic: e.target.value })} /></label><label>RESULT<div className="choice-row"><button type="button" className={form.status === 'correct' ? 'choice selected good' : 'choice'} onClick={() => setForm({ ...form, status: 'correct' })}>✓ Correct</button><button type="button" className={form.status === 'incorrect' ? 'choice selected bad' : 'choice'} onClick={() => setForm({ ...form, status: 'incorrect' })}>× Incorrect</button></div></label>{form.status === 'incorrect' && <label>ERROR TYPE<select value={form.error} onChange={e => setForm({ ...form, error: e.target.value })}><option>Calculation error</option><option>Unknown concept</option></select></label>}<button className="primary-button" type="submit">Save practice <span>→</span></button></form></div>}
  </div>;
}

function Activity({ item, onRemove }) { return <div className="activity glass"><div className="subject-badge" style={{ color: subjectMeta[item.subject][0], background: `${subjectMeta[item.subject][0]}18` }}>{subjectMeta[item.subject][1]}</div><div className="activity-info"><strong>{item.topic}</strong><small>{item.subject} · {formatDate(item.date)}{item.error && ` · ${item.error}`}</small></div><div className={item.status === 'correct' ? 'result correct' : 'result incorrect'}>{item.status === 'correct' ? '✓' : '×'}</div><button className="delete" onClick={() => onRemove(item.id)}>•••</button></div>; }
function Nav({ icon, label, active, onClick }) { return <button className={`nav-item ${active ? 'active' : ''}`} onClick={onClick}><span>{icon}</span>{label}</button>; }
function Practice({ practice, setShowAdd, remove }) { return <main className="page sub-page"><div className="page-title"><div><p className="eyebrow cyan">THE LOG</p><h1>Practice history</h1></div><button className="round-add" onClick={() => setShowAdd(true)}>+</button></div><div className="filter-note">{practice.length} total questions logged</div><div className="activity-list full-list">{practice.map(item => <Activity key={item.id} item={item} onRemove={remove} />)}</div>{!practice.length && <div className="empty glass">Your practice history will appear here.</div>}</main>; }
function Analytics({ counts, practice, accuracy }) { const max = Math.max(...counts.map(x => x.total), 1); return <main className="page sub-page"><p className="eyebrow cyan">THE SIGNAL</p><h1>Insights</h1><div className="glass big-score"><span>Overall accuracy</span><strong>{accuracy}%</strong><div className="score-ring" style={{ '--score': `${accuracy * 3.6}deg` }} /></div><section className="section-head"><div><p className="eyebrow">SUBJECT BREAKDOWN</p><h2>Where you stand</h2></div></section><div className="glass breakdown">{counts.map(x => <div className="break-row" key={x.subject}><div className="break-label"><span style={{ color: subjectMeta[x.subject][0] }}>{subjectMeta[x.subject][1]}</span><strong>{x.subject}</strong><small>{x.total ? Math.round(x.correct / x.total * 100) : 0}% accurate</small></div><div className="bar"><i style={{ width: `${x.total / max * 100}%`, background: subjectMeta[x.subject][0] }} /></div><b>{x.total}</b></div>)}</div><section className="section-head"><div><p className="eyebrow">ERROR PATTERNS</p><h2>Turn friction into flow</h2></div></section><div className="error-cards"><div className="glass error-card"><strong>{practice.filter(x => x.error === 'Calculation error').length}</strong><small>Calculation errors</small></div><div className="glass error-card"><strong>{practice.filter(x => x.error === 'Unknown concept').length}</strong><small>Unknown concepts</small></div></div></main>; }
function Settings({ practice, setPractice }) { const [topic, setTopic] = useState(''); const topics = [...new Set(practice.map(x => x.topic))]; return <main className="page sub-page"><p className="eyebrow cyan">IDENTITY</p><h1>Ayush Chakrawarti</h1><p className="subcopy">Your private practice intelligence, stored on this device.</p><div className="glass settings-card"><p className="eyebrow">CUSTOM TOPICS</p><div className="topic-input"><input placeholder="Add a topic name" value={topic} onChange={e => setTopic(e.target.value)} /><button onClick={() => { if (topic.trim()) setTopic(''); }}>+</button></div><div className="topic-cloud">{topics.map(t => <span key={t}>{t}</span>)}</div></div><button className="danger-button" onClick={() => { if (confirm('Clear all practice data?')) setPractice([]); }}>Reset local data</button><p className="fine-print">No account. No tracking. Your data stays in your browser.</p></main>; }

createRoot(document.getElementById('root')).render(<App />);
