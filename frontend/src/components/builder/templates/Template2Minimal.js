// Template 2 — Clean Minimal (ATS-friendly, single column)
import React from 'react';

const Template2Minimal = ({ data }) => {
  const { personal = {}, summary = '', experience = [], education = [], skills = {}, certifications = [], projects = [] } = data;
  const accent = '#2563eb';
  return (
    <div id="resume-preview" style={{ fontFamily: "'Georgia', serif", background: '#fff', color: '#111', width: '210mm', minHeight: '297mm', margin: '0 auto', padding: '40px 48px' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', borderBottom: `2px solid ${accent}`, paddingBottom: 18, marginBottom: 22 }}>
        <h1 style={{ margin: '0 0 4px', fontSize: 30, fontWeight: 700, letterSpacing: '-0.5px', color: '#111' }}>{personal.name || 'Your Name'}</h1>
        {personal.title && <p style={{ margin: '0 0 10px', fontSize: 13, color: accent, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{personal.title}</p>}
        <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '16px', fontSize: 11.5, color: '#444' }}>
          {personal.email && <span>{personal.email}</span>}
          {personal.phone && <span>{personal.phone}</span>}
          {personal.location && <span>{personal.location}</span>}
          {personal.linkedin && <span>{personal.linkedin}</span>}
          {personal.github && <span>{personal.github}</span>}
        </div>
      </div>

      {summary && <Section title="Summary" accent={accent}><p style={{ margin: 0, fontSize: 11.5, lineHeight: 1.75, color: '#333' }}>{summary}</p></Section>}

      {experience.length > 0 && (
        <Section title="Experience" accent={accent}>
          {experience.map((exp, i) => (
            <div key={i} style={{ marginBottom: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span style={{ fontWeight: 700, fontSize: 12.5 }}>{exp.role}</span>
                <span style={{ fontSize: 11, color: '#666' }}>{exp.duration}</span>
              </div>
              <p style={{ fontSize: 11.5, color: accent, margin: '1px 0 5px', fontStyle: 'italic' }}>{exp.company}{exp.location ? `, ${exp.location}` : ''}</p>
              <ul style={{ margin: 0, paddingLeft: 18 }}>{(exp.points || []).filter(Boolean).map((pt, j) => <li key={j} style={{ fontSize: 11, lineHeight: 1.7, color: '#333', marginBottom: 2 }}>{pt}</li>)}</ul>
            </div>
          ))}
        </Section>
      )}

      {projects.length > 0 && (
        <Section title="Projects" accent={accent}>
          {projects.map((p, i) => (
            <div key={i} style={{ marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: 700, fontSize: 12 }}>{p.name}</span>
                {p.tech && <span style={{ fontSize: 10.5, color: '#666', fontStyle: 'italic' }}>{p.tech}</span>}
              </div>
              <ul style={{ margin: '3px 0 0', paddingLeft: 18 }}>{(p.points || []).filter(Boolean).map((pt, j) => <li key={j} style={{ fontSize: 11, lineHeight: 1.65, color: '#333', marginBottom: 2 }}>{pt}</li>)}</ul>
            </div>
          ))}
        </Section>
      )}

      {education.length > 0 && (
        <Section title="Education" accent={accent}>
          {education.map((edu, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
              <div>
                <p style={{ fontWeight: 700, fontSize: 12, margin: 0 }}>{edu.degree}</p>
                <p style={{ fontSize: 11, color: '#555', margin: '2px 0', fontStyle: 'italic' }}>{edu.institution}{edu.gpa ? ` | GPA: ${edu.gpa}` : ''}</p>
              </div>
              <span style={{ fontSize: 11, color: '#666', whiteSpace: 'nowrap' }}>{edu.year}</span>
            </div>
          ))}
        </Section>
      )}

      {Object.keys(skills).length > 0 && (
        <Section title="Skills" accent={accent}>
          {Object.entries(skills).map(([cat, items]) => (
            <div key={cat} style={{ display: 'flex', gap: 8, marginBottom: 5, alignItems: 'flex-start' }}>
              <span style={{ fontSize: 11, fontWeight: 700, minWidth: 90, color: '#333' }}>{cat}:</span>
              <span style={{ fontSize: 11, color: '#555', lineHeight: 1.6 }}>{Array.isArray(items) ? items.join(', ') : String(items)}</span>
            </div>
          ))}
        </Section>
      )}

      {certifications.length > 0 && (
        <Section title="Certifications" accent={accent}>
          <ul style={{ margin: 0, paddingLeft: 18 }}>{certifications.filter(Boolean).map((c, i) => <li key={i} style={{ fontSize: 11, lineHeight: 1.7, color: '#333' }}>{c}</li>)}</ul>
        </Section>
      )}
    </div>
  );
};

const Section = ({ title, accent, children }) => (
  <div style={{ marginBottom: 20 }}>
    <h3 style={{ fontSize: 12, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: accent, borderBottom: `1px solid ${accent}`, paddingBottom: 4, marginBottom: 12, margin: '0 0 12px' }}>{title}</h3>
    {children}
  </div>
);

export default Template2Minimal;
