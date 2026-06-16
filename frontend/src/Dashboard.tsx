import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import mailgenLogo from './assets/mailgen-logo.png';
import {
  MAIL_TYPES,
  getBadgeLabel,
  getFieldsForType,
  getFieldGroupsForType,
  MAIL_TYPE_CONFIG_MAP,
} from './config/mailTypes';

interface MailHistoryItem {
  id: string;
  type: string;
  tone: string;
  description: string;
  email: string;
  timestamp: string;
  timestampMs?: number;
}

interface MailStats {
  totalGenerated: number;
  typeCounts: Record<string, number>;
  lastGeneratedMs: number | null;
  lastGeneratedType: string | null;
}

const DEFAULT_STATS: MailStats = { 
  totalGenerated: 0, 
  typeCounts: {}, 
  lastGeneratedMs: null, 
  lastGeneratedType: null 
};

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, token, logout } = useAuth();

  // Navigation tabs: 'generator', 'history', 'profile', 'settings'
  const [activeTab, setActiveTab] = useState<'generator' | 'history' | 'profile' | 'settings'>('generator');

  // Generator states
  const [mailType, setMailType]           = useState('Leave Request');
  const [tone, setTone]                   = useState('Formal');
  const [recipientName, setRecipientName] = useState('');
  const [fieldValues, setFieldValues]     = useState<Record<string, string>>({});
  const [generatedMail, setGeneratedMail] = useState<string | null>(null);
  const [copyStatus, setCopyStatus]       = useState<string | null>(null);
  const [loading, setLoading]             = useState(false);
  const [error, setError]                 = useState<string | null>(null);
  const [sessionCount, setSessionCount]   = useState(0);

  // History & stats states
  const [mailHistory, setMailHistory]     = useState<MailHistoryItem[]>([]);
  const [mailStats, setMailStats]         = useState<MailStats>(DEFAULT_STATS);

  // Editing states
  const [activeMailId, setActiveMailId]   = useState<string | null>(null);
  const [isEditing, setIsEditing]         = useState(false);
  const [editContent, setEditContent]     = useState('');

  // Word limit states
  const [wordLimitPreset, setWordLimitPreset] = useState<'short'|'medium'|'long'|'custom'>('medium');
  const [customWordLimit, setCustomWordLimit]  = useState('');

  // Settings states
  const [gmailIntegrated, setGmailIntegrated] = useState(true);
  const [defaultRecipient, setDefaultRecipient] = useState('');
  const [defaultSignature, setDefaultSignature] = useState('');

  // Gmail redirection popup state
  const [showGmailRedirectPrompt, setShowGmailRedirectPrompt] = useState(false);

  const resolveWordLimit = (): string => {
    if (wordLimitPreset === 'short')  return '100';
    if (wordLimitPreset === 'medium') return '200';
    if (wordLimitPreset === 'long')   return '350';
    const n = parseInt(customWordLimit, 10);
    return (!isNaN(n) && n > 0) ? String(n) : '200';
  };

  useEffect(() => { setFieldValues({}); }, [mailType]);

  // Load history and stats on mount
  useEffect(() => {
    try { const h = localStorage.getItem('mail_history'); if (h) setMailHistory(JSON.parse(h)); } catch {}
    try { const s = localStorage.getItem('mail_stats');   if (s) setMailStats({ ...DEFAULT_STATS, ...JSON.parse(s) }); } catch {}
    
    // Load Settings
    const savedGmailIntegrated = localStorage.getItem('settings_gmail_integrated');
    if (savedGmailIntegrated !== null) setGmailIntegrated(savedGmailIntegrated === 'true');
    const savedRecipient = localStorage.getItem('settings_default_recipient');
    if (savedRecipient) setDefaultRecipient(savedRecipient);
    const savedSignature = localStorage.getItem('settings_default_signature');
    if (savedSignature) setDefaultSignature(savedSignature);
  }, []);

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
    return count === target ? 'text-green-400 bg-green-500/10 border-green-500/20' : 'text-white/40 bg-white/4 border-white/8';
  };

  const handleOpenGmail = () => {
    if (!generatedMail) return;
    const { subject, body } = parseEmailParts(generatedMail);
    
    // Append signature if default signature config is active and not already included
    let finalBody = body;
    if (defaultSignature && !body.includes(defaultSignature)) {
      finalBody = `${body}\n\n${defaultSignature}`;
    }

    const toVal = recipientName.trim() || defaultRecipient;

    window.open(`https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(toVal)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(finalBody)}`, '_blank');
    setShowGmailRedirectPrompt(false);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const getGreeting = () => {
    const h = new Date().getHours();
    return h < 12 ? 'Good Morning' : h < 17 ? 'Good Afternoon' : 'Good Evening';
  };

  const getFormattedDate = () =>
    new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  const buildDescriptionSummary = () => {
    const parts = getFieldsForType(mailType).map(f => fieldValues[f.key]).filter(Boolean);
    return parts.slice(0, 2).join(' • ') || mailType;
  };

  const validateForm = (): boolean => {
    for (const f of getFieldsForType(mailType).filter(f => f.required)) {
      if (!fieldValues[f.key]?.trim()) { alert(`Please fill in: ${f.label}`); return false; }
    }
    if (!Object.values(fieldValues).some(v => v.trim())) {
      alert('Please fill in at least one field.'); return false;
    }
    return true;
  };

  const handleGenerateMail = async (e?: React.FormEvent, isRegenerate = false) => {
    if (e) e.preventDefault();
    if (!validateForm()) return;
    setLoading(true); 
    setError(null);
    
    try {
      const payload = { 
        type: mailType, 
        tone, 
        recipient: recipientName.trim() || 'Concerned Authority', 
        word_limit: resolveWordLimit(), 
        ...fieldValues 
      };

      const res = await fetch('http://localhost:3000/mail/generate', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json', 
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to generate mail.');

      const mailId = isRegenerate && activeMailId ? activeMailId : Math.random().toString(36).slice(2, 9);
      setGeneratedMail(data.email);
      setActiveMailId(mailId);
      setIsEditing(false);
      if (!isRegenerate) {
        setSessionCount(c => c + 1);
      }

      const item: MailHistoryItem = {
        id: mailId, 
        type: mailType, 
        tone,
        description: buildDescriptionSummary(), 
        email: data.email,
        timestamp: new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
        timestampMs: Date.now(),
      };

      setMailHistory(prev => {
        if (isRegenerate && activeMailId) {
          const u = prev.map(h => h.id === activeMailId ? item : h);
          localStorage.setItem('mail_history', JSON.stringify(u));
          return u;
        }
        const u = [item, ...prev].slice(0, 10); 
        localStorage.setItem('mail_history', JSON.stringify(u)); 
        return u; 
      });

      if (!isRegenerate) {
        setMailStats(prev => {
          const u = { 
            totalGenerated: prev.totalGenerated + 1, 
            typeCounts: { ...prev.typeCounts, [mailType]: (prev.typeCounts[mailType] || 0) + 1 }, 
            lastGeneratedMs: Date.now(), 
            lastGeneratedType: mailType 
          };
          localStorage.setItem('mail_stats', JSON.stringify(u)); 
          return u;
        });
      } else {
        setMailStats(prev => {
          const u = { ...prev, lastGeneratedMs: Date.now(), lastGeneratedType: mailType };
          localStorage.setItem('mail_stats', JSON.stringify(u));
          return u;
        });
      }

      // Show Gmail redirect flow (skip on regenerate to avoid repeated prompts)
      if (gmailIntegrated && !isRegenerate) {
        setShowGmailRedirectPrompt(true);
      }

      // Scroll output into view
      setTimeout(() => {
        const outEl  = document.getElementById('output-section');
        if (outEl) {
          outEl.scrollIntoView({ behavior: 'smooth' });
        }
      }, 150);

    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally { 
      setLoading(false); 
    }
  };

  const handleRegenerate = () => {
    if (!generatedMail || loading) return;
    handleGenerateMail(undefined, true);
  };

  const handleCopy = (text: string, id?: string) => {
    navigator.clipboard.writeText(text);
    setCopyStatus(id || 'main');
    setTimeout(() => setCopyStatus(null), 2000);
  };

  const handleDeleteHistory = (id: string) => {
    setMailHistory(prev => { 
      const u = prev.filter(i => i.id !== id); 
      localStorage.setItem('mail_history', JSON.stringify(u)); 
      return u; 
    });
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
    return { type: getBadgeLabel(maxType), count: maxCount };
  };

  const getLastTime = () => {
    if (!mailStats.lastGeneratedMs) return { time: 'Never', sub: 'No activity' };
    const diff = Date.now() - mailStats.lastGeneratedMs;
    const m = Math.floor(diff / 60000);
    let t = 'Just now';
    if (m >= 1) { 
      t = m < 60 ? `${m}m ago` : (h => h < 24 ? `${h}h ago` : `${Math.floor(h/24)}d ago`)(Math.floor(m/60)); 
    }
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

  const currentFieldGroups = getFieldGroupsForType(mailType);
  const mailTypeConfig = MAIL_TYPE_CONFIG_MAP[mailType];
  const SESSION_MAX = 10;
  const sessionBarPct = Math.min((sessionCount / SESSION_MAX) * 100, 100);
  const initials = user?.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'GU';

  return (
    <div className="min-h-screen bg-[#0b0914] text-white flex flex-col md:flex-row relative">
      
      {/* ════════════════ SIDEBAR ════════════════ */}
      <aside className="w-full md:w-64 bg-[#13131f] border-b md:border-b-0 md:border-r border-white/7 flex flex-col justify-between shrink-0 p-6 z-10">
        <div className="flex flex-col gap-8 w-full">
          
          {/* Brand */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('generator')}>
            <div className="w-8 h-8 rounded-lg bg-[#534AB7] flex items-center justify-center shadow-lg shadow-purple-500/20">
              <img src={mailgenLogo} alt="" className="h-5 w-auto" />
            </div>
            <span className="font-['Outfit'] font-bold text-lg bg-gradient-to-r from-white to-[#e0c3fc] bg-clip-text text-transparent">
              MailGen
            </span>
          </div>

          {/* User profile block */}
          <div className="bg-white/4 border border-white/6 rounded-2xl p-3 flex items-center gap-3">
            {user?.photoURL ? (
              <img src={user.photoURL} alt="" className="w-10 h-10 rounded-full border border-white/10 shrink-0" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center font-bold text-sm shrink-0">
                {initials}
              </div>
            )}
            <div className="flex flex-col text-left overflow-hidden">
              <span className="text-xs font-semibold text-white/90 truncate">{user?.name || 'Guest User'}</span>
              <span className="text-[10px] text-white/40 truncate">{user?.email || 'guest@mailgen.app'}</span>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex flex-col gap-2">
            <button 
              className={`flex items-center gap-3 py-3 px-4 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer ${
                activeTab === 'generator' 
                  ? 'bg-purple-600/20 text-[#a89ef5] border border-purple-500/20 shadow-inner' 
                  : 'text-white/60 hover:text-white hover:bg-white/4 border border-transparent'
              }`}
              onClick={() => { setActiveTab('generator'); setError(null); }}
            >
              <span className="w-2 h-2 rounded-full bg-current"></span>
              <span>Email Generator</span>
            </button>

            <button 
              className={`flex items-center gap-3 py-3 px-4 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer ${
                activeTab === 'history' 
                  ? 'bg-purple-600/20 text-[#a89ef5] border border-purple-500/20 shadow-inner' 
                  : 'text-white/60 hover:text-white hover:bg-white/4 border border-transparent'
              }`}
              onClick={() => { setActiveTab('history'); setError(null); }}
            >
              <span className="w-2 h-2 rounded-full bg-current"></span>
              <span>Mail History</span>
            </button>

            <button 
              className={`flex items-center gap-3 py-3 px-4 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer ${
                activeTab === 'profile' 
                  ? 'bg-purple-600/20 text-[#a89ef5] border border-purple-500/20 shadow-inner' 
                  : 'text-white/60 hover:text-white hover:bg-white/4 border border-transparent'
              }`}
              onClick={() => { setActiveTab('profile'); setError(null); }}
            >
              <span className="w-2 h-2 rounded-full bg-current"></span>
              <span>User Profile</span>
            </button>

            <button 
              className={`flex items-center gap-3 py-3 px-4 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer ${
                activeTab === 'settings' 
                  ? 'bg-purple-600/20 text-[#a89ef5] border border-purple-500/20 shadow-inner' 
                  : 'text-white/60 hover:text-white hover:bg-white/4 border border-transparent'
              }`}
              onClick={() => { setActiveTab('settings'); setError(null); }}
            >
              <span className="w-2 h-2 rounded-full bg-current"></span>
              <span>Gmail Settings</span>
            </button>
          </nav>
        </div>

        {/* Logout */}
        <button 
          className="flex items-center gap-3 py-3 px-4 rounded-xl text-sm font-semibold text-red-400 hover:text-red-300 hover:bg-red-500/10 cursor-pointer mt-8" 
          onClick={handleLogout}
        >
          <span className="w-2 h-2 rounded-full bg-current"></span>
          <span>Logout</span>
        </button>
      </aside>

      {/* ════════════════ MAIN CONTENT ════════════════ */}
      <main className="flex-grow flex flex-col p-6 sm:p-8 overflow-y-auto max-w-6xl mx-auto w-full">
        
        {/* Header */}
        <header className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-white/5 pb-6 mb-8 text-left">
          <div className="flex flex-col gap-1">
            <h1 className="font-['Outfit'] text-2xl font-bold tracking-tight">
              {getGreeting()}, {user?.name?.split(' ')[0] || 'User'} 👋
            </h1>
            <p className="text-xs text-white/50">My Mail Studio — generate professional mails instantly</p>
            <div className="flex items-center gap-2 mt-2">
              <div className="w-32 h-1 bg-white/10 rounded-full overflow-hidden">
                <div className="bg-[#7b2cbf] h-full" style={{ width: `${sessionBarPct}%` }} />
              </div>
              <span className="text-[10px] text-white/40">
                {sessionCount === 0 ? 'No mails generated this session' : `${sessionCount} mail${sessionCount > 1 ? 's' : ''} generated this session`}
              </span>
            </div>
          </div>
          <div className="bg-white/5 border border-white/8 text-xs text-white/80 py-1.5 px-4 rounded-full self-start">
            {getFormattedDate()}
          </div>
        </header>

        {/* ── GENERATOR TAB ── */}
        {activeTab === 'generator' && (
          <div className="flex flex-col gap-8 text-left">
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="bg-white/2 border border-white/5 rounded-2xl p-5 flex flex-col gap-1 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 radial-card-glow pointer-events-none"></div>
                <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center font-bold text-sm">#</div>
                <span className="text-3xl font-extrabold font-['Outfit'] mt-2">{mailStats.totalGenerated}</span>
                <span className="text-[10px] text-white/40 uppercase tracking-wider font-semibold">Total Generated</span>
              </div>
              <div className="bg-white/2 border border-white/5 rounded-2xl p-5 flex flex-col gap-1 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 radial-card-glow pointer-events-none"></div>
                <div className="w-8 h-8 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 flex items-center justify-center font-bold text-sm">U</div>
                <span className="text-3xl font-extrabold font-['Outfit'] mt-2 truncate max-w-full">{getMostUsed().type}</span>
                <span className="text-[10px] text-white/40 uppercase tracking-wider font-semibold">Most Used ({getMostUsed().count}x)</span>
              </div>
              <div className="bg-white/2 border border-white/5 rounded-2xl p-5 flex flex-col gap-1 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 radial-card-glow pointer-events-none"></div>
                <div className="w-8 h-8 rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 flex items-center justify-center font-bold text-sm">T</div>
                <span className="text-3xl font-extrabold font-['Outfit'] mt-2">{getLastTime().time}</span>
                <span className="text-[10px] text-white/40 uppercase tracking-wider font-semibold truncate max-w-full">Last: {getLastTime().sub}</span>
              </div>
            </div>

            {/* Main Form */}
            <div className="bg-white/2 border border-white/5 rounded-3xl p-6 sm:p-8">
              <h2 className="text-lg font-bold text-white/90 mb-6 font-['Outfit']">What email do you need today?</h2>

              {error && (
                <div className="bg-red-500/15 border border-red-500/30 text-red-400 p-4 rounded-xl text-sm font-medium mb-6">
                  {error}
                </div>
              )}

              <form onSubmit={handleGenerateMail} className="flex flex-col gap-6">
                
                {/* TO Field */}
                <div className="bg-white/3 border border-white/8 rounded-2xl p-2.5 flex items-center gap-3">
                  <span className="bg-purple-600/20 text-[#c77dff] border border-purple-500/30 text-[10px] font-bold py-1 px-3 rounded-lg tracking-wider">TO</span>
                  <input
                    id="recipient-name"
                    type="text"
                    className="bg-transparent border-none text-white text-sm outline-none w-full placeholder-white/20"
                    placeholder="Recipient's name or title — e.g. Dr. Smith, HR Team, Hiring Manager"
                    value={recipientName}
                    onChange={e => setRecipientName(e.target.value)}
                    disabled={loading}
                    autoComplete="off"
                  />
                </div>

                {/* Mail Type Selector */}
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-semibold text-white/55 uppercase tracking-wider">Mail Type</label>
                  <div className="flex flex-wrap gap-2">
                    {MAIL_TYPES.map(mt => (
                      <button 
                        key={mt.value} 
                        type="button"
                        className={`py-2 px-4 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                          mailType === mt.value 
                            ? 'bg-purple-600/20 text-[#c77dff] border-purple-500/40 shadow-inner' 
                            : 'bg-white/4 text-white/60 border-white/8 hover:border-white/15 hover:text-white'
                        }`}
                        onClick={() => setMailType(mt.value)} 
                        disabled={loading}
                      >
                        {mt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Tone + Word Limit Preset */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Tone */}
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-semibold text-white/55 uppercase tracking-wider">Tone</label>
                    <div className="flex gap-2">
                      {['Formal', 'Semi-Formal', 'Urgent'].map(t => (
                        <button 
                          key={t} 
                          type="button"
                          className={`py-2.5 px-5 rounded-xl text-xs font-semibold border flex-1 transition-all cursor-pointer ${
                            tone === t 
                              ? 'bg-purple-600/20 text-[#c77dff] border-purple-500/40 shadow-inner' 
                              : 'bg-white/4 text-white/60 border-white/8 hover:border-white/15'
                          }`}
                          onClick={() => setTone(t)} 
                          disabled={loading}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Word Limit */}
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-semibold text-white/55 uppercase tracking-wider">Word Limit</label>
                    <div className="flex gap-2">
                      {[
                        { value: 'short', label: '100w' },
                        { value: 'medium', label: '200w' },
                        { value: 'long', label: '350w' },
                        { value: 'custom', label: 'Custom' }
                      ].map(wl => (
                        <button 
                          key={wl.value} 
                          type="button"
                          className={`py-2.5 px-3 rounded-xl text-xs font-semibold border flex-1 transition-all cursor-pointer ${
                            wordLimitPreset === wl.value 
                              ? 'bg-purple-600/20 text-[#c77dff] border-purple-500/40' 
                              : 'bg-white/4 text-white/60 border-white/8 hover:border-white/15'
                          }`}
                          onClick={() => setWordLimitPreset(wl.value as any)} 
                          disabled={loading}
                        >
                          {wl.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Custom Word Limit Field */}
                {wordLimitPreset === 'custom' && (
                  <div className="flex flex-col gap-1.5 animate-fade-down">
                    <label className="text-[10px] font-semibold text-white/55 uppercase tracking-wider">Specify Word Limit</label>
                    <input
                      type="number"
                      className="bg-white/5 border border-white/10 hover:border-white/20 focus:border-purple-500 focus:bg-white/8 text-white rounded-xl py-3 px-4 text-sm outline-none transition-all w-full max-w-xs"
                      placeholder="e.g. 500"
                      value={customWordLimit}
                      onChange={e => setCustomWordLimit(e.target.value)}
                      required
                      min="10"
                      disabled={loading}
                    />
                  </div>
                )}

                {/* Email structure outline for selected type */}
                {mailTypeConfig && (
                  <div className="bg-purple-500/5 border border-purple-500/15 rounded-2xl p-4 flex flex-col gap-3">
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-semibold text-[#c77dff] uppercase tracking-wider">Email Structure</span>
                      <span className="text-xs text-white/45">Subject format: {mailTypeConfig.subjectFormat}</span>
                    </div>
                    <ol className="grid grid-cols-1 sm:grid-cols-2 gap-2 list-none m-0 p-0">
                      {mailTypeConfig.structure.map((section, idx) => (
                        <li key={section.id} className="flex gap-2.5 text-left bg-white/3 border border-white/6 rounded-xl p-3">
                          <span className="text-[10px] font-bold text-purple-400/80 shrink-0 w-4">{idx + 1}</span>
                          <div className="flex flex-col gap-0.5 min-w-0">
                            <span className="text-xs font-semibold text-white/85">{section.label}</span>
                            <span className="text-[11px] text-white/40 leading-snug">{section.description}</span>
                          </div>
                        </li>
                      ))}
                    </ol>
                  </div>
                )}

                {/* Dynamic Fields — grouped by body section */}
                <div className="flex flex-col gap-6 mt-2">
                  {currentFieldGroups.map(group => (
                    <div key={group.sectionId} className="flex flex-col gap-4">
                      <div className="flex flex-col gap-0.5 border-b border-white/5 pb-2">
                        <span className="text-[10px] font-semibold text-[#c77dff] uppercase tracking-wider">
                          Body · {group.title}
                        </span>
                        {group.hint && (
                          <span className="text-[11px] text-white/40">{group.hint}</span>
                        )}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        {group.fields.map(f => (
                          <div key={f.key} className={`flex flex-col gap-1.5 ${f.fullWidth ? 'md:col-span-2' : ''}`}>
                            <label className="text-[10px] font-semibold text-white/55 uppercase tracking-wider flex items-center gap-1">
                              {f.label} {f.required && <span className="text-purple-400">*</span>}
                            </label>
                            {f.type === 'text' ? (
                              <input
                                type="text"
                                className="bg-white/5 border border-white/10 hover:border-white/20 focus:border-purple-500 focus:bg-white/8 text-white rounded-xl py-3 px-4 text-sm outline-none transition-all placeholder-white/25"
                                placeholder={f.placeholder}
                                value={fieldValues[f.key] || ''}
                                onChange={e => setFieldValues(prev => ({ ...prev, [f.key]: e.target.value }))}
                                required={f.required}
                                disabled={loading}
                              />
                            ) : (
                              <textarea
                                className="bg-white/5 border border-white/10 hover:border-white/20 focus:border-purple-500 focus:bg-white/8 text-white rounded-xl py-3 px-4 text-sm outline-none transition-all placeholder-white/25 min-h-[90px] resize-y"
                                placeholder={f.placeholder}
                                value={fieldValues[f.key] || ''}
                                onChange={e => setFieldValues(prev => ({ ...prev, [f.key]: e.target.value }))}
                                required={f.required}
                                disabled={loading}
                              />
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <button 
                  type="submit" 
                  className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3.5 px-8 rounded-xl text-sm self-start shadow-[0_4px_15px_rgba(123,44,191,0.3)] hover:shadow-[0_6px_20px_rgba(123,44,191,0.5)] transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center min-w-[150px] cursor-pointer"
                  disabled={loading}
                  id="btn-generate"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    '✉ Generate Email'
                  )}
                </button>
              </form>
            </div>

            {/* Output Card */}
            {generatedMail && (
              <div id="output-section" className="bg-white/2 border border-white/5 rounded-3xl p-6 sm:p-8 animate-fade-in relative">
                
                {/* Header Actions */}
                <div className="flex flex-wrap justify-between items-center gap-4 border-b border-white/5 pb-4 mb-6">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-semibold text-[#c77dff] bg-purple-500/10 border border-purple-500/20 py-1 px-3 rounded-full uppercase tracking-wider">
                      Generated Mail
                    </span>
                    <span className={`text-[11px] font-bold border py-1 px-3 rounded-full uppercase tracking-wide transition-colors ${getWordCountColorClass(isEditing ? editContent : generatedMail)}`}>
                      {getWordCount(isEditing ? editContent : generatedMail)} / {resolveWordLimit()} words
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {isEditing ? (
                      <>
                        <button onClick={handleSaveEdit} className="bg-green-600 hover:bg-green-700 text-white font-semibold py-1.5 px-4 rounded-xl text-xs transition-all cursor-pointer">
                          Save
                        </button>
                        <button onClick={handleCancelEdit} className="bg-white/5 border border-white/10 hover:bg-white/10 text-white/70 py-1.5 px-4 rounded-xl text-xs transition-all cursor-pointer">
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button onClick={handleStartEdit} className="bg-white/5 border border-white/10 hover:bg-white/10 text-white py-1.5 px-4 rounded-xl text-xs font-semibold transition-all cursor-pointer">
                          ✎ Edit
                        </button>
                        <button onClick={handleRegenerate} disabled={loading} className="bg-white/5 border border-white/10 hover:bg-white/10 text-white py-1.5 px-4 rounded-xl text-xs font-semibold transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
                          {loading ? '…' : '↺ Regenerate'}
                        </button>
                        <button onClick={() => handleCopy(generatedMail, 'main')} className="bg-white/5 border border-white/10 hover:bg-white/10 text-white py-1.5 px-4 rounded-xl text-xs font-semibold transition-all cursor-pointer">
                          {copyStatus === 'main' ? 'Copied! ✓' : '📋 Copy'}
                        </button>
                        <button onClick={handleOpenGmail} className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-1.5 px-4 rounded-xl text-xs transition-all cursor-pointer">
                          Open in Gmail
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Body Content */}
                <div className="text-left font-sans">
                  {isEditing ? (
                    <textarea
                      className="w-full bg-white/3 border border-white/10 focus:border-purple-500 focus:bg-white/5 rounded-2xl p-6 text-sm text-white/95 outline-none font-sans leading-relaxed min-h-[300px] resize-y"
                      value={editContent}
                      onChange={e => setEditContent(e.target.value)}
                    />
                  ) : (
                    <pre className="font-sans text-sm sm:text-base text-white/80 leading-relaxed whitespace-pre-wrap select-text selection:bg-purple-500/30">
                      {generatedMail}
                    </pre>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── MAIL HISTORY TAB ── */}
        {activeTab === 'history' && (
          <div className="flex flex-col gap-6 text-left">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold font-['Outfit']">Generated Emails</h2>
              <span className="text-xs text-white/40 font-semibold">{mailHistory.length} logs total</span>
            </div>

            {mailHistory.length === 0 ? (
              <div className="bg-white/2 border border-white/5 rounded-3xl p-12 text-center flex flex-col items-center justify-center">
                <span className="text-4xl mb-4">📂</span>
                <h3 className="font-semibold text-lg">No mails generated yet</h3>
                <p className="text-white/40 text-sm mt-1 max-w-sm">Once you generate a professional email in the generator, it will show up here.</p>
                <button onClick={() => setActiveTab('generator')} className="bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold py-2 px-5 rounded-xl mt-6 cursor-pointer">
                  Go to Generator
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {mailHistory.map(item => {
                  const { subject, body } = parseEmailParts(item.email);
                  return (
                    <div key={item.id} className="bg-white/2 border border-white/5 rounded-2xl p-6 flex flex-col gap-4">
                      <div className="flex justify-between items-start gap-4 flex-wrap">
                        <div className="flex flex-col gap-1.5">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-semibold text-[#c77dff] bg-purple-500/10 border border-purple-500/20 py-0.5 px-2.5 rounded-full">
                              {getBadgeLabel(item.type)}
                            </span>
                            <span className="text-xs text-white/60 font-semibold bg-white/4 border border-white/6 py-0.5 px-2.5 rounded-full capitalize">
                              {item.tone}
                            </span>
                            <span className="text-[10px] text-white/30 font-medium">
                              {getItemTime(item)}
                            </span>
                          </div>
                          <h3 className="font-semibold text-sm text-white/90 truncate max-w-md mt-1">
                            {subject ? `Subject: ${subject}` : 'No Subject'}
                          </h3>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <button onClick={() => {
                            setGeneratedMail(item.email);
                            setActiveMailId(item.id);
                            setIsEditing(false);
                            setActiveTab('generator');
                            setTimeout(() => {
                              document.getElementById('output-section')?.scrollIntoView({ behavior: 'smooth' });
                            }, 100);
                          }} className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-1.5 px-3 rounded-lg text-xs cursor-pointer">
                            Load in Editor
                          </button>
                          <button onClick={() => handleCopy(item.email, item.id)} className="bg-white/5 border border-white/10 hover:bg-white/10 text-white py-1.5 px-3 rounded-lg text-xs font-semibold cursor-pointer">
                            {copyStatus === item.id ? 'Copied!' : 'Copy'}
                          </button>
                          <button onClick={() => handleDeleteHistory(item.id)} className="bg-red-500/10 hover:bg-red-500/20 text-red-400 py-1.5 px-3 rounded-lg text-xs cursor-pointer">
                            Delete
                          </button>
                        </div>
                      </div>

                      <div className="bg-black/20 rounded-xl p-4 border border-white/4 max-h-[160px] overflow-y-auto">
                        <pre className="font-sans text-xs text-white/70 leading-relaxed whitespace-pre-wrap select-text">
                          {body}
                        </pre>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── USER PROFILE TAB ── */}
        {activeTab === 'profile' && (
          <div className="flex flex-col gap-6 text-left max-w-xl">
            <h2 className="text-xl font-bold font-['Outfit']">User Profile</h2>

            <div className="bg-gradient-to-br from-purple-900/40 to-indigo-950/40 border border-white/10 shadow-xl rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center gap-6 backdrop-blur-xl">
              {user?.photoURL ? (
                <img src={user.photoURL} alt="" className="w-24 h-24 rounded-full border-2 border-purple-500/25 object-cover" />
              ) : (
                <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center font-bold text-3xl">
                  {initials}
                </div>
              )}

              <div className="flex flex-col gap-1.5 text-center sm:text-left">
                <span className="bg-green-500/10 border border-green-500/20 text-green-400 text-[10px] font-bold py-0.5 px-2.5 rounded-full uppercase tracking-wider self-center sm:self-start">
                  Active Session
                </span>
                <h3 className="font-['Outfit'] text-2xl font-bold mt-1">{user?.name || 'Guest User'}</h3>
                <p className="text-white/60 text-sm">{user?.email || 'guest@mailgen.app'}</p>
                <div className="flex flex-col gap-1 mt-3">
                  <span className="text-[10px] font-semibold text-white/30 uppercase tracking-wider">User Account ID</span>
                  <code className="text-xs bg-black/30 border border-white/5 px-3 py-1.5 rounded-lg text-purple-300 font-mono break-all max-w-full">
                    {user?.uid || 'google-uid-mock-12345'}
                  </code>
                </div>
                <div className="flex flex-wrap gap-3 mt-4 justify-center sm:justify-start">
                  <button
                    type="button"
                    onClick={async () => {
                      await logout();
                      navigate('/login', { state: { triggerGoogle: true } });
                    }}
                    className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2.5 px-4 rounded-xl text-xs shadow-md transition-all hover:-translate-y-0.5 active:translate-y-0 cursor-pointer border-none"
                  >
                    ⇄ Switch Account
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      await logout();
                      navigate('/login');
                    }}
                    className="bg-white/5 border border-white/10 hover:bg-white/10 text-white font-semibold py-2.5 px-4 rounded-xl text-xs shadow-md transition-all hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
                  >
                    🚪 Sign Out
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── SETTINGS TAB ── */}
        {activeTab === 'settings' && (
          <div className="flex flex-col gap-6 text-left max-w-xl">
            <h2 className="text-xl font-bold font-['Outfit']">Gmail Settings</h2>

            <div className="bg-white/2 border border-white/5 rounded-3xl p-6 sm:p-8 flex flex-col gap-6">
              
              {/* Integration Switch */}
              <div className="flex justify-between items-center border-b border-white/5 pb-5">
                <div className="flex flex-col gap-1">
                  <h3 className="font-semibold text-sm text-white/90">Gmail Redirection Popup</h3>
                  <p className="text-xs text-white/40">Toggle if you want to be asked to open Gmail after generating.</p>
                </div>
                <button 
                  type="button" 
                  onClick={() => {
                    const next = !gmailIntegrated;
                    setGmailIntegrated(next);
                    localStorage.setItem('settings_gmail_integrated', String(next));
                  }} 
                  className={`w-12 h-6 rounded-full p-1 transition-all duration-300 cursor-pointer ${
                    gmailIntegrated ? 'bg-purple-600 flex justify-end' : 'bg-white/10 flex justify-start'
                  }`}
                >
                  <span className="w-4 h-4 rounded-full bg-white block"></span>
                </button>
              </div>

              {/* Default Recipient Email */}
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-semibold text-white/55 uppercase tracking-wider">Default Recipient Email</label>
                <input
                  type="email"
                  className="bg-white/5 border border-white/10 hover:border-white/20 focus:border-purple-500 focus:bg-white/8 text-white rounded-xl py-3 px-4 text-sm outline-none transition-all w-full placeholder-white/25"
                  placeholder="e.g. hr@company.com"
                  value={defaultRecipient}
                  onChange={e => {
                    setDefaultRecipient(e.target.value);
                    localStorage.setItem('settings_default_recipient', e.target.value);
                  }}
                />
              </div>

              {/* Default Signature */}
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-semibold text-white/55 uppercase tracking-wider">Default Email Signature</label>
                <textarea
                  className="bg-white/5 border border-white/10 hover:border-white/20 focus:border-purple-500 focus:bg-white/8 text-white rounded-xl py-3 px-4 text-sm outline-none transition-all placeholder-white/25 min-h-[90px] resize-y"
                  placeholder="e.g. Kind regards, Jane Doe"
                  value={defaultSignature}
                  onChange={e => {
                    setDefaultSignature(e.target.value);
                    localStorage.setItem('settings_default_signature', e.target.value);
                  }}
                />
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ── GMAIL REDIRECTION MODAL ── */}
      {showGmailRedirectPrompt && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center p-4 z-50 animate-fade-in">
          <div className="bg-[#1b192e] border border-white/10 shadow-2xl rounded-3xl w-full max-w-md p-6 sm:p-8 flex flex-col gap-6 text-center animate-scale-up">
            <div className="w-14 h-14 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-[#c77dff] flex items-center justify-center text-3xl mx-auto shadow-lg shadow-purple-500/10">
              ✉
            </div>
            
            <div className="flex flex-col gap-2">
              <h2 className="font-['Outfit'] text-xl font-bold">Your email is ready!</h2>
              <p className="text-white/60 text-sm leading-relaxed">Would you like to open Gmail to review and send it now?</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mt-2">
              <button 
                onClick={handleOpenGmail} 
                className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-xl text-sm flex-1 shadow-[0_4px_15px_rgba(123,44,191,0.3)] hover:-translate-y-0.5 transition-all cursor-pointer"
              >
                Open Gmail
              </button>
              <button 
                onClick={() => {
                  setShowGmailRedirectPrompt(false);
                  setIsEditing(true);
                  if (generatedMail) setEditContent(generatedMail);
                }} 
                className="bg-white/5 border border-white/10 hover:bg-white/10 text-white py-3 px-6 rounded-xl text-sm flex-1 transition-all cursor-pointer"
              >
                Edit Email
              </button>
            </div>

            <button 
              onClick={() => setShowGmailRedirectPrompt(false)} 
              className="text-white/40 hover:text-white text-xs font-semibold underline self-center mt-1 cursor-pointer"
            >
              Close and view details
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
