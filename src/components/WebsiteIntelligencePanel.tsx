import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Globe, Plus, Trash2, RefreshCw, Zap, Activity,
  AlertCircle, CheckCircle, Clock, Power, PowerOff,
  TrendingUp, Search, Brain, ChevronDown,
  ChevronRight, Sparkles, Loader2, WifiOff
} from 'lucide-react';
import { toast } from 'sonner';
import { db } from '../firebase';
import {
  collection, doc, addDoc, deleteDoc, getDocs,
  setDoc, getDoc, serverTimestamp, query, orderBy, limit, onSnapshot
} from 'firebase/firestore';

// ─── Firestore collection names ───────────────────────────────
const COL_SOURCES   = 'intelligence_sources';
const COL_ACTIVITY  = 'intelligence_activity';
const COL_SETTINGS  = 'intelligence_settings';
const SETTINGS_DOC  = 'global';

interface SourceURL {
  id: string;
  url: string;
  name: string;
  addedAt: string;
}

interface ActivityLog {
  id: string;
  timestamp: string;
  action: string;
  details: string;
  status: 'success' | 'failed' | 'pending';
}

interface TrendTopic {
  title: string;
  summary: string;
  relevanceScore: number;
  contentType: string;
}

// ─── Check if backend server is available ─────────────────────
async function checkServerAvailable(): Promise<boolean> {
  try {
    const res = await fetch('/api/health', { signal: AbortSignal.timeout(2000) });
    return res.ok;
  } catch {
    return false;
  }
}

// ─── Log activity to Firestore ────────────────────────────────
async function logActivity(action: string, details: string, status: 'success' | 'failed' | 'pending' = 'success') {
  try {
    await addDoc(collection(db, COL_ACTIVITY), {
      action,
      details,
      status,
      timestamp: serverTimestamp(),
    });
  } catch (err) {
    console.error('Failed to log activity:', err);
  }
}

export function WebsiteIntelligencePanel() {
  const [sources, setSources]               = useState<SourceURL[]>([]);
  const [activityLogs, setActivityLogs]     = useState<ActivityLog[]>([]);
  const [autoPublish, setAutoPublish]       = useState(false);
  const [serverOnline, setServerOnline]     = useState<boolean | null>(null);
  const [loadingInit, setLoadingInit]       = useState(true);
  const [togglingPublish, setTogglingPublish] = useState(false);
  const [newSourceUrl, setNewSourceUrl]     = useState('');
  const [newSourceName, setNewSourceName]   = useState('');
  const [isAddingSource, setIsAddingSource] = useState(false);
  const [activeTab, setActiveTab]           = useState<'overview' | 'sources' | 'trends' | 'activity'>('overview');
  const [niche, setNiche]                   = useState('government jobs India sarkari naukri');
  const [trends, setTrends]                 = useState<TrendTopic[]>([]);
  const [loadingTrends, setLoadingTrends]   = useState(false);
  const [isGenerating, setIsGenerating]     = useState<string | null>(null);
  const [expandedLog, setExpandedLog]       = useState<string | null>(null);

  // ── Init: load settings + check server ──────────────────────
  useEffect(() => {
    let unsubActivity: (() => void) | undefined;

    const init = async () => {
      // 1. Check if backend is available
      const online = await checkServerAvailable();
      setServerOnline(online);

      // 2. Load auto-publish setting from Firestore
      try {
        const snap = await getDoc(doc(db, COL_SETTINGS, SETTINGS_DOC));
        if (snap.exists()) {
          setAutoPublish(snap.data()?.autoPublishEnabled ?? false);
          setNiche(snap.data()?.niche ?? niche);
        }
      } catch { /* first run, no settings yet */ }

      // 3. Load sources from Firestore
      try {
        const snap = await getDocs(collection(db, COL_SOURCES));
        setSources(snap.docs.map(d => ({ id: d.id, ...d.data() } as SourceURL)));
      } catch { /* ignore */ }

      // 4. Real-time activity log listener
      try {
        const q = query(collection(db, COL_ACTIVITY), orderBy('timestamp', 'desc'), limit(100));
        unsubActivity = onSnapshot(q, (snap) => {
          setActivityLogs(snap.docs.map(d => {
            const data = d.data();
            return {
              id: d.id,
              action: data.action ?? '',
              details: data.details ?? '',
              status: data.status ?? 'success',
              timestamp: data.timestamp?.toDate?.()?.toISOString() ?? new Date().toISOString(),
            };
          }));
        });
      } catch { /* ignore */ }

      setLoadingInit(false);
    };

    init();
    return () => { unsubActivity?.(); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Toggle auto-publish (stored in Firestore) ────────────────
  const handleToggleAutoPublish = async () => {
    setTogglingPublish(true);
    try {
      const next = !autoPublish;
      await setDoc(doc(db, COL_SETTINGS, SETTINGS_DOC), {
        autoPublishEnabled: next,
        niche,
        updatedAt: serverTimestamp(),
      }, { merge: true });
      setAutoPublish(next);
      await logActivity('AutoPublish Toggled', `Auto-publish is now: ${next ? 'ON' : 'OFF'}`);
      toast.success(`Auto-publish ${next ? 'ENABLED ✅' : 'DISABLED — Draft mode 📝'}`);
    } catch (err: any) {
      toast.error('Failed to update setting. Check Firestore rules.');
      console.error(err);
    } finally {
      setTogglingPublish(false);
    }
  };

  // ── Add source URL to Firestore ──────────────────────────────
  const handleAddSource = async () => {
    if (!newSourceUrl.trim()) return;
    setIsAddingSource(true);
    try {
      const ref = await addDoc(collection(db, COL_SOURCES), {
        url: newSourceUrl.trim(),
        name: newSourceName.trim() || newSourceUrl.trim(),
        addedAt: new Date().toISOString(),
      });
      setSources(prev => [...prev, {
        id: ref.id,
        url: newSourceUrl.trim(),
        name: newSourceName.trim() || newSourceUrl.trim(),
        addedAt: new Date().toISOString(),
      }]);
      setNewSourceUrl('');
      setNewSourceName('');
      await logActivity('Source Added', `URL: ${newSourceUrl.trim()}`);
      toast.success('Source URL saved to Firestore!');
    } catch (err: any) {
      toast.error('Failed to add source. Check Firestore permissions.');
    } finally {
      setIsAddingSource(false);
    }
  };

  // ── Delete source from Firestore ─────────────────────────────
  const handleDeleteSource = async (id: string) => {
    try {
      await deleteDoc(doc(db, COL_SOURCES, id));
      setSources(prev => prev.filter(s => s.id !== id));
      toast.success('Source removed');
    } catch {
      toast.error('Failed to remove source');
    }
  };

  // ── Fetch Trends (needs backend server) ──────────────────────
  const handleFetchTrends = async () => {
    if (!serverOnline) {
      toast.error('AI Trends feature needs the backend server. It works in development mode (npm run dev).');
      return;
    }
    setLoadingTrends(true);
    setActiveTab('trends');
    try {
      const res = await fetch('/api/intelligence/search-trends', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ niche, keywords: ['SSC', 'UPSC', 'Railway', 'Banking'] }),
      });
      const data = await res.json();
      setTrends(data.topics || []);
      await logActivity('Trend Search', `Found ${data.topics?.length ?? 0} topics for: "${niche}"`);
      toast.success(`${data.topics?.length ?? 0} trending topics found!`);
    } catch {
      toast.error('Failed to fetch trends');
    } finally {
      setLoadingTrends(false);
    }
  };

  // ── Generate Post via AI (needs backend) ─────────────────────
  const handleGeneratePost = async (topic: string, contentType: string) => {
    if (!serverOnline) {
      toast.error('AI Post Generation needs the backend server. Run npm run dev locally.');
      return;
    }
    setIsGenerating(topic);
    try {
      const res = await fetch('/api/intelligence/generate-post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, targetType: contentType }),
      });
      const data = await res.json();
      if (data.post) {
        await logActivity('Post Generated', `"${topic}" — ${autoPublish ? 'Published' : 'Draft'}`);
        toast.success(autoPublish ? '🚀 Post published!' : '📝 Post saved as draft!');
      }
    } catch {
      toast.error('Failed to generate post');
    } finally {
      setIsGenerating(null);
    }
  };

  // ── Save niche setting ────────────────────────────────────────
  const saveNiche = async () => {
    try {
      await setDoc(doc(db, COL_SETTINGS, SETTINGS_DOC), { niche, updatedAt: serverTimestamp() }, { merge: true });
      toast.success('Niche/Keywords saved!');
    } catch {
      toast.error('Failed to save settings');
    }
  };

  const TABS = [
    { id: 'overview', label: 'Overview', icon: Activity },
    { id: 'sources',  label: 'Sources',  icon: Globe },
    { id: 'trends',   label: 'Trends',   icon: TrendingUp },
    { id: 'activity', label: 'Log',      icon: Clock },
  ] as const;

  if (loadingInit) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="space-y-5">

      {/* ── Header ─────────────────────────────────────────────── */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg,#1e3a5f,#2563eb)' }}>
            <Brain className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800">Website Intelligence</h2>
            <p className="text-sm text-slate-500">Firestore-powered autonomous management</p>
          </div>
        </div>

        {/* Auto-Publish Toggle */}
        <button
          onClick={handleToggleAutoPublish}
          disabled={togglingPublish}
          className={`flex items-center gap-2.5 px-5 py-2.5 rounded-xl font-bold text-sm transition-all shadow-md ${
            autoPublish ? 'text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
          style={autoPublish ? { background: 'linear-gradient(135deg,#16a34a,#15803d)' } : {}}
        >
          {togglingPublish
            ? <Loader2 className="w-4 h-4 animate-spin" />
            : autoPublish ? <Power className="w-4 h-4" /> : <PowerOff className="w-4 h-4" />
          }
          {autoPublish ? 'Auto-Publish ON' : 'Draft Mode'}
        </button>
      </div>

      {/* ── Server Status Banner ────────────────────────────────── */}
      {serverOnline === false && (
        <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-800">
          <WifiOff className="w-4 h-4 mt-0.5 flex-shrink-0 text-amber-600" />
          <div>
            <p className="font-bold">AI Generation features offline</p>
            <p className="text-xs mt-0.5 text-amber-700">
              Source management aur auto-publish settings kaam karenge (Firestore se).
              AI post generation, trends aur chatbot ke liye backend server chalana padega (<code className="bg-amber-100 px-1 rounded">npm run dev</code>).
            </p>
          </div>
        </div>
      )}
      {serverOnline === true && (
        <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-4 py-2.5 text-sm text-green-700">
          <CheckCircle className="w-4 h-4 text-green-500" />
          <span className="font-medium">Backend server online — All AI features active!</span>
        </div>
      )}

      {/* Auto-publish info banner */}
      <div className={`rounded-xl px-4 py-3 text-sm flex items-start gap-2.5 ${
        autoPublish
          ? 'bg-green-50 border border-green-200 text-green-700'
          : 'bg-amber-50 border border-amber-200 text-amber-700'
      }`}>
        {autoPublish
          ? <><CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span><strong>Auto-Publish ON.</strong> AI content directly publish hoga.</span></>
          : <><AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span><strong>Draft Mode ON.</strong> AI content pehle draft mein jayega — aap approve karoge phir publish hoga.</span></>
        }
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Sources', value: sources.length, icon: Globe, color: '#2563eb' },
          { label: 'Activities', value: activityLogs.length, icon: Activity, color: '#16a34a' },
          { label: 'Server', value: serverOnline === null ? '...' : serverOnline ? 'Online' : 'Offline', icon: serverOnline ? CheckCircle : WifiOff, color: serverOnline ? '#16a34a' : '#f59e0b' },
          { label: 'Mode', value: autoPublish ? 'Live' : 'Draft', icon: autoPublish ? Power : PowerOff, color: autoPublish ? '#16a34a' : '#7c3aed' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${color}20` }}>
              <Icon className="w-5 h-5" style={{ color }} />
            </div>
            <div>
              <p className="text-xl font-bold text-slate-800">{value}</p>
              <p className="text-xs text-slate-500">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-slate-100 rounded-xl">
        {TABS.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab.id ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}>
            <tab.icon className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* ── OVERVIEW TAB ──────────────────────────────────────────── */}
      {activeTab === 'overview' && (
        <div className="space-y-4">
          {/* Niche Config */}
          <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
            <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
              <Search className="w-4 h-4 text-blue-500" /> Niche / Keywords
            </h3>
            <div className="flex gap-3">
              <input value={niche} onChange={e => setNiche(e.target.value)}
                placeholder="e.g. government jobs India, SSC, UPSC"
                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50" />
              <button onClick={saveNiche}
                className="px-4 py-2.5 rounded-xl text-white text-sm font-bold"
                style={{ background: 'linear-gradient(135deg,#1e3a5f,#2563eb)' }}>
                Save
              </button>
              <button onClick={handleFetchTrends} disabled={loadingTrends}
                className="px-4 py-2.5 rounded-xl text-white text-sm font-bold flex items-center gap-1.5 disabled:opacity-60"
                style={{ background: 'linear-gradient(135deg,#7c3aed,#2563eb)' }}>
                {loadingTrends ? <Loader2 className="w-4 h-4 animate-spin" /> : <TrendingUp className="w-4 h-4" />}
                Trends
              </button>
            </div>
          </div>

          {/* Quick Generate */}
          <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
            <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
              <Zap className="w-4 h-4 text-yellow-500" /> Quick Generate
              {!serverOnline && <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full ml-1">Needs server</span>}
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Sarkari Jobs Post', type: 'job', icon: '💼' },
                { label: 'Admit Card Update', type: 'admit_card', icon: '🎫' },
                { label: 'Result Notification', type: 'result', icon: '📊' },
                { label: 'Scholarship Alert', type: 'scholarship', icon: '🎓' },
              ].map(item => (
                <button key={item.type}
                  onClick={() => handleGeneratePost(`Latest ${item.label} 2025`, item.type)}
                  disabled={isGenerating !== null || !serverOnline}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all text-left ${
                    serverOnline
                      ? 'border-slate-200 hover:border-blue-300 hover:bg-blue-50 cursor-pointer'
                      : 'border-slate-100 opacity-50 cursor-not-allowed'
                  }`}>
                  <span className="text-xl">{item.icon}</span>
                  <div>
                    <p className="text-sm font-semibold text-slate-700">{item.label}</p>
                    <p className="text-xs text-slate-400">AI will {autoPublish ? 'publish' : 'draft'}</p>
                  </div>
                  {isGenerating === `Latest ${item.label} 2025` && (
                    <Loader2 className="w-4 h-4 animate-spin text-blue-500 ml-auto" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── SOURCES TAB ───────────────────────────────────────────── */}
      {activeTab === 'sources' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
            <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
              <Plus className="w-4 h-4 text-green-500" /> Add Source URL
            </h3>
            <div className="space-y-3">
              <input value={newSourceName} onChange={e => setNewSourceName(e.target.value)}
                placeholder="Source name (e.g. SSC Official)"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50" />
              <div className="flex gap-3">
                <input value={newSourceUrl} onChange={e => setNewSourceUrl(e.target.value)}
                  placeholder="https://ssc.nic.in"
                  className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50"
                  onKeyDown={e => e.key === 'Enter' && handleAddSource()} />
                <button onClick={handleAddSource} disabled={isAddingSource || !newSourceUrl.trim()}
                  className="px-5 py-2.5 rounded-xl text-white text-sm font-bold flex items-center gap-2 disabled:opacity-50"
                  style={{ background: 'linear-gradient(135deg,#1e3a5f,#2563eb)' }}>
                  {isAddingSource ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  Add
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-50">
              <h3 className="font-bold text-slate-800">Monitored Sources ({sources.length})</h3>
            </div>
            {sources.length === 0 ? (
              <div className="py-12 text-center">
                <Globe className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                <p className="text-slate-400 text-sm">No sources added yet</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-50">
                {sources.map(source => (
                  <div key={source.id} className="flex items-center justify-between px-5 py-4 hover:bg-slate-50 transition-all">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                        <Globe className="w-4 h-4 text-blue-500" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-700 truncate">{source.name}</p>
                        <p className="text-xs text-slate-400 truncate max-w-xs">{source.url}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {serverOnline && (
                        <button
                          onClick={() => handleGeneratePost(`Latest updates from ${source.name}`, 'job')}
                          disabled={isGenerating !== null}
                          className="px-3 py-1.5 text-xs font-bold text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-all">
                          Generate
                        </button>
                      )}
                      <button onClick={() => handleDeleteSource(source.id)}
                        className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg transition-all">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── TRENDS TAB ────────────────────────────────────────────── */}
      {activeTab === 'trends' && (
        <div className="space-y-3">
          {!serverOnline ? (
            <div className="py-16 text-center bg-white rounded-2xl border border-slate-100">
              <WifiOff className="w-12 h-12 text-amber-300 mx-auto mb-4" />
              <p className="font-bold text-slate-600">Backend Server Offline</p>
              <p className="text-sm text-slate-400 mt-2 max-w-xs mx-auto">
                Trending topics ke liye AI backend server kaam karna chahiye.
                <br/>Local development mein <code className="bg-slate-100 px-1 rounded">npm run dev</code> se chalao.
              </p>
            </div>
          ) : loadingTrends ? (
            <div className="py-16 text-center">
              <Loader2 className="w-10 h-10 animate-spin text-blue-500 mx-auto mb-3" />
              <p className="text-slate-500 text-sm">AI searching trending topics...</p>
            </div>
          ) : trends.length === 0 ? (
            <div className="py-12 text-center bg-white rounded-2xl border border-slate-100">
              <TrendingUp className="w-10 h-10 text-slate-200 mx-auto mb-3" />
              <p className="text-slate-400 text-sm">No trends fetched yet</p>
              <button onClick={handleFetchTrends}
                className="mt-4 px-5 py-2.5 rounded-xl text-white text-sm font-bold"
                style={{ background: 'linear-gradient(135deg,#7c3aed,#2563eb)' }}>
                Fetch Trending Topics
              </button>
            </div>
          ) : (
            trends.map((trend, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs px-2 py-0.5 rounded-full font-bold uppercase bg-blue-50 text-blue-700">
                        {trend.contentType}
                      </span>
                      <span className={`text-xs font-bold ${trend.relevanceScore >= 80 ? 'text-green-600' : 'text-amber-600'}`}>
                        {trend.relevanceScore}% relevant
                      </span>
                    </div>
                    <h4 className="font-bold text-slate-800 text-sm mb-1">{trend.title}</h4>
                    <p className="text-xs text-slate-500 leading-relaxed">{trend.summary}</p>
                  </div>
                  <button onClick={() => handleGeneratePost(trend.title, trend.contentType)}
                    disabled={isGenerating !== null}
                    className="flex-shrink-0 px-3 py-2 rounded-xl text-xs font-bold text-white flex items-center gap-1.5 disabled:opacity-50"
                    style={{ background: 'linear-gradient(135deg,#1e3a5f,#2563eb)' }}>
                    {isGenerating === trend.title
                      ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      : <Sparkles className="w-3.5 h-3.5" />}
                    Create
                  </button>
                </div>
              </motion.div>
            ))
          )}
        </div>
      )}

      {/* ── ACTIVITY LOG TAB ──────────────────────────────────────── */}
      {activeTab === 'activity' && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-50 flex items-center justify-between">
            <h3 className="font-bold text-slate-800">Activity Log ({activityLogs.length})</h3>
            <span className="text-xs text-green-600 flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
              Live (Firestore)
            </span>
          </div>
          {activityLogs.length === 0 ? (
            <div className="py-12 text-center">
              <Activity className="w-10 h-10 text-slate-200 mx-auto mb-3" />
              <p className="text-slate-400 text-sm">No activity yet</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-50 max-h-[500px] overflow-y-auto">
              {activityLogs.map(log => (
                <div key={log.id}
                  className="px-5 py-3.5 hover:bg-slate-50 transition-all cursor-pointer"
                  onClick={() => setExpandedLog(expandedLog === log.id ? null : log.id)}>
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                      log.status === 'success' ? 'bg-green-400' :
                      log.status === 'failed'  ? 'bg-red-400' : 'bg-yellow-400'
                    }`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-700 truncate">{log.action}</p>
                      <p className="text-xs text-slate-400">
                        {new Date(log.timestamp).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
                      </p>
                    </div>
                    {expandedLog === log.id
                      ? <ChevronDown className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                      : <ChevronRight className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />}
                  </div>
                  <AnimatePresence>
                    {expandedLog === log.id && (
                      <motion.p initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="text-xs text-slate-500 mt-2 pl-5 bg-slate-50 rounded-lg p-2 overflow-hidden">
                        {log.details}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
