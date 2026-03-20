import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, X, Briefcase, Loader2, Sparkles } from 'lucide-react';
import './UploadSection.css';

const UploadSection = ({ onAnalyze, isLoading }) => {
  const [file, setFile]           = useState(null);
  const [jobDesc, setJobDesc]     = useState('');
  const [showJobDesc, setShowJobDesc] = useState(false);
  const [error, setError]         = useState('');

  const onDrop = useCallback((accepted, rejected) => {
    setError('');
    if (rejected.length) {
      setError('File rejected. Use PDF, DOCX, or TXT under 10MB.');
      return;
    }
    if (accepted.length) setFile(accepted[0]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt'],
    },
    maxSize: 10 * 1024 * 1024,
    multiple: false,
    disabled: isLoading,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!file) { setError('Please select a resume file.'); return; }
    onAnalyze(file, jobDesc);
  };

  const removeFile = (e) => {
    e.stopPropagation();
    setFile(null);
    setError('');
  };

  const formatSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  };

  return (
    <section className="upload-section">
      <div className="container">
        {/* Hero text */}
        <div className="upload-hero">
          <div className="hero-badge">
            <Sparkles size={14} />
            AI-Powered Analysis
          </div>
          <h1 className="hero-title">
            Get Your Resume<br />
            <span className="hero-accent">Expert-Reviewed</span> in Seconds
          </h1>
          <p className="hero-sub">
            Upload your resume and our AI will score it, identify gaps, match it to job descriptions,
            and give you a concrete action plan — instantly.
          </p>
        </div>

        {/* Upload card */}
        <div className="upload-card glass-card">
          <form onSubmit={handleSubmit}>
            {/* Drop zone */}
            <div
              {...getRootProps()}
              className={`dropzone ${isDragActive ? 'drag-active' : ''} ${file ? 'has-file' : ''} ${isLoading ? 'disabled' : ''}`}
            >
              <input {...getInputProps()} />

              {file ? (
                <div className="file-preview">
                  <div className="file-icon-wrap">
                    <FileText size={28} />
                  </div>
                  <div className="file-meta">
                    <span className="file-name">{file.name}</span>
                    <span className="file-size">{formatSize(file.size)}</span>
                  </div>
                  <button type="button" className="file-remove" onClick={removeFile} title="Remove file">
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <div className="dropzone-content">
                  <div className="dropzone-icon">
                    <Upload size={32} />
                  </div>
                  <p className="dropzone-title">
                    {isDragActive ? 'Drop your resume here' : 'Drag & drop your resume'}
                  </p>
                  <p className="dropzone-sub">or <span className="dropzone-link">browse files</span></p>
                  <p className="dropzone-hint">PDF, DOCX, or TXT · Max 10 MB</p>
                </div>
              )}
            </div>

            {/* Error */}
            {error && (
              <div className="upload-error">
                <X size={14} /> {error}
              </div>
            )}

            {/* Job description toggle */}
            <div className="jd-section">
              <button
                type="button"
                className={`jd-toggle ${showJobDesc ? 'open' : ''}`}
                onClick={() => setShowJobDesc(v => !v)}
              >
                <Briefcase size={15} />
                {showJobDesc ? 'Hide' : 'Add'} Job Description
                <span className="jd-badge">+10% accuracy</span>
              </button>

              {showJobDesc && (
                <div className="jd-input-wrap">
                  <textarea
                    className="jd-textarea"
                    value={jobDesc}
                    onChange={e => setJobDesc(e.target.value)}
                    placeholder="Paste the job description here to get a tailored match score and targeted keyword suggestions..."
                    rows={5}
                    disabled={isLoading}
                  />
                  <span className="jd-char-count">{jobDesc.length} chars</span>
                </div>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="btn btn-primary analyze-btn"
              disabled={!file || isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 size={18} className="spin" />
                  Analyzing Resume...
                </>
              ) : (
                <>
                  <Sparkles size={18} />
                  Analyze My Resume
                </>
              )}
            </button>
          </form>
        </div>

        {/* Stats row */}
        <div className="upload-stats">
          {[
            { value: '98%', label: 'Accuracy Rate' },
            { value: '<30s', label: 'Analysis Time' },
            { value: '15+', label: 'Data Points' },
            { value: 'ATS', label: 'Optimized Score' },
          ].map(s => (
            <div key={s.label} className="stat-item">
              <span className="stat-value">{s.value}</span>
              <span className="stat-label">{s.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default UploadSection;
