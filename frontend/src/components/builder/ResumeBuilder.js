import React, { useState, useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import {
  User, Briefcase, GraduationCap, Code, Award, FolderOpen,
  Plus, Trash2, Eye, Crown, Check, X, Loader2, Lock
} from 'lucide-react';
import Template1Modern    from './templates/Template1Modern';
import Template2Minimal   from './templates/Template2Minimal';
import Template3Executive from './templates/Template3Executive';
import Template4Creative  from './templates/Template4Creative';
import Template5Elegant   from './templates/Template5Elegant';
import { useAuth }        from '../../context/AuthContext';
import { saveResume, trackDownload, subscribe as subscribeAPI } from '../../services/api';
import './ResumeBuilder.css';

// ── Template catalogue ────────────────────────────────────────────────────────
const TEMPLATES = [
  { id: 'modern',    label: 'Modern Dark',    color: '#1a1a2e', accent: '#b8f94e', Component: Template1Modern    },
  { id: 'minimal',   label: 'Clean Minimal',  color: '#2563eb', accent: '#eff6ff', Component: Template2Minimal   },
  { id: 'executive', label: 'Executive Bold', color: '#111111', accent: '#f59e0b', Component: Template3Executive  },
  { id: 'creative',  label: 'Creative Teal',  color: '#0d9488', accent: '#ccfbf1', Component: Template4Creative   },
  { id: 'elegant',   label: 'Elegant Purple', color: '#7c3aed', accent: '#ddd6fe', Component: Template5Elegant    },
];

// ── Sample resume data (pre-filled from Akshay's resume) ─────────────────────
const SAMPLE_DATA = {
  personal: {
    name: 'Akshay Solanke', title: 'Quality Analyst Engineer',
    email: 'akshaysolan804@gmail.com', phone: '+91-8855878880',
    location: 'Pune, India',
    linkedin: 'linkedin.com/in/akshay-solanke-724233277',
    github: 'github.com/Akshaysolan',
  },
  summary: 'Results-driven Quality Analyst Engineer and Computer Engineering graduate with strong expertise in Software Testing, Java Backend Development, and AI-powered applications. Proficient in Spring Boot, RESTful APIs, Selenium automation, defect lifecycle management, and RAG systems using LangChain.',
  experience: [
    {
      role: 'Quality Analyst Engineer', company: 'Cumulus System',
      location: 'Pune', duration: 'Oct 2025 – Mar 2026',
      points: [
        'Designed and executed detailed test plans and test cases for feature validation.',
        'Performed functional and regression testing ensuring product reliability.',
        'Managed defect reporting and tracking lifecycle efficiently.',
        'Collaborated with development teams to enhance application quality.',
      ],
    },
    {
      role: 'DHM (AUT)', company: 'Zepto',
      location: 'Pune', duration: 'Jul 2025 – Sep 2025',
      points: [
        'Managed end-to-end operational workflows ensuring timely processing.',
        'Improved customer satisfaction through issue resolution.',
      ],
    },
  ],
  education: [
    { degree: 'Bachelor of Engineering (Computer Engineering)', institution: 'Indira College of Engineering and Management, Pune', year: '2025', gpa: '8.2' },
  ],
  skills: {
    'Programming':   'Java, Python, OOP, Machine Learning',
    'Frameworks':    'Spring Boot, Hibernate, Django, LangChain, RAG',
    'Testing & QA':  'Manual Testing, Selenium WebDriver, JUnit, Postman',
    'Database':      'MySQL, MongoDB, Oracle',
    'Tools':         'Git, GitHub, Docker, VS Code, Eclipse',
  },
  certifications: [
    'End-to-End RAG Application Development – LangChain & Streamlit',
    'Java Advanced + Spring Boot',
    'Selenium Testing',
  ],
  projects: [
    {
      name: 'AI Legal Document Analyzer', tech: 'Python, RAG, LLM, LangChain, Streamlit', link: '',
      points: [
        'Developed AI-powered legal document analysis using RAG pipeline.',
        'Implemented document chunking, embeddings, and vector search for Q&A.',
        'Built interactive Streamlit dashboard for document analysis.',
      ],
    },
    {
      name: 'TalkHub', tech: 'Python, Django, HTML/CSS, WebSocket, LLM', link: '',
      points: [
        'Full-stack Django platform with JWT authentication.',
        'Real-time chat using WebSockets and WebRTC.',
        'AI-powered smart reply suggestions.',
      ],
    },
  ],
};

// ── Subscribe Modal ───────────────────────────────────────────────────────────
const SubscribeModal = ({ onClose, onSuccess, onNeedAuth }) => {
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');
  const { user }              = useAuth();

  const handleActivate = async () => {
    if (!user) { onClose(); onNeedAuth && onNeedAuth(); return; }
    setLoading(true); setError('');
    try {
      await subscribeAPI();
      onSuccess();
    } catch (e) {
      if (e?.response?.status === 401) { onClose(); onNeedAuth && onNeedAuth(); }
      else setError('Something went wrong. Please try again.');
    } finally { setLoading(false); }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <Crown size={28} className="modal-crown" />
          <h2>Unlock Unlimited Access</h2>
          <p>You've used your 1 free resume. Subscribe for unlimited builds and downloads.</p>
        </div>
        <div className="modal-plans">
          <div className="plan-card plan-free">
            <p className="plan-name">Free</p>
            <p className="plan-price">₹0</p>
            <ul>
              <li><Check size={13} /> 1 Resume Build</li>
              <li><Check size={13} /> 1 Download</li>
              <li><X size={13} className="no" /> Unlimited Access</li>
            </ul>
          </div>
          <div className="plan-card plan-pro">
            <div className="plan-badge">Most Popular</div>
            <p className="plan-name">Pro</p>
            <p className="plan-price">₹199<span>/mo</span></p>
            <ul>
              <li><Check size={13} /> Unlimited Resumes</li>
              <li><Check size={13} /> All 5 Templates</li>
              <li><Check size={13} /> Unlimited Downloads</li>
            </ul>
          </div>
        </div>
        <div className="modal-form">
          {error && <p className="modal-error">{error}</p>}
          <button className="btn btn-primary modal-btn" onClick={handleActivate} disabled={loading}>
            {loading
              ? <><Loader2 size={16} className="spin" /> Activating...</>
              : <><Crown size={16} /> Activate Pro Access</>
            }
          </button>
          <button className="btn btn-ghost modal-close-btn" onClick={onClose}>Maybe later</button>
        </div>
      </div>
    </div>
  );
};

// ── Bullet points editor ──────────────────────────────────────────────────────
const PointsEditor = ({ points = [], onChange }) => (
  <div className="points-editor">
    {points.map((pt, i) => (
      <div key={i} className="point-row">
        <span className="point-bullet">•</span>
        <input
          className="form-input point-input"
          value={pt}
          placeholder="Add bullet point..."
          onChange={e => { const n = [...points]; n[i] = e.target.value; onChange(n); }}
        />
        <button className="icon-btn danger" onClick={() => onChange(points.filter((_, idx) => idx !== i))}>
          <Trash2 size={12} />
        </button>
      </div>
    ))}
    <button className="btn-add-point" onClick={() => onChange([...points, ''])}>
      <Plus size={12} /> Add point
    </button>
  </div>
);

// ── Main Component ────────────────────────────────────────────────────────────
const ResumeBuilder = ({ onNeedAuth }) => {
  const { user, refreshUser } = useAuth();

  const [data,          setData]          = useState(SAMPLE_DATA);
  const [templateId,    setTemplateId]    = useState('modern');
  const [activeSection, setActiveSection] = useState('personal');
  const [showPreview,   setShowPreview]   = useState(false);
  const [showSubscribe, setShowSubscribe] = useState(false);
  const [saving,        setSaving]        = useState(false);
  const [toast,         setToast]         = useState('');
  const previewRef = useRef();

  const selectedTpl  = TEMPLATES.find(t => t.id === templateId);
  const PreviewComp  = selectedTpl?.Component;

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  // ── PDF download ────────────────────────────────────────────────────────────
  const handlePrint = useReactToPrint({
    content: () => previewRef.current,
    documentTitle: `${data.personal.name || 'Resume'}_${templateId}`,
    onBeforeGetContent: async () => {
      if (!user) { onNeedAuth && onNeedAuth(); throw new Error('not_logged_in'); }
      if (!user.can_download) { setShowSubscribe(true); throw new Error('limit_reached'); }
      try {
        await trackDownload();
        await refreshUser();
      } catch (e) {
        if (e?.response?.status === 402) { setShowSubscribe(true); throw new Error('limit_reached'); }
        throw e;
      }
    },
    onAfterPrint: () => showToast('✅ Resume downloaded!'),
  });

  // ── Save ────────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!user) { onNeedAuth && onNeedAuth(); return; }
    if (!user.can_build) { setShowSubscribe(true); return; }
    setSaving(true);
    try {
      await saveResume(templateId, data);
      await refreshUser();
      showToast('✅ Resume saved!');
    } catch (e) {
      if (e?.response?.status === 402) setShowSubscribe(true);
      else showToast('❌ Save failed. Please try again.');
    } finally { setSaving(false); }
  };

  // ── Field helpers ───────────────────────────────────────────────────────────
  const setPersonal    = (f, v) => setData(d => ({ ...d, personal: { ...d.personal, [f]: v } }));
  const setExpField    = (i, f, v) => setData(d => { const arr = [...d.experience]; arr[i] = { ...arr[i], [f]: v }; return { ...d, experience: arr }; });
  const setEduField    = (i, f, v) => setData(d => { const arr = [...d.education];  arr[i] = { ...arr[i], [f]: v }; return { ...d, education:  arr }; });
  const setProjField   = (i, f, v) => setData(d => { const arr = [...d.projects];   arr[i] = { ...arr[i], [f]: v }; return { ...d, projects:   arr }; });
  const setSkillVal    = (cat, v)  => setData(d => ({ ...d, skills: { ...d.skills, [cat]: v } }));
  const addSkillCat    = ()        => setData(d => ({ ...d, skills: { ...d.skills, 'New Category': '' } }));
  const removeSkillCat = (cat)     => setData(d => { const s = { ...d.skills }; delete s[cat]; return { ...d, skills: s }; });
  const renameSkillCat = (old_, new_) => setData(d => {
    const s = {};
    Object.entries(d.skills).forEach(([k, v]) => { s[k === old_ ? new_ : k] = v; });
    return { ...d, skills: s };
  });

  const SECTIONS = [
    { id: 'personal',       label: 'Personal Info',  icon: User          },
    { id: 'summary',        label: 'Summary',        icon: Briefcase     },
    { id: 'experience',     label: 'Experience',     icon: Briefcase     },
    { id: 'education',      label: 'Education',      icon: GraduationCap },
    { id: 'skills',         label: 'Skills',         icon: Code          },
    { id: 'projects',       label: 'Projects',       icon: FolderOpen    },
    { id: 'certifications', label: 'Certifications', icon: Award         },
  ];

  return (
    <div className="builder-page">
      {/* Toast */}
      {toast && <div className="builder-toast">{toast}</div>}

      {/* Subscribe modal */}
      {showSubscribe && (
        <SubscribeModal
          onClose={() => setShowSubscribe(false)}
          onNeedAuth={onNeedAuth}
          onSuccess={async () => {
            await refreshUser();
            setShowSubscribe(false);
            showToast('🎉 Pro access activated!');
          }}
        />
      )}

      {/* Page header */}
      <div className="builder-header">
        <div>
          <h1 className="builder-title">Resume Builder</h1>
          <p className="builder-sub">Build a professional resume in minutes</p>
        </div>
        <div className="builder-header-actions">
          {user && !user.is_subscribed && !user.is_admin && (
            <button className="btn-upgrade" onClick={() => setShowSubscribe(true)}>
              <Crown size={14} /> Upgrade to Pro
            </button>
          )}
          {(user?.is_subscribed || user?.is_admin) && (
            <span className="pro-badge">
              <Crown size={13} /> {user.is_admin ? 'Admin' : 'Pro'}
            </span>
          )}
          <button className="btn btn-outline" onClick={() => setShowPreview(v => !v)}>
            <Eye size={15} /> {showPreview ? 'Hide Preview' : 'Preview'}
          </button>
          <button className="btn btn-outline" onClick={handleSave} disabled={saving}>
            {saving ? <Loader2 size={15} className="spin" /> : null} Save
          </button>
          <button className="btn btn-primary" onClick={handlePrint}>
            {user && !user.can_download && !user.is_admin && <Lock size={12} />}
            Download PDF
          </button>
        </div>
      </div>

      {/* Template picker */}
      <div className="template-picker">
        <p className="template-picker-label">Choose Template:</p>
        <div className="template-options">
          {TEMPLATES.map(t => (
            <button
              key={t.id}
              className={`template-chip ${templateId === t.id ? 'active' : ''}`}
              onClick={() => setTemplateId(t.id)}
              title={t.label}
            >
              <span className="template-chip-swatch" style={{ background: t.color, borderColor: t.accent }} />
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Body: form + preview */}
      <div className="builder-body">

        {/* ── Left: Form ── */}
        <div className="builder-form">
          {/* Section nav */}
          <div className="section-nav">
            {SECTIONS.map(s => {
              const Icon = s.icon;
              return (
                <button
                  key={s.id}
                  className={`section-nav-btn ${activeSection === s.id ? 'active' : ''}`}
                  onClick={() => setActiveSection(s.id)}
                >
                  <Icon size={14} /> {s.label}
                </button>
              );
            })}
          </div>

          {/* Form panels */}
          <div className="form-panel">

            {/* Personal */}
            {activeSection === 'personal' && (
              <div className="form-section">
                <h3 className="form-section-title">Personal Information</h3>
                <div className="form-grid-2">
                  {[
                    ['name',     'Full Name',              true ],
                    ['title',    'Job Title',              true ],
                    ['email',    'Email Address',          false],
                    ['phone',    'Phone Number',           false],
                    ['location', 'Location (City, Country)', false],
                    ['linkedin', 'LinkedIn URL',           false],
                    ['github',   'GitHub URL',             false],
                  ].map(([field, label, fullWidth]) => (
                    <div key={field} className={fullWidth ? 'span-2' : ''}>
                      <label className="form-label">{label}</label>
                      <input
                        className="form-input"
                        value={data.personal[field] || ''}
                        onChange={e => setPersonal(field, e.target.value)}
                        placeholder={label}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Summary */}
            {activeSection === 'summary' && (
              <div className="form-section">
                <h3 className="form-section-title">Professional Summary</h3>
                <label className="form-label">2–4 sentences about your background and key strengths</label>
                <textarea
                  className="form-input form-textarea"
                  rows={7}
                  value={data.summary}
                  onChange={e => setData(d => ({ ...d, summary: e.target.value }))}
                  placeholder="Results-driven professional with X years of experience in..."
                />
                <p className="form-hint">{data.summary.length} chars</p>
              </div>
            )}

            {/* Experience */}
            {activeSection === 'experience' && (
              <div className="form-section">
                <h3 className="form-section-title">Work Experience</h3>
                {data.experience.map((exp, i) => (
                  <div key={i} className="repeater-card">
                    <div className="repeater-header">
                      <span className="repeater-num">#{i + 1}</span>
                      <span className="repeater-title">{exp.role || 'New Position'}</span>
                      <button className="icon-btn danger" onClick={() => setData(d => ({ ...d, experience: d.experience.filter((_, idx) => idx !== i) }))}>
                        <Trash2 size={13} />
                      </button>
                    </div>
                    <div className="form-grid-2">
                      {[
                        ['role',     'Job Title',  false],
                        ['company',  'Company',    false],
                        ['location', 'Location',   false],
                        ['duration', 'Duration (e.g. Jan 2024 – Present)', true],
                      ].map(([f, l, full]) => (
                        <div key={f} className={full ? 'span-2' : ''}>
                          <label className="form-label">{l}</label>
                          <input className="form-input" value={exp[f] || ''} onChange={e => setExpField(i, f, e.target.value)} placeholder={l} />
                        </div>
                      ))}
                    </div>
                    <label className="form-label" style={{ marginTop: 14 }}>Bullet Points</label>
                    <PointsEditor points={exp.points || []} onChange={pts => setExpField(i, 'points', pts)} />
                  </div>
                ))}
                <button className="btn-add-repeater" onClick={() => setData(d => ({ ...d, experience: [...d.experience, { role: '', company: '', location: '', duration: '', points: [''] }] }))}>
                  <Plus size={14} /> Add Experience
                </button>
              </div>
            )}

            {/* Education */}
            {activeSection === 'education' && (
              <div className="form-section">
                <h3 className="form-section-title">Education</h3>
                {data.education.map((edu, i) => (
                  <div key={i} className="repeater-card">
                    <div className="repeater-header">
                      <span className="repeater-num">#{i + 1}</span>
                      <span className="repeater-title">{edu.degree || 'New Degree'}</span>
                      <button className="icon-btn danger" onClick={() => setData(d => ({ ...d, education: d.education.filter((_, idx) => idx !== i) }))}>
                        <Trash2 size={13} />
                      </button>
                    </div>
                    <div className="form-grid-2">
                      {[
                        ['degree',      'Degree / Qualification', true ],
                        ['institution', 'Institution Name',       true ],
                        ['year',        'Year / Duration',        false],
                        ['gpa',         'GPA (optional)',         false],
                      ].map(([f, l, full]) => (
                        <div key={f} className={full ? 'span-2' : ''}>
                          <label className="form-label">{l}</label>
                          <input className="form-input" value={edu[f] || ''} onChange={e => setEduField(i, f, e.target.value)} placeholder={l} />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
                <button className="btn-add-repeater" onClick={() => setData(d => ({ ...d, education: [...d.education, { degree: '', institution: '', year: '', gpa: '' }] }))}>
                  <Plus size={14} /> Add Education
                </button>
              </div>
            )}

            {/* Skills */}
            {activeSection === 'skills' && (
              <div className="form-section">
                <h3 className="form-section-title">Skills</h3>
                <p className="form-hint" style={{ marginBottom: 16 }}>Organise skills into categories. Separate items with commas.</p>
                {Object.entries(data.skills).map(([cat, items]) => (
                  <div key={cat} className="skill-cat-row">
                    <input
                      className="form-input skill-cat-name"
                      value={cat}
                      onChange={e => renameSkillCat(cat, e.target.value)}
                      placeholder="Category"
                    />
                    <input
                      className="form-input skill-items"
                      value={Array.isArray(items) ? items.join(', ') : items}
                      onChange={e => setSkillVal(cat, e.target.value)}
                      placeholder="Skill 1, Skill 2, Skill 3..."
                    />
                    <button className="icon-btn danger" onClick={() => removeSkillCat(cat)}><Trash2 size={13} /></button>
                  </div>
                ))}
                <button className="btn-add-repeater" onClick={addSkillCat}><Plus size={14} /> Add Category</button>
              </div>
            )}

            {/* Projects */}
            {activeSection === 'projects' && (
              <div className="form-section">
                <h3 className="form-section-title">Projects</h3>
                {data.projects.map((p, i) => (
                  <div key={i} className="repeater-card">
                    <div className="repeater-header">
                      <span className="repeater-num">#{i + 1}</span>
                      <span className="repeater-title">{p.name || 'New Project'}</span>
                      <button className="icon-btn danger" onClick={() => setData(d => ({ ...d, projects: d.projects.filter((_, idx) => idx !== i) }))}>
                        <Trash2 size={13} />
                      </button>
                    </div>
                    <div className="form-grid-2">
                      {[
                        ['name', 'Project Name',            true ],
                        ['tech', 'Technologies Used',       false],
                        ['link', 'Project Link (optional)', false],
                      ].map(([f, l, full]) => (
                        <div key={f} className={full ? 'span-2' : ''}>
                          <label className="form-label">{l}</label>
                          <input className="form-input" value={p[f] || ''} onChange={e => setProjField(i, f, e.target.value)} placeholder={l} />
                        </div>
                      ))}
                    </div>
                    <label className="form-label" style={{ marginTop: 14 }}>Bullet Points</label>
                    <PointsEditor points={p.points || []} onChange={pts => setProjField(i, 'points', pts)} />
                  </div>
                ))}
                <button className="btn-add-repeater" onClick={() => setData(d => ({ ...d, projects: [...d.projects, { name: '', tech: '', link: '', points: [''] }] }))}>
                  <Plus size={14} /> Add Project
                </button>
              </div>
            )}

            {/* Certifications */}
            {activeSection === 'certifications' && (
              <div className="form-section">
                <h3 className="form-section-title">Certifications</h3>
                {data.certifications.map((c, i) => (
                  <div key={i} className="cert-row">
                    <input
                      className="form-input"
                      value={c}
                      onChange={e => {
                        const certs = [...data.certifications];
                        certs[i] = e.target.value;
                        setData(d => ({ ...d, certifications: certs }));
                      }}
                      placeholder="Certification name — Issuer"
                    />
                    <button className="icon-btn danger" onClick={() => setData(d => ({ ...d, certifications: d.certifications.filter((_, idx) => idx !== i) }))}>
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
                <button className="btn-add-repeater" onClick={() => setData(d => ({ ...d, certifications: [...d.certifications, ''] }))}>
                  <Plus size={14} /> Add Certification
                </button>
              </div>
            )}

          </div>{/* end form-panel */}
        </div>{/* end builder-form */}

        {/* ── Right: Preview ── */}
        <div className={`builder-preview ${showPreview ? 'visible' : ''}`}>
          <div className="preview-label">Live Preview — {selectedTpl?.label}</div>
          <div className="preview-scaler">
            <div ref={previewRef}>
              {PreviewComp && <PreviewComp data={data} />}
            </div>
          </div>
        </div>

      </div>{/* end builder-body */}
    </div>
  );
};

export default ResumeBuilder;
