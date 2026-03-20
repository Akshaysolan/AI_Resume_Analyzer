// Template 5 — Elegant Purple (full-width header, timeline)
import React from 'react';

const Template5Elegant = ({ data }) => {
  const { personal = {}, summary = '', experience = [], education = [], skills = {}, certifications = [], projects = [] } = data;
  return (
    <div id="resume-preview" style={{ fontFamily: "'Palatino Linotype','Book Antiqua',Palatino,serif", background: '#faf9ff', color: '#1e1b4b', width: '210mm', minHeight: '297mm', margin: '0 auto', padding: 0 }}>
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg,#4c1d95,#6d28d9,#7c3aed)', padding: '40px 44px 30px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -40, right: -40, width: 180, height: 180, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
        <div style={{ position: 'absolute', bottom: -20, right: 80, width: 100, height: 100, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
        <h1 style={{ margin: 0, fontSize: 34, fontWeight: 400, color: '#fff', letterSpacing: '0.02em', fontStyle: 'italic' }}>{personal.name || 'Your Name'}</h1>
        {personal.title && <p style={{ margin: '6px 0 18px', fontSize: 13, color: '#ddd6fe', fontWeight: 400, letterSpacing: '0.15em', textTransform: 'uppercase' }}>{personal.title}</p>}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '18px', fontSize: 11.5, color: 'rgba(255,255,255,0.8)' }}>
          {personal.email && <span>✉ {personal.email}</span>}
          {personal.phone && <span>📞 {personal.phone}</span>}
          {personal.location && <span>📍 {personal.location}</span>}
          {personal.linkedin && <span>in {personal.linkedin}</span>}
          {personal.github && <span>⌨ {personal.github}</span>}
        </div>
      </div>

      <div style={{ padding: '28px 44px' }}>
        {summary && (
          <div style={{ marginBottom: 22, background: '#ede9fe', borderRadius: 8, padding: '14px 18px', borderLeft: '4px solid #7c3aed' }}>
            <p style={{ fontSize: 11.5, lineHeight: 1.8, color: '#3b0764', margin: 0, fontStyle: 'italic' }}>{summary}</p>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 190px', gap: 28 }}>
          <div>
            {experience.length > 0 && (
              <div style={{ marginBottom: 22 }}>
                <h3 style={head}>Experience</h3>
                {experience.map((exp, i) => (
                  <div key={i} style={{ marginBottom: 16, display: 'flex', gap: 12 }}>
                    <div style={{ flexShrink: 0, paddingTop: 3 }}>
                      <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#7c3aed', border: '2px solid #ede9fe' }} />
                      {i < experience.length - 1 && <div style={{ width: 2, background: '#ede9fe', margin: '3px auto', height: 'calc(100% + 8px)', minHeight: 30 }} />}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <p style={{ fontWeight: 700, fontSize: 12.5, margin: 0, color: '#1e1b4b' }}>{exp.role}</p>
                        <span style={{ fontSize: 10, color: '#7c3aed', fontWeight: 600, background: '#ede9fe', padding: '2px 8px', borderRadius: 10, whiteSpace: 'nowrap' }}>{exp.duration}</span>
                      </div>
                      <p style={{ fontSize: 11, color: '#6d28d9', margin: '1px 0 5px', fontStyle: 'italic' }}>{exp.company}{exp.location ? `, ${exp.location}` : ''}</p>
                      <ul style={{ margin: 0, paddingLeft: 14 }}>{(exp.points || []).filter(Boolean).map((pt, j) => <li key={j} style={{ fontSize: 10.5, lineHeight: 1.7, color: '#374151', marginBottom: 2 }}>{pt}</li>)}</ul>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {projects.length > 0 && (
              <div>
                <h3 style={head}>Projects</h3>
                {projects.map((p, i) => (
                  <div key={i} style={{ marginBottom: 13, paddingLeft: 14, borderLeft: '3px solid #ddd6fe' }}>
                    <p style={{ fontWeight: 700, fontSize: 12, margin: '0 0 2px', color: '#4c1d95' }}>{p.name} {p.tech && <span style={{ fontWeight: 400, fontSize: 10, color: '#6d28d9' }}>| {p.tech}</span>}</p>
                    <ul style={{ margin: 0, paddingLeft: 14 }}>{(p.points || []).filter(Boolean).map((pt, j) => <li key={j} style={{ fontSize: 10.5, lineHeight: 1.65, color: '#374151', marginBottom: 2 }}>{pt}</li>)}</ul>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            {education.length > 0 && (
              <div style={{ marginBottom: 20 }}>
                <h3 style={head}>Education</h3>
                {education.map((edu, i) => (
                  <div key={i} style={{ marginBottom: 12, padding: '10px 12px', background: '#ede9fe', borderRadius: 6 }}>
                    <p style={{ fontWeight: 700, fontSize: 11.5, margin: 0, color: '#1e1b4b' }}>{edu.degree}</p>
                    <p style={{ fontSize: 10.5, color: '#6d28d9', margin: '2px 0', fontStyle: 'italic' }}>{edu.institution}</p>
                    <p style={{ fontSize: 10, color: '#888', margin: 0 }}>{edu.year}{edu.gpa ? ` · GPA ${edu.gpa}` : ''}</p>
                  </div>
                ))}
              </div>
            )}

            {Object.keys(skills).length > 0 && (
              <div style={{ marginBottom: 20 }}>
                <h3 style={head}>Skills</h3>
                {Object.entries(skills).map(([cat, items]) => (
                  <div key={cat} style={{ marginBottom: 10 }}>
                    <p style={{ fontSize: 9.5, fontWeight: 700, color: '#6d28d9', margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{cat}</p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                      {(Array.isArray(items) ? items : String(items).split(',').map(s => s.trim())).filter(Boolean).map((s, i) => (
                        <span key={i} style={{ background: '#ddd6fe', color: '#4c1d95', fontSize: 9.5, padding: '2px 7px', borderRadius: 3, fontWeight: 600 }}>{s}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {certifications.length > 0 && (
              <div>
                <h3 style={head}>Certifications</h3>
                {certifications.filter(Boolean).map((c, i) => <p key={i} style={{ fontSize: 10.5, color: '#374151', margin: '0 0 5px', paddingLeft: 8, borderLeft: '2px solid #7c3aed', lineHeight: 1.5 }}>{c}</p>)}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const head = { fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#7c3aed', borderBottom: '2px solid #ddd6fe', paddingBottom: 5, marginBottom: 14, margin: '0 0 14px' };

export default Template5Elegant;
