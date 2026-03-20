// Template 4 — Creative Teal (left sidebar color block)
import React from 'react';

const Template4Creative = ({ data }) => {
  const { personal = {}, summary = '', experience = [], education = [], skills = {}, certifications = [], projects = [] } = data;
  return (
    <div id="resume-preview" style={{ fontFamily: "'Trebuchet MS', sans-serif", background: '#fff', color: '#1a1a1a', width: '210mm', minHeight: '297mm', margin: '0 auto', display: 'flex', padding: 0 }}>
      {/* Left sidebar */}
      <div style={{ width: 195, background: 'linear-gradient(180deg,#0d9488 0%,#0f766e 100%)', padding: '36px 20px', flexShrink: 0 }}>
        {/* Avatar placeholder */}
        <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(255,255,255,0.15)', border: '3px solid rgba(255,255,255,0.5)', margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, color: '#fff' }}>
          {(personal.name || 'U')[0].toUpperCase()}
        </div>
        <h1 style={{ color: '#fff', fontSize: 16, fontWeight: 800, textAlign: 'center', margin: '0 0 4px', lineHeight: 1.2 }}>{personal.name || 'Your Name'}</h1>
        <p style={{ color: '#99f6e4', fontSize: 10, textAlign: 'center', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 20px' }}>{personal.title || 'Title'}</p>

        <div style={{ marginBottom: 20 }}>
          <h4 style={sideHead}>Contact</h4>
          {personal.email && <p style={sideItem}>✉ {personal.email}</p>}
          {personal.phone && <p style={sideItem}>📱 {personal.phone}</p>}
          {personal.location && <p style={sideItem}>📍 {personal.location}</p>}
          {personal.linkedin && <p style={sideItem}>in {personal.linkedin}</p>}
          {personal.github && <p style={sideItem}>⌨ {personal.github}</p>}
        </div>

        {Object.keys(skills).length > 0 && (
          <div style={{ marginBottom: 20 }}>
            <h4 style={sideHead}>Skills</h4>
            {Object.entries(skills).map(([cat, items]) => (
              <div key={cat} style={{ marginBottom: 8 }}>
                <p style={{ fontSize: 9, fontWeight: 700, color: '#99f6e4', margin: '0 0 3px', textTransform: 'uppercase' }}>{cat}</p>
                {(Array.isArray(items) ? items : String(items).split(',').map(s => s.trim())).filter(Boolean).map((s, i) => (
                  <div key={i} style={{ fontSize: 9.5, color: '#fff', marginBottom: 2, paddingLeft: 8, borderLeft: '2px solid #99f6e4' }}>{s}</div>
                ))}
              </div>
            ))}
          </div>
        )}

        {certifications.length > 0 && (
          <div>
            <h4 style={sideHead}>Certifications</h4>
            {certifications.filter(Boolean).map((c, i) => <p key={i} style={{ ...sideItem, marginBottom: 5 }}>• {c}</p>)}
          </div>
        )}
      </div>

      {/* Main content */}
      <div style={{ flex: 1, padding: '32px 28px' }}>
        {summary && (
          <div style={{ marginBottom: 20, paddingBottom: 16, borderBottom: '1px solid #e2e8f0' }}>
            <h3 style={mainHead}>About Me</h3>
            <p style={{ fontSize: 11, lineHeight: 1.75, color: '#444', margin: 0 }}>{summary}</p>
          </div>
        )}

        {experience.length > 0 && (
          <div style={{ marginBottom: 20 }}>
            <h3 style={mainHead}>Experience</h3>
            {experience.map((exp, i) => (
              <div key={i} style={{ marginBottom: 14, paddingLeft: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <p style={{ fontWeight: 800, fontSize: 12, margin: 0, color: '#0d9488' }}>{exp.role}</p>
                    <p style={{ fontSize: 10.5, color: '#555', margin: '1px 0 5px' }}>{exp.company}{exp.location ? ` · ${exp.location}` : ''}</p>
                  </div>
                  <span style={{ fontSize: 10, color: '#888', background: '#f0fdf4', padding: '2px 8px', borderRadius: 10, fontWeight: 600, whiteSpace: 'nowrap' }}>{exp.duration}</span>
                </div>
                <ul style={{ margin: 0, paddingLeft: 14 }}>{(exp.points || []).filter(Boolean).map((pt, j) => <li key={j} style={{ fontSize: 10.5, lineHeight: 1.65, color: '#444', marginBottom: 2 }}>{pt}</li>)}</ul>
              </div>
            ))}
          </div>
        )}

        {projects.length > 0 && (
          <div style={{ marginBottom: 20 }}>
            <h3 style={mainHead}>Projects</h3>
            {projects.map((p, i) => (
              <div key={i} style={{ marginBottom: 12, background: '#f0fdfa', borderRadius: 6, padding: '10px 12px', borderLeft: '3px solid #0d9488' }}>
                <p style={{ fontWeight: 800, fontSize: 11.5, margin: '0 0 2px', color: '#0f766e' }}>{p.name} {p.tech && <span style={{ fontWeight: 500, fontSize: 10, color: '#666' }}>| {p.tech}</span>}</p>
                <ul style={{ margin: 0, paddingLeft: 14 }}>{(p.points || []).filter(Boolean).map((pt, j) => <li key={j} style={{ fontSize: 10.5, lineHeight: 1.6, color: '#444', marginBottom: 2 }}>{pt}</li>)}</ul>
              </div>
            ))}
          </div>
        )}

        {education.length > 0 && (
          <div>
            <h3 style={mainHead}>Education</h3>
            {education.map((edu, i) => (
              <div key={i} style={{ marginBottom: 10, display: 'flex', justifyContent: 'space-between' }}>
                <div>
                  <p style={{ fontWeight: 800, fontSize: 12, margin: 0 }}>{edu.degree}</p>
                  <p style={{ fontSize: 10.5, color: '#555', margin: '1px 0' }}>{edu.institution}{edu.gpa ? ` | GPA: ${edu.gpa}` : ''}</p>
                </div>
                <span style={{ fontSize: 10, color: '#888', whiteSpace: 'nowrap' }}>{edu.year}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const sideHead = { fontSize: 10, fontWeight: 800, color: '#ccfbf1', letterSpacing: '0.1em', textTransform: 'uppercase', borderBottom: '1px solid rgba(255,255,255,0.2)', paddingBottom: 4, marginBottom: 8, margin: '0 0 8px' };
const sideItem = { fontSize: 10, color: 'rgba(255,255,255,0.85)', margin: '0 0 4px', lineHeight: 1.4, wordBreak: 'break-all' };
const mainHead = { fontSize: 11, fontWeight: 900, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#0d9488', borderBottom: '2px solid #0d9488', paddingBottom: 4, marginBottom: 12, margin: '0 0 12px' };

export default Template4Creative;
