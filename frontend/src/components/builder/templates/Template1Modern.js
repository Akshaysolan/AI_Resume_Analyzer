// Template 1 — Modern Dark
import React from 'react';

const Template1Modern = ({ data }) => {
  const { personal = {}, summary = '', experience = [], education = [], skills = {}, certifications = [], projects = [] } = data;
  return (
    <div id="resume-preview" style={{ fontFamily: "'Segoe UI',sans-serif", background: '#fff', color: '#1a1a2e', width: '210mm', minHeight: '297mm', margin: '0 auto', padding: 0 }}>
      <div style={{ background: 'linear-gradient(135deg,#1a1a2e 0%,#16213e 60%,#0f3460 100%)', color: '#fff', padding: '36px 40px 28px' }}>
        <h1 style={{ margin: 0, fontSize: 28, fontWeight: 800, letterSpacing: '-0.5px' }}>{personal.name || 'Your Name'}</h1>
        <p style={{ margin: '4px 0 14px', fontSize: 13, color: '#b8f94e', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>{personal.title || 'Professional Title'}</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', fontSize: 12, color: 'rgba(255,255,255,0.85)' }}>
          {personal.email && <span>✉ {personal.email}</span>}
          {personal.phone && <span>📱 {personal.phone}</span>}
          {personal.location && <span>📍 {personal.location}</span>}
          {personal.linkedin && <span>in {personal.linkedin}</span>}
          {personal.github && <span>⌨ {personal.github}</span>}
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr' }}>
        <div style={{ background: '#f4f6fb', padding: '24px 18px', borderRight: '1px solid #e0e4ef' }}>
          {Object.keys(skills).length > 0 && (
            <div style={{ marginBottom: 22 }}>
              <h3 style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#0f3460', borderBottom: '2px solid #b8f94e', paddingBottom: 5, marginBottom: 10 }}>Skills</h3>
              {Object.entries(skills).map(([cat, items]) => (
                <div key={cat} style={{ marginBottom: 10 }}>
                  <p style={{ fontSize: 9, fontWeight: 700, color: '#555', margin: '0 0 4px', textTransform: 'uppercase' }}>{cat}</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                    {(Array.isArray(items) ? items : String(items).split(',').map(s => s.trim())).filter(Boolean).map((s, i) => (
                      <span key={i} style={{ background: '#e8eaf6', color: '#1a1a2e', fontSize: 9, padding: '2px 6px', borderRadius: 3, fontWeight: 500 }}>{s}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
          {certifications.length > 0 && (
            <div>
              <h3 style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#0f3460', borderBottom: '2px solid #b8f94e', paddingBottom: 5, marginBottom: 10 }}>Certifications</h3>
              {certifications.filter(Boolean).map((c, i) => <p key={i} style={{ fontSize: 10, color: '#333', margin: '0 0 6px', paddingLeft: 8, borderLeft: '2px solid #b8f94e', lineHeight: 1.5 }}>{c}</p>)}
            </div>
          )}
        </div>
        <div style={{ padding: '24px 28px' }}>
          {summary && (
            <div style={{ marginBottom: 20 }}>
              <h3 style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#0f3460', borderBottom: '2px solid #b8f94e', paddingBottom: 5, marginBottom: 9 }}>Professional Summary</h3>
              <p style={{ fontSize: 11, lineHeight: 1.7, color: '#333', margin: 0 }}>{summary}</p>
            </div>
          )}
          {experience.length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <h3 style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#0f3460', borderBottom: '2px solid #b8f94e', paddingBottom: 5, marginBottom: 10 }}>Experience</h3>
              {experience.map((exp, i) => (
                <div key={i} style={{ marginBottom: 13 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div><p style={{ fontWeight: 700, fontSize: 12, margin: 0 }}>{exp.role}</p><p style={{ fontSize: 10, color: '#0f3460', margin: '1px 0', fontWeight: 600 }}>{exp.company}{exp.location ? ` — ${exp.location}` : ''}</p></div>
                    <span style={{ fontSize: 10, color: '#888', whiteSpace: 'nowrap' }}>{exp.duration}</span>
                  </div>
                  <ul style={{ margin: '5px 0 0', paddingLeft: 14 }}>{(exp.points || []).filter(Boolean).map((pt, j) => <li key={j} style={{ fontSize: 10.5, color: '#444', lineHeight: 1.65, marginBottom: 2 }}>{pt}</li>)}</ul>
                </div>
              ))}
            </div>
          )}
          {projects.length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <h3 style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#0f3460', borderBottom: '2px solid #b8f94e', paddingBottom: 5, marginBottom: 10 }}>Projects</h3>
              {projects.map((p, i) => (
                <div key={i} style={{ marginBottom: 11 }}>
                  <p style={{ fontWeight: 700, fontSize: 11, margin: '0 0 1px' }}>{p.name} {p.tech && <span style={{ fontWeight: 400, fontSize: 10, color: '#666' }}>| {p.tech}</span>}</p>
                  <ul style={{ margin: '3px 0 0', paddingLeft: 14 }}>{(p.points || []).filter(Boolean).map((pt, j) => <li key={j} style={{ fontSize: 10.5, color: '#444', lineHeight: 1.6, marginBottom: 2 }}>{pt}</li>)}</ul>
                </div>
              ))}
            </div>
          )}
          {education.length > 0 && (
            <div>
              <h3 style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#0f3460', borderBottom: '2px solid #b8f94e', paddingBottom: 5, marginBottom: 10 }}>Education</h3>
              {education.map((edu, i) => (
                <div key={i} style={{ marginBottom: 9, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div><p style={{ fontWeight: 700, fontSize: 11, margin: 0 }}>{edu.degree}</p><p style={{ fontSize: 10, color: '#555', margin: '2px 0' }}>{edu.institution}{edu.gpa ? ` | GPA: ${edu.gpa}` : ''}</p></div>
                  <span style={{ fontSize: 10, color: '#888', whiteSpace: 'nowrap' }}>{edu.year}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Template1Modern;
