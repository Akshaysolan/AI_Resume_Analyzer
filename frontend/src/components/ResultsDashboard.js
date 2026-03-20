import React, { useState } from 'react';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell
} from 'recharts';
import {
  CheckCircle, AlertCircle, XCircle, ChevronDown, ChevronUp,
  Award, Target, Zap, TrendingUp, User, Mail, Phone, Linkedin,
  MapPin, ArrowRight, RotateCcw
} from 'lucide-react';
import ScoreRing from './ScoreRing';
import './ResultsDashboard.css';

/* ── Helpers ── */
const statusIcon = (status) => {
  if (status === 'excellent') return <CheckCircle size={14} className="status-icon excellent" />;
  if (status === 'good')      return <CheckCircle size={14} className="status-icon good" />;
  if (status === 'needs_work') return <AlertCircle size={14} className="status-icon warning" />;
  return <XCircle size={14} className="status-icon danger" />;
};

const priorityColor = (p) => {
  if (p === 'high')   return 'danger';
  if (p === 'medium') return 'warning';
  return 'info';
};

const gradeColor = (grade) => {
  if (!grade) return 'var(--text-muted)';
  if (grade.startsWith('A')) return 'var(--success)';
  if (grade.startsWith('B')) return 'var(--accent)';
  if (grade.startsWith('C')) return 'var(--warning)';
  return 'var(--danger)';
};

const scoreColor = (score) => {
  if (score >= 85) return '#22d3a0';
  if (score >= 70) return '#b8f94e';
  if (score >= 50) return '#f5a623';
  return '#f0455a';
};

/* ── Tab button ── */
const Tab = ({ id, label, icon: Icon, active, onClick }) => (
  <button
    className={`tab-btn ${active ? 'active' : ''}`}
    onClick={() => onClick(id)}
  >
    <Icon size={15} />
    {label}
  </button>
);

/* ── Section score row ── */
const SectionRow = ({ name, data }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className={`section-row ${open ? 'expanded' : ''}`}>
      <button className="section-row-header" onClick={() => setOpen(v => !v)}>
        <span className="section-row-left">
          {statusIcon(data.status)}
          <span className="section-row-name">{name}</span>
        </span>
        <span className="section-row-right">
          <span className="section-row-score" style={{ color: scoreColor(data.score) }}>
            {data.score}%
          </span>
          <div className="progress-bar section-progress">
            <div
              className="progress-fill"
              style={{ width: `${data.score}%`, background: scoreColor(data.score) }}
            />
          </div>
          {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </span>
      </button>
      {open && <p className="section-row-feedback">{data.feedback}</p>}
    </div>
  );
};

/* ── Main component ── */
const ResultsDashboard = ({ result, onReset }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const { filename, analysis: a } = result;

  if (!a) return null;

  /* Radar data */
  const radarData = a.sections ? Object.entries(a.sections).map(([key, val]) => ({
    subject: key.charAt(0).toUpperCase() + key.slice(1),
    score: val.score || 0,
  })) : [];

  /* Bar data */
  const barData = radarData;

  const tabs = [
    { id: 'overview',      label: 'Overview',      icon: Award },
    { id: 'sections',      label: 'Sections',      icon: Target },
    { id: 'improvements',  label: 'Improvements',  icon: TrendingUp },
    { id: 'skills',        label: 'Skills & Keywords', icon: Zap },
    { id: 'action',        label: 'Action Plan',   icon: ArrowRight },
  ];

  return (
    <div className="results-dashboard">
      <div className="container">

        {/* Header bar */}
        <div className="results-header">
          <div>
            <div className="results-filename">{filename}</div>
            <h2 className="results-title">Analysis Complete</h2>
          </div>
          <div className="results-header-actions">
            <button className="btn btn-outline" onClick={onReset}>
              <RotateCcw size={15} /> New Analysis
            </button>
          </div>
        </div>

        {/* Score hero */}
        <div className="score-hero glass-card">
          {/* Overall score */}
          <div className="score-hero-main">
            <ScoreRing score={a.overall_score || 0} size={160} label="Overall Score" />
            <div className="score-hero-info">
              <div className="score-grade" style={{ color: gradeColor(a.grade) }}>
                {a.grade || '—'}
              </div>
              <p className="score-summary">{a.summary}</p>
              <div className="score-tags">
                {a.career_level && <span className="tag tag-violet">{a.career_level}</span>}
                {a.industry && <span className="tag tag-muted">{a.industry}</span>}
                {a.experience_years != null && (
                  <span className="tag tag-muted">{a.experience_years}yr exp</span>
                )}
              </div>
            </div>
          </div>

          {/* Mini scores */}
          <div className="score-hero-sub">
            <div className="mini-score-card">
              <ScoreRing score={a.ats_score || 0} size={90} strokeWidth={8} label="ATS Score" />
            </div>
            {a.job_match?.score != null && (
              <div className="mini-score-card">
                <ScoreRing score={a.job_match.score} size={90} strokeWidth={8} label="Job Match" />
              </div>
            )}
          </div>
        </div>

        {/* Contact info */}
        {a.contact_info && (
          <div className="contact-strip glass-card">
            <span className="contact-name"><User size={14} /> {a.candidate_name || 'Candidate'}</span>
            {a.contact_info.email && <span><Mail size={13} /> {a.contact_info.email}</span>}
            {a.contact_info.phone && <span><Phone size={13} /> {a.contact_info.phone}</span>}
            {a.contact_info.linkedin && <span><Linkedin size={13} /> LinkedIn</span>}
            {a.contact_info.location && <span><MapPin size={13} /> {a.contact_info.location}</span>}
          </div>
        )}

        {/* Tabs */}
        <div className="tabs-bar">
          {tabs.map(t => <Tab key={t.id} {...t} active={activeTab === t.id} onClick={setActiveTab} />)}
        </div>

        {/* Tab panels */}
        <div className="tab-panel">

          {/* OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="panel-grid">
              {/* Radar */}
              <div className="glass-card panel-chart">
                <h3 className="panel-title">Section Breakdown</h3>
                <ResponsiveContainer width="100%" height={280}>
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="var(--border-subtle)" />
                    <PolarAngleAxis
                      dataKey="subject"
                      tick={{ fill: 'var(--text-secondary)', fontSize: 12, fontFamily: 'DM Sans' }}
                    />
                    <Radar
                      name="Score"
                      dataKey="score"
                      stroke="var(--accent)"
                      fill="var(--accent)"
                      fillOpacity={0.15}
                      strokeWidth={2}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>

              {/* Strengths */}
              <div className="glass-card panel-strengths">
                <h3 className="panel-title">Top Strengths</h3>
                <ul className="strength-list">
                  {(a.strengths || []).map((s, i) => (
                    <li key={i} className="strength-item">
                      <CheckCircle size={15} className="strength-icon" />
                      {s}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Bar chart */}
              <div className="glass-card panel-bar">
                <h3 className="panel-title">Section Scores</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={barData} barSize={24} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                    <XAxis
                      dataKey="subject"
                      tick={{ fill: 'var(--text-secondary)', fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      domain={[0, 100]}
                      tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        background: 'var(--bg-card)',
                        border: '1px solid var(--border-mid)',
                        borderRadius: '8px',
                        color: 'var(--text-primary)',
                        fontSize: '13px',
                      }}
                    />
                    <Bar dataKey="score" radius={[4, 4, 0, 0]}>
                      {barData.map((entry, i) => (
                        <Cell key={i} fill={scoreColor(entry.score)} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* ATS issues */}
              {a.ats_issues?.length > 0 && (
                <div className="glass-card panel-ats">
                  <h3 className="panel-title">ATS Issues</h3>
                  <ul className="ats-list">
                    {a.ats_issues.map((issue, i) => (
                      <li key={i} className="ats-item">
                        <AlertCircle size={14} /> {issue}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* SECTIONS */}
          {activeTab === 'sections' && (
            <div className="glass-card sections-panel">
              <h3 className="panel-title">Section-by-Section Analysis</h3>
              <div className="sections-list">
                {a.sections && Object.entries(a.sections).map(([key, val]) => (
                  <SectionRow key={key} name={key.charAt(0).toUpperCase() + key.slice(1)} data={val} />
                ))}
              </div>
            </div>
          )}

          {/* IMPROVEMENTS */}
          {activeTab === 'improvements' && (
            <div className="improvements-panel">
              {(a.improvements || []).map((imp, i) => (
                <div key={i} className={`glass-card improvement-card priority-${imp.priority}`}>
                  <div className="improvement-header">
                    <span className={`tag tag-${priorityColor(imp.priority)}`}>
                      {imp.priority} priority
                    </span>
                    <h4 className="improvement-title">{imp.title}</h4>
                  </div>
                  <p className="improvement-desc">{imp.description}</p>
                  {imp.example && (
                    <div className="improvement-example">
                      <span className="example-label">Example fix:</span>
                      {imp.example}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* SKILLS & KEYWORDS */}
          {activeTab === 'skills' && (
            <div className="skills-panel">
              <div className="glass-card skills-col">
                <h3 className="panel-title">Skills Found</h3>
                <div className="tags-cloud">
                  {(a.skills_found || []).map((s, i) => (
                    <span key={i} className="tag tag-accent">{s}</span>
                  ))}
                </div>
              </div>
              <div className="glass-card skills-col">
                <h3 className="panel-title">Missing Skills</h3>
                <div className="tags-cloud">
                  {(a.skills_missing || []).map((s, i) => (
                    <span key={i} className="tag tag-muted">{s}</span>
                  ))}
                </div>
              </div>
              <div className="glass-card skills-col">
                <h3 className="panel-title">Keywords Present</h3>
                <div className="tags-cloud">
                  {(a.keywords?.present || []).map((k, i) => (
                    <span key={i} className="tag tag-success">{k}</span>
                  ))}
                </div>
              </div>
              <div className="glass-card skills-col">
                <h3 className="panel-title">Suggested Keywords</h3>
                <div className="tags-cloud">
                  {(a.keywords?.suggested || []).map((k, i) => (
                    <span key={i} className="tag tag-warning">{k}</span>
                  ))}
                </div>
              </div>

              {/* Job match detail */}
              {a.job_match?.score != null && (
                <div className="glass-card job-match-card">
                  <h3 className="panel-title">Job Match Analysis</h3>
                  <div className="job-match-score">
                    <ScoreRing score={a.job_match.score} size={120} label="Match" />
                    <p className="job-match-rec">{a.job_match.recommendation}</p>
                  </div>
                  {a.job_match.matched_keywords?.length > 0 && (
                    <div>
                      <p className="match-sub-title">Matched</p>
                      <div className="tags-cloud">
                        {a.job_match.matched_keywords.map((k, i) => (
                          <span key={i} className="tag tag-success">{k}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  {a.job_match.missing_keywords?.length > 0 && (
                    <div style={{ marginTop: 16 }}>
                      <p className="match-sub-title">Missing from resume</p>
                      <div className="tags-cloud">
                        {a.job_match.missing_keywords.map((k, i) => (
                          <span key={i} className="tag tag-danger">{k}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ACTION PLAN */}
          {activeTab === 'action' && (
            <div className="action-panel">
              <div className="glass-card action-card">
                <h3 className="panel-title">Your 5-Step Action Plan</h3>
                <div className="action-steps">
                  {(a.action_plan || []).map((step, i) => (
                    <div key={i} className="action-step">
                      <div className="step-number">{step.step}</div>
                      <div className="step-content">
                        <span className="step-timeframe">{step.timeframe}</span>
                        <p className="step-action">{step.action}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer reset */}
        <div className="results-footer">
          <button className="btn btn-primary" onClick={onReset}>
            <RotateCcw size={16} /> Analyze Another Resume
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResultsDashboard;
