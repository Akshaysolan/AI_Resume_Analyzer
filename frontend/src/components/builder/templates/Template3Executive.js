// Template 3 — Executive Bold (top sidebar, bold headers)
import React from 'react';

const Template3Executive = ({ data }) => {
  const { personal = {}, summary = '', experience = [], education = [], skills = {}, certifications = [], projects = [] } = data;
  return (
    <div id="resume-preview" style={{ fontFamily: "'Arial', sans-serif", background: '#fff', color: '#1a1a1a', width: '210mm', minHeight: '297mm', margin: '0 auto', padding: 0 }}>
      {/* Top strip */}
      <div style={{ background: '#111', padding: '30px 40px 22px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 32, fontWeight: 900, color: '#fff', letterSpacing: '-1px' }}>{personal.name || 'Your Name'}</h1>
          <p style={{ margin: '6px 0 0', fontSize: 13, color: '#f59e0b', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' }}>{personal.title || 'Professional Title'}</p>
        </div>
        <div style={{ textAlign: 'right', fontSize: 11, color: 'rgba(255,255,255,0.75)', lineHeight: 1.8 }}>
          {personal.email && <div>{personal.email}</div>}
          {personal.phone && <div>{personal.phone}</div>}
          {personal.location && <div>{personal.location}</div>}
        </div>
      </div>

      {/* Links bar */}
      {(personal.linkedin || personal.github) && (
        <div style={{ background: '#f59e0b', padding: '7px 40px', display: 'flex', gap: 24, fontSize: 11, fontWeight: 600, color: '#111' }}>
          {personal.linkedin && <span>LinkedIn: {personal.linkedin}</span>}
          {personal.github && <span>GitHub: {personal.github}</span>}
        </div>
      )}

      <div style={{ padding: '28px 40px' }}>
        {summary && (
          <div style={{ marginBottom: 22, paddingBottom: 18, borderBottom: '2px solid #111' }}>
            <h3 style={sectionStyle}>Profile</h3>
            <p style={{ fontSize: 11.5, lineHeight: 1.75, color: '#333', margin: 0 }}>{summary}</p>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 220px', gap: 32 }}>
          <div>
            {experience.length > 0 && (
              <div style={{ marginBottom: 22 }}>
                <h3 style={sectionStyle}>Work Experience</h3>
                {experience.map((exp, i) => (
                  <div key={i} style={{ marginBottom: 15, paddingLeft: 12, borderLeft: '3px solid #f59e0b' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <p style={{ fontWeight: 800, fontSize: 12.5, margin: 0, color: '#111' }}>{exp.role}</p>
                      <span style={{ fontSize: 10.5, color: '#666', fontWeight: 600 }}>{exp.duration}</span>
                    </div>
                    <p style={{ fontSize: 11, color: '#555', margin: '2px 0 5px', fontWeight: 600 }}>{exp.company}{exp.location ? ` · ${exp.location}` : ''}</p>
                    <ul style={{ margin: 0, paddingLeft: 14 }}>{(exp.points || []).filter(Boolean).map((pt, j) => <li key={j} style={{ fontSize: 10.5, lineHeight: 1.65, color: '#444', marginBottom: 2 }}>{pt}</li>)}</ul>
                  </div>
                ))}
              </div>
            )}

            {projects.length > 0 && (
              <div>
                <h3 style={sectionStyle}>Projects</h3>
                {projects.map((p, i) => (
                  <div key={i} style={{ marginBottom: 13, paddingLeft: 12, borderLeft: '3px solid #f59e0b' }}>
                    <p style={{ fontWeight: 800, fontSize: 12, margin: '0 0 1px' }}>{p.name} {p.tech && <span style={{ fontWeight: 500, fontSize: 10.5, color: '#666' }}>— {p.tech}</span>}</p>
                    <ul style={{ margin: 0, paddingLeft: 14 }}>{(p.points || []).filter(Boolean).map((pt, j) => <li key={j} style={{ fontSize: 10.5, lineHeight: 1.6, color: '#444', marginBottom: 2 }}>{pt}</li>)}</ul>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            {education.length > 0 && (
              <div style={{ marginBottom: 20 }}>
                <h3 style={sectionStyle}>Education</h3>
                {education.map((edu, i) => (
                  <div key={i} style={{ marginBottom: 12 }}>
                    <p style={{ fontWeight: 800, fontSize: 11.5, margin: 0 }}>{edu.degree}</p>
                    <p style={{ fontSize: 10.5, color: '#555', margin: '2px 0' }}>{edu.institution}</p>
                    <p style={{ fontSize: 10, color: '#888', margin: 0 }}>{edu.year}{edu.gpa ? ` | GPA: ${edu.gpa}` : ''}</p>
                  </div>
                ))}
              </div>
            )}

            {Object.keys(skills).length > 0 && (
              <div style={{ marginBottom: 20 }}>
                <h3 style={sectionStyle}>Skills</h3>
                {Object.entries(skills).map(([cat, items]) => (
                  <div key={cat} style={{ marginBottom: 9 }}>
                    <p style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', color: '#111', margin: '0 0 4px' }}>{cat}</p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                      {(Array.isArray(items) ? items : String(items).split(',').map(s => s.trim())).filter(Boolean).map((s, i) => (
                        <span key={i} style={{ background: '#fef3c7', color: '#92400e', fontSize: 9.5, padding: '2px 7px', borderRadius: 3, fontWeight: 600 }}>{s}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {certifications.length > 0 && (
              <div>
                <h3 style={sectionStyle}>Certifications</h3>
                {certifications.filter(Boolean).map((c, i) => <p key={i} style={{ fontSize: 10.5, color: '#333', margin: '0 0 5px', lineHeight: 1.5 }}>• {c}</p>)}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const sectionStyle = { fontSize: 11, fontWeight: 900, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#111', borderBottom: '2px solid #111', paddingBottom: 4, marginBottom: 12, margin: '0 0 12px' };

export default Template3Executive;
