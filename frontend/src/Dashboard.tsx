import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import mailgenLogo from './assets/mailgen-logo.png';

interface UserPayload { name: string; email: string; sub: string; }

interface MailHistoryItem {
  id: string; type: string; tone: string;
  description: string; email: string;
  timestamp: string; timestampMs?: number;
}

interface MailStats {
  totalGenerated: number;
  typeCounts: Record<string, number>;
  lastGeneratedMs: number | null;
  lastGeneratedType: string | null;
}

const DEFAULT_STATS: MailStats = { totalGenerated: 0, typeCounts: {}, lastGeneratedMs: null, lastGeneratedType: null };

// ── Mail type chip list (no emojis) ──────────────────────────────────────────
const MAIL_TYPES = [
  { value: 'Leave Request',          label: 'Leave Request'  },
  { value: 'Internship Application', label: 'Internship'     },
  { value: 'Complaint Letter',       label: 'Complaint'      },
  { value: 'Apology Mail',           label: 'Apology'        },
  { value: 'Follow-up Mail',         label: 'Follow-up'      },
  { value: 'Offer Acceptance',       label: 'Offer Accept'   },
];

// ── Field definitions ─────────────────────────────────────────────────────────
interface FieldDef {
  key: string; label: string; placeholder: string;
  type: 'text' | 'textarea'; required?: boolean; fullWidth?: boolean;
}

const MAIL_TYPE_FIELDS: Record<string, FieldDef[]> = {
  'Leave Request': [
    { key: 'sender_role', label: 'Your role',        placeholder: 'Student, Employee…',            type: 'text'     },
    { key: 'duration',    label: 'Duration',          placeholder: '3 days, 1 week…',               type: 'text',     required: true },
    { key: 'reason',      label: 'Reason for leave',  placeholder: 'Fever, family emergency…',      type: 'text',     required: true },
    { key: 'leave_date',  label: 'Leave dates',       placeholder: 'June 15–17, 2025',              type: 'text'     },
    { key: 'additional_context', label: 'Additional context', placeholder: 'Work handover done, attendance consideration needed…', type: 'textarea', fullWidth: true },
  ],
  'Internship Application': [
    { key: 'company_name',        label: 'Company / Organisation', placeholder: 'Google, XYZ Startup…',              type: 'text', required: true },
    { key: 'role_applied',        label: 'Role applied for',       placeholder: 'Software Engineering Intern…',       type: 'text', required: true },
    { key: 'academic_background', label: 'Academic background',    placeholder: '3rd year B.Tech CSE, CGPA 8.5…',    type: 'text', required: true },
    { key: 'skills',              label: 'Skills & technologies',  placeholder: 'React, Python, ML…',                type: 'text' },
    { key: 'why_this_internship', label: 'Why this internship?',   placeholder: 'Passionate about AI…',              type: 'textarea', fullWidth: true },
    { key: 'additional_context',  label: 'Additional context',     placeholder: 'Available from July, full-time…',   type: 'textarea', fullWidth: true },
  ],
  'Complaint Letter': [
    { key: 'sender_role',    label: 'Your role',                    placeholder: 'Customer, Student…',               type: 'text' },
    { key: 'incident_date',  label: 'Date of incident',             placeholder: 'June 10, 2025',                    type: 'text' },
    { key: 'issue',          label: 'Issue / problem',              placeholder: 'Defective product, poor service…', type: 'text',     required: true, fullWidth: true },
    { key: 'previous_action',label: 'Previous resolution attempts', placeholder: 'Called support, raised ticket…',   type: 'textarea', fullWidth: true },
    { key: 'additional_context', label: 'Impact / additional details', placeholder: 'Financial loss, missed deadlines…', type: 'textarea', fullWidth: true },
  ],
  'Apology Mail': [
    { key: 'sender_role',       label: 'Your role',                       placeholder: 'Student, Employee…',            type: 'text' },
    { key: 'apology_for',       label: 'What are you apologising for?',    placeholder: 'Missing deadline, wrong doc…',  type: 'text',     required: true, fullWidth: true },
    { key: 'corrective_action', label: 'Corrective action being taken',   placeholder: 'Submitting work immediately…',  type: 'textarea', fullWidth: true },
    { key: 'additional_context',label: 'Additional context',              placeholder: 'Brief explanation…',            type: 'textarea', fullWidth: true },
  ],
  'Follow-up Mail': [
    { key: 'previous_communication', label: 'Topic of previous communication', placeholder: 'Job application on June 5…', type: 'text',     required: true, fullWidth: true },
    { key: 'follow_up_ask',          label: 'What update do you need?',         placeholder: 'Status of application…',    type: 'textarea', required: true, fullWidth: true },
    { key: 'additional_context',     label: 'Additional context',               placeholder: 'Deadline approaching…',     type: 'textarea', fullWidth: true },
  ],
  'Offer Acceptance': [
    { key: 'offer_role',   label: 'Role / programme being accepted', placeholder: 'Software Engineer, MBA…', type: 'text', required: true },
    { key: 'joining_date', label: 'Confirmed joining date',          placeholder: 'July 1, 2025',            type: 'text' },
    { key: 'additional_context', label: 'Additional context',        placeholder: 'Excited to join…',        type: 'textarea', fullWidth: true },
  ],
};

function getBadgeLabel(type: string): string {
  const m: Record<string, string> = {
    'Leave Request': 'Leave', 'Internship Application': 'Internship',
    'Complaint Letter': 'Complaint', 'Apology Mail': 'Apology',
    'Follow-up Mail': 'Follow-up', 'Offer Acceptance': 'Acceptance',
  };
  return m[type] || 'General';
}

function getDotClass(type: string): string {
  const m: Record<string, string> = {
    'Leave Request': 'dot-purple', 'Internship Application': 'dot-green',
    'Complaint Letter': 'dot-amber', 'Apology Mail': 'dot-blue',
    'Follow-up Mail': 'dot-teal', 'Offer Acceptance': 'dot-green',
  };
  return m[type] || 'dot-purple';
}

// ── NavSquare icon component ──────────────────────────────────────────────────
function NavSq() { return <span className="nav-sq" aria-hidden="true" />; }

// ─────────────────────────────────────────────────────────────────────────────
export default function Dashboard() {
  const navigate = useNavigate();

  const [currentUser, setCurrentUser]     = useState<UserPayload | null>(null);
  const [token, setToken]                 = useState<string | null>(null);
  const [loading, setLoading]             = useState(false);
  const [error, setError]                 = useState<string | null>(null);

  const [mailType, setMailType]           = useState('Leave Request');
  const [tone, setTone]                   = useState('Formal');
  const [recipientName, setRecipientName] = useState('');
  const [fieldValues, setFieldValues]     = useState<Record<string, string>>({});
  const [generatedMail, setGeneratedMail] = useState<string | null>(null);
  const [mailHistory, setMailHistory]     = useState<MailHistoryItem[]>([]);
  const [copyStatus, setCopyStatus]       = useState<string | null>(null);
  const [mailStats, setMailStats]         = useState<MailStats>(DEFAULT_STATS);
  const [showGmailModal, setShowGmailModal] = useState(false);
  const [sessionCount, setSessionCount]   = useState(0);

  const [activeMailId, setActiveMailId]   = useState<string | null>(null);
  const [isEditing, setIsEditing]         = useState(false);
  const [editContent, setEditContent]     = useState('');

  // Word limit
  const [wordLimitPreset, setWordLimitPreset] = useState<'short'|'medium'|'long'|'custom'>('medium');
  const [customWordLimit, setCustomWordLimit]  = useState('');

  const resolveWordLimit = (): string => {
    if (wordLimitPreset === 'short')  return '100';
    if (wordLimitPreset === 'medium') return '200';
    if (wordLimitPreset === 'long')   return '350';
    const n = parseInt(customWordLimit, 10);
    return (!isNaN(n) && n > 0) ? String(n) : '200';
  };

  useEffect(() => { setFieldValues({}); }, [mailType]);

  const parseEmailParts = (email: string) => {
    const lines = email.split('\n');
    if (lines[0]?.toLowerCase().startsWith('subject:')) {
      const subject = lines[0].replace(/^subject:\s*/i, '').trim();
      const idx = lines[1]?.trim() === '' ? 2 : 1;
      return { subject, body: lines.slice(idx).join('\n').trim() };
    }
    return { subject: '', body: email };
  };

  const getWordCount = (text: string | null): number => {
    if (!text) return 0;
    const { body } = parseEmailParts(text);
    return body.trim().split(/\s+/).filter(Boolean).length;
  };

  const getWordCountColorClass = (text: string | null): string => {
    const count = getWordCount(text);
    const target = parseInt(resolveWordLimit(), 10) || 200;
    return count === target ? 'word-count-perfect' : '';
  };

  const handleOpenGmail = () => {
    if (!generatedMail) return;
    const { subject, body } = parseEmailParts(generatedMail);
    window.open(`https://mail.google.com/mail/?view=cm&fs=1&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`, '_blank');
    setShowGmailModal(false);
  };

  const decodeToken = (jwt: string): UserPayload => {
    const b64 = jwt.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(decodeURIComponent(window.atob(b64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join('')));
  };

  useEffect(() => {
    const savedToken = localStorage.getItem('access_token');
    if (!savedToken) { navigate('/login'); return; }
    setToken(savedToken);
    try { setCurrentUser(decodeToken(savedToken)); }
    catch { localStorage.removeItem('access_token'); navigate('/login'); }
    try { const h = localStorage.getItem('mail_history'); if (h) setMailHistory(JSON.parse(h)); } catch {}
    try { const s = localStorage.getItem('mail_stats');   if (s) setMailStats({ ...DEFAULT_STATS, ...JSON.parse(s) }); } catch {}
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // run once on mount — navigate is stable but listing it can cause loops

  const handleLogout = () => { localStorage.removeItem('access_token'); navigate('/'); };

  const getGreeting = () => {
    const h = new Date().getHours();
    return h < 12 ? 'Good Morning' : h < 17 ? 'Good Afternoon' : 'Good Evening';
  };

  const getFormattedDate = () =>
    new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  const buildDescriptionSummary = () => {
    const parts = (MAIL_TYPE_FIELDS[mailType] || []).map(f => fieldValues[f.key]).filter(Boolean);
    return parts.slice(0, 2).join(' • ') || mailType;
  };

  const validateForm = (): boolean => {
    for (const f of (MAIL_TYPE_FIELDS[mailType] || []).filter(f => f.required)) {
      if (!fieldValues[f.key]?.trim()) { alert(`Please fill in: ${f.label}`); return false; }
    }
    if (!Object.values(fieldValues).some(v => v.trim())) {
      alert('Please fill in at least one field.'); return false;
    }
    return true;
  };

  const handleGenerateMail = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!validateForm()) return;
    setLoading(true); setError(null);
    const activeToken = token || localStorage.getItem('access_token');
    try {
      const payload = { type: mailType, tone, recipient: recipientName.trim() || 'Concerned Authority', word_limit: resolveWordLimit(), ...fieldValues };
      const res = await fetch('http://localhost:3000/mail/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${activeToken}` },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to generate mail.');
      const mailId = Math.random().toString(36).slice(2, 9);
      setGeneratedMail(data.email);
      setActiveMailId(mailId);
      setIsEditing(false);
      setSessionCount(c => c + 1);
      const item: MailHistoryItem = {
        id: mailId, type: mailType, tone,
        description: buildDescriptionSummary(), email: data.email,
        timestamp: new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
        timestampMs: Date.now(),
      };
      setMailHistory(prev => { const u = [item, ...prev].slice(0, 5); localStorage.setItem('mail_history', JSON.stringify(u)); return u; });
      setMailStats(prev => {
        const u = { totalGenerated: prev.totalGenerated + 1, typeCounts: { ...prev.typeCounts, [mailType]: (prev.typeCounts[mailType] || 0) + 1 }, lastGeneratedMs: Date.now(), lastGeneratedType: mailType };
        localStorage.setItem('mail_stats', JSON.stringify(u)); return u;
      });
      // Scroll output into view inside the db-main scrollable area
      setTimeout(() => {
        const mainEl = document.querySelector('.db-main');
        const outEl  = document.querySelector('.output-card');
        if (mainEl && outEl) {
          mainEl.scrollTo({ top: mainEl.scrollHeight, behavior: 'smooth' });
        }
      }, 120);
    } catch (err: any) {
      // Show the error inline — never auto-redirect or wipe the token on API errors.
      // Only redirect if the token is genuinely missing (handled in useEffect above).
      const msg = err.message || 'Something went wrong. Please try again.';
      setError(msg);
    } finally { setLoading(false); }
  };

  const handleCopy = (text: string, id?: string) => {
    navigator.clipboard.writeText(text);
    setCopyStatus(id || 'main');
    setTimeout(() => setCopyStatus(null), 2000);
  };

  const handleDelete = (id: string) => {
    setMailHistory(prev => { const u = prev.filter(i => i.id !== id); localStorage.setItem('mail_history', JSON.stringify(u)); return u; });
  };

  const handleStartEdit = () => {
    if (!generatedMail) return;
    setEditContent(generatedMail);
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  const handleSaveEdit = () => {
    if (!generatedMail) return;
    setGeneratedMail(editContent);
    setIsEditing(false);
    if (activeMailId) {
      setMailHistory(prev => {
        const u = prev.map(item => {
          if (item.id === activeMailId) {
            return { ...item, email: editContent };
          }
          return item;
        });
        localStorage.setItem('mail_history', JSON.stringify(u));
        return u;
      });
    }
  };

  const getMostUsed = () => {
    const entries = Object.entries(mailStats.typeCounts);
    if (!entries.length) return { type: 'None', count: 0 };
    const [maxType, maxCount] = entries.reduce((a, b) => b[1] > a[1] ? b : a);
    const map: Record<string, string> = { 'Leave Request': 'Leave', 'Internship Application': 'Internship', 'Complaint Letter': 'Complaint', 'Apology Mail': 'Apology', 'Follow-up Mail': 'Follow-up', 'Offer Acceptance': 'Acceptance' };
    return { type: map[maxType] || maxType.split(' ')[0], count: maxCount };
  };

  const getLastTime = () => {
    if (!mailStats.lastGeneratedMs) return { time: 'Never', sub: 'No activity' };
    const diff = Date.now() - mailStats.lastGeneratedMs;
    const m = Math.floor(diff / 60000);
    let t = 'Just now';
    if (m >= 1) { t = m < 60 ? `${m}m ago` : (h => h < 24 ? `${h}h ago` : `${Math.floor(h/24)}d ago`)(Math.floor(m/60)); }
    return { time: t, sub: mailStats.lastGeneratedType ? getBadgeLabel(mailStats.lastGeneratedType) : 'No activity' };
  };

  const getItemTime = (item: MailHistoryItem) => {
    if (!item.timestampMs) return item.timestamp;
    const m = Math.floor((Date.now() - item.timestampMs) / 60000);
    if (m < 1) return 'Just now';
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    return h < 24 ? `${h}h ago` : item.timestamp;
  };

  const currentFields = MAIL_TYPE_FIELDS[mailType] || [];
  const SESSION_MAX = 10;
  const sessionBarPct = Math.min((sessionCount / SESSION_MAX) * 100, 100);
  const initials = currentUser?.name ? currentUser.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'AA';

  return (
    <div className="db-layout">

      {/* ════════════════ SIDEBAR ════════════════ */}
      <aside className="db-sidebar">
        <div className="db-sidebar-inner">

          {/* Brand */}
          <div className="db-brand">
            <div className="db-brand-icon">
              <img src={mailgenLogo} alt="" className="db-brand-logo" />
            </div>
            <span className="db-brand-name">MailGen</span>
          </div>

          {/* User block */}
          <div className="db-user-block">
            <div className="db-avatar">{initials}</div>
            <div className="db-user-info">
              <span className="db-user-name">{currentUser?.name || 'User'}</span>
              <span className="db-user-role">Student</span>
            </div>
          </div>

          {/* Nav */}
          <nav className="db-nav">
            <button className="db-nav-item db-nav-item--active" id="nav-dashboard">
              <NavSq /><span>Dashboard</span>
            </button>
            <button className="db-nav-item" id="nav-history" onClick={() => alert('Mail History coming soon!')}>
              <NavSq /><span>Mail History</span>
            </button>
            <button className="db-nav-item" id="nav-settings" onClick={() => alert('Settings coming soon!')}>
              <NavSq /><span>Settings</span>
            </button>
          </nav>
        </div>

        {/* Logout */}
        <button className="db-logout" id="nav-logout" onClick={handleLogout}>
          <NavSq /><span>Logout</span>
        </button>
      </aside>

      {/* ════════════════ MAIN ════════════════ */}
      <main className="db-main">

        {/* Header */}
        <header className="db-header">
          <div className="db-header-left">
            <h1 className="db-greeting">{getGreeting()}, {currentUser?.name?.split(' ')[0] || 'User'} 👋</h1>
            <p className="db-subtitle">My Mail Studio — generate professional mails instantly</p>
            <div className="db-session-bar-wrap">
              <div className="db-session-track">
                <div className="db-session-fill" style={{ width: `${sessionBarPct}%` }} />
              </div>
              <span className="db-session-label">
                {sessionCount === 0 ? 'No mails generated this session' : `${sessionCount} mail${sessionCount > 1 ? 's' : ''} generated this session`}
              </span>
            </div>
          </div>
          <div className="db-date-badge">{getFormattedDate()}</div>
        </header>

        {/* Stat cards */}
        <div className="db-stat-grid">
          {/* Card 1 */}
          <div className="db-stat-card">
            <div className="db-stat-icon db-stat-icon--purple"><span className="db-stat-sq" /></div>
            <div className="db-stat-num">{mailStats.totalGenerated}</div>
            <div className="db-stat-label">Total mails generated</div>
            <div className="db-stat-sub db-stat-sub--purple">+{mailHistory.length} this session</div>
          </div>
          {/* Card 2 */}
          <div className="db-stat-card">
            <div className="db-stat-icon db-stat-icon--green"><span className="db-stat-sq" /></div>
            <div className="db-stat-num">{getMostUsed().type}</div>
            <div className="db-stat-label">Most used mail type</div>
            <div className="db-stat-sub db-stat-sub--green">{getMostUsed().count} times used</div>
          </div>
          {/* Card 3 */}
          <div className="db-stat-card">
            <div className="db-stat-icon db-stat-icon--amber"><span className="db-stat-sq" /></div>
            <div className="db-stat-num">{getLastTime().time}</div>
            <div className="db-stat-label">Last mail generated</div>
            <div className="db-stat-sub db-stat-sub--amber" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{getLastTime().sub}</div>
          </div>
        </div>

        {/* Form card */}
        <div className="db-form-card">
          <div className="db-form-section-title">What do you need to write today?</div>

          {error && <div className="db-error">{error}</div>}

          <form onSubmit={handleGenerateMail} className="db-form">

            {/* TO field */}
            <div className="db-to-row">
              <span className="db-to-badge">TO</span>
              <input
                id="recipient-name"
                type="text"
                className="db-to-input"
                placeholder="Recipient's name or title — e.g. Dr. Smith, HR Team, Hiring Manager"
                value={recipientName}
                onChange={e => setRecipientName(e.target.value)}
                disabled={loading}
                autoComplete="off"
              />
            </div>

            {/* Mail type chips */}
            <div className="db-field-group">
              <label className="db-field-label">Mail type</label>
              <div className="db-chips-row">
                {MAIL_TYPES.map(mt => (
                  <button key={mt.value} type="button"
                    className={`db-chip${mailType === mt.value ? ' db-chip--active' : ''}`}
                    onClick={() => setMailType(mt.value)} disabled={loading}>
                    {mt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Tone + Word limit side by side */}
            <div className="db-two-col-controls">
              <div className="db-field-group">
                <label className="db-field-label">Tone</label>
                <div className="db-chips-row">
                  {['Formal', 'Semi-Formal', 'Urgent'].map(t => (
                    <button key={t} type="button"
                      className={`db-chip db-chip--sm${tone === t ? ' db-chip--active' : ''}`}
                      onClick={() => setTone(t)} disabled={loading}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>
              <div className="db-field-group">
                <label className="db-field-label">Word limit</label>
                <div className="db-chips-row" style={{ flexWrap: 'wrap' }}>
                  {(['short', 'medium', 'long', 'custom'] as const).map(p => (
                    <button key={p} type="button"
                      className={`db-chip db-chip--sm${wordLimitPreset === p ? ' db-chip--active' : ''}`}
                      onClick={() => setWordLimitPreset(p)} disabled={loading}>
                      {p === 'short' ? '~100' : p === 'medium' ? '~200' : p === 'long' ? '~350' : 'Custom'}
                    </button>
                  ))}
                  {wordLimitPreset === 'custom' && (
                    <div className="db-custom-words-wrap">
                      <input id="custom-word-limit" type="number" className="db-custom-words-input"
                        placeholder="250" min={50} max={1000}
                        value={customWordLimit} onChange={e => setCustomWordLimit(e.target.value)}
                        disabled={loading} />
                      <span className="db-custom-words-unit">words</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Dynamic fields */}
            <div className="db-fields-section-label">Details — {mailType}</div>
            <div className="db-fields-grid">
              {currentFields.map(field => {
                const isFullWidth = field.type === 'textarea' || field.fullWidth;
                return (
                  <div key={field.key} className={`db-field-wrap${isFullWidth ? ' db-field-wrap--full' : ''}`}>
                    <label className="db-input-label" htmlFor={`f-${field.key}`}>
                      {field.label}{field.required && <span className="db-req"> *</span>}
                    </label>
                    {field.type === 'textarea' ? (
                      <textarea id={`f-${field.key}`} className="db-textarea"
                        placeholder={field.placeholder}
                        value={fieldValues[field.key] || ''}
                        onChange={e => setFieldValues(p => ({ ...p, [field.key]: e.target.value }))}
                        disabled={loading} />
                    ) : (
                      <input id={`f-${field.key}`} type="text" className="db-input"
                        placeholder={field.placeholder}
                        value={fieldValues[field.key] || ''}
                        onChange={e => setFieldValues(p => ({ ...p, [field.key]: e.target.value }))}
                        disabled={loading} />
                    )}
                  </div>
                );
              })}

              {/* Generate button — full width inside grid */}
              <button type="submit" className="db-cta" disabled={loading} id="btn-generate">
                {loading
                  ? <><div className="db-spinner" /> Generating…</>
                  : <><span className="db-cta-icon">◻</span> Generate Email</>
                }
              </button>
            </div>
          </form>

          {/* Generated output */}
          {generatedMail && (
            <div className="output-card">
              <div className="output-card-header">
                <div className="output-card-title">
                  <span>Generated output</span>
                  <span className="output-tone-badge">{tone}</span>
                  <span className={`output-word-count-badge ${getWordCountColorClass(isEditing ? editContent : generatedMail)}`}>
                    {getWordCount(isEditing ? editContent : generatedMail)} / {resolveWordLimit()} words
                  </span>
                </div>
                <div className="output-actions">
                  {isEditing ? (
                    <>
                      <button type="button" className="output-action-btn output-save-btn"
                        onClick={handleSaveEdit}>
                        Save
                      </button>
                      <button type="button" className="output-action-btn"
                        onClick={handleCancelEdit}>
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <button type="button" className="output-action-btn"
                        onClick={handleStartEdit}>
                        Edit
                      </button>
                      <button type="button" className="output-action-btn"
                        onClick={() => handleCopy(generatedMail, 'main')}>
                        {copyStatus === 'main' ? 'Copied!' : 'Copy'}
                      </button>
                      <button type="button" className="output-action-btn"
                        onClick={() => handleGenerateMail()} disabled={loading}>
                        Retry
                      </button>
                      <button type="button" className="output-action-btn output-gmail-btn"
                        onClick={() => setShowGmailModal(true)}>
                        Send via Gmail
                      </button>
                    </>
                  )}
                </div>
              </div>
              {isEditing ? (
                <textarea
                  className="output-body-textarea"
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  rows={Math.max(10, editContent.split('\n').length + 2)}
                />
              ) : (
                <pre className="output-body">{generatedMail}</pre>
              )}
            </div>
          )}
        </div>

        {/* Recent mails */}
        <section className="db-recent">
          <div className="db-recent-title">Recent Mails</div>
          <div className="db-recent-list">
            {mailHistory.length === 0 ? (
              <div className="db-recent-empty">No mails generated yet. Fill in the details above to get started.</div>
            ) : (
              mailHistory.map(item => (
                <div key={item.id} className="db-recent-row"
                  onClick={() => {
                    setMailType(item.type);
                    setTone(item.tone);
                    setGeneratedMail(item.email);
                    setActiveMailId(item.id);
                    setIsEditing(false);
                  }}>
                  <div className="db-recent-left">
                    <span className={`db-dot ${getDotClass(item.type)}`} />
                    <div className="db-recent-text">
                      <span className="db-recent-type">{getBadgeLabel(item.type)}</span>
                      <span className="db-recent-snippet">{item.description}</span>
                    </div>
                  </div>
                  <div className="db-recent-right">
                    <span className="db-recent-time">{getItemTime(item)}</span>
                    <div className="db-recent-actions" onClick={e => e.stopPropagation()}>
                      <button type="button" className="db-recent-btn"
                        onClick={() => handleCopy(item.email, item.id)}>
                        {copyStatus === item.id ? 'Copied!' : 'Copy'}
                      </button>
                      <button type="button" className="db-recent-btn db-recent-btn--del"
                        onClick={() => handleDelete(item.id)}>
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

      </main>

      {/* Gmail modal */}
      {showGmailModal && (
        <div className="gmail-modal-overlay" onClick={() => setShowGmailModal(false)}>
          <div className="gmail-modal" onClick={e => e.stopPropagation()}>
            <div className="gmail-modal-icon">✉️</div>
            <h3>Open in Gmail?</h3>
            <p>Your email is ready. Would you like to open Gmail to review and send it?</p>
            <div className="gmail-modal-preview">
              <span className="gmail-preview-label">Subject:</span>
              <span className="gmail-preview-value">{generatedMail ? parseEmailParts(generatedMail).subject : ''}</span>
            </div>
            <div className="gmail-modal-actions">
              <button type="button" className="btn-gmail-cancel" onClick={() => setShowGmailModal(false)}>Stay in MailGen</button>
              <button type="button" className="btn-gmail-confirm" onClick={handleOpenGmail}>Open Gmail</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
