import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Globe, Plus, Trash2, RefreshCw, Zap, Activity,
  AlertCircle, CheckCircle, Clock, Power, PowerOff,
  TrendingUp, FileText, Search, Brain, Mail, ChevronDown,
  ChevronRight, Sparkles, Loader2, XCircle
} from 'lucide-react';
import { toast } from 'sonner';

interface SourceURL {
  id: string;
  url: string;
  name: string;
  addedAt: string;
  lastScraped?: string;
}

interface ActivityLog {
  id: string;
  timestamp: string;
  action: string;
  details: string;
  status: 'success' | 'failed' | 'pending';
}

interface IntelligenceStatus {
  autoPublishEnabled: boolean;
  sourcesCount: number;
  activityCount: number;
  errorCount: number;
  lastActivity: string | null;
}

interface TrendTopic {
  title: string;
  summary: string;
  relevanceScore: number;
  contentType: string;
  searchQuery: string;
}

export function WebsiteIntelligencePanel() {
  const [status, setStatus] = useState<IntelligenceStatus | null>(null);
  const [sources, setSources] = useState<SourceURL[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [newSourceUrl, setNewSourceUrl] = useState('');
  const [newSourceName, setNewSourceName] = useState('');
  const [isAddingSource, setIsAddingSource] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState(true);
  const [loadingTrends, setLoadingTrends] = useState(false);
  const [trends, setTrends] = useState<TrendTopic[]>([]);
  const [isGenerating, setIsGenerating] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'sources' | 'trends' | 'activity'>('overview');
  const [togglingPublish, setTogglingPublish] = useState(false);
  const [niche, setNiche] = useState('government jobs India sarkari naukri');
  const [expandedLog, setExpandedLog] = useState<string | null>(null);

  const fetchStatus = async () => {
    try {
      const [statusRes, sourcesRes, logsRes] = await Promise.all([
        fetch('/api/intelligence/status'),
        fetch('/api/intelligence/sources'),
        fetch('/api/intelligence/activity'),
      ]);
      if (statusRes.ok) setStatus(await statusRes.json());
      if (sourcesRes.ok) setSources((await sourcesRes.json()).sources || []);
      if (logsRes.ok) setActivityLogs((await logsRes.json()).logs || []);
    } catch (err) {
      console.error('Failed to fetch intelligence status:', err);
    } finally {
      setLoadingStatus(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const handleToggleAutoPublish = async () => {
    setTogglingPublish(true);
    try {
      const res = await fetch('/api/intelligence/toggle-autopublish', { method: 'POST' });
      const data = await res.json();
      setStatus(prev => prev ? { ...prev, autoPublishEnabled: data.autoPublishEnabled } : null);
      toast.success(`Auto-publish ${data.autoPublishEnabled ? 'ENABLED ✅' : 'DISABLED — Draft mode 📝'}`);
    } catch {
      toast.error('Failed to toggle auto-publish');
    } finally {
      setTogglingPublish(false);
    }
  };

  const handleAddSource = async () => {
    if (!newSourceUrl.trim()) return;
    setIsAddingSource(true);
    try {
      const res = await fetch('/api/intelligence/sources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: newSourceUrl.trim(), name: newSourceName.trim() || newSourceUrl.trim() }),
      });
      const data = await res.json();
      if (data.source) {
        setSources(prev => [...prev, data.source]);
        setNewSourceUrl('');
        setNewSourceName('');
        toast.success('Source URL added!');
      }
    } catch {
      toast.error('Failed to add source');
    } finally {
      setIsAddingSource(false);
    }
  };

  const handleDeleteSource = async (id: string) => {
    try {
      await fetch(`/api/intelligence/sources/${id}`, { method: 'DELETE' });
      setSources(prev => prev.filter(s => s.id !== id));
      toast.success('Source removed');
    } catch {
      toast.error('Failed to remove source');
    }
  };

  const handleFetchTrends = async () => {
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
      toast.success(`${data.topics?.length || 0} trending topics found!`);
    } catch {
      toast.error('Failed to fetch trends');
    } finally {
      setLoadingTrends(false);
    }
  };

  const handleGeneratePost = async (topic: string, contentType: string) => {
    setIsGenerating(topic);
    try {
      const res = await fetch('/api/intelligence/generate-post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, targetType: contentType }),
      });
      const data = await res.json();
      if (data.post) {
        toast.success(`Post generated! ${data.autoPublishEnabled ? 'Auto-published! 🚀' : 'Saved as draft 📝'}`);
        await fetchStatus();
      }
    } catch {
      toast.error('Failed to generate post');
    } finally {
      setIsGenerating(null);
    }
  };

  const StatusCard = ({ label, value, icon: Icon, color }: { label: string; value: any; icon: any; color: string }) => (
    <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex items-center gap-4">
      <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: `${color}20` }}>
        <Icon className="w-5 h-5" style={{ color }} />
      </div>
      <div>
        <p className="text-2xl font-bold text-slate-800">{value}</p>
        <p className="text-xs text-slate-500">{label}</p>
      </div>
    </div>
  );

  const TABS = [
    { id: 'overview', label: 'Overview', icon: Activity },
    { id: 'sources', label: 'Sources', icon: Globe },
    { id: 'trends', label: 'Trends', icon: TrendingUp },
    { id: 'activity', label: 'Activity Log', icon: Clock },
  ] as const;

  if (loadingStatus) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #1e3a5f, #2563eb)' }}>
            <Brain className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800">Website Intelligence</h2>
            <p className="text-sm text-slate-500">Autonomous AI-powered website management</p>
          </div>
        </div>

        {/* Auto-Publish Toggle */}
        <button
          onClick={handleToggleAutoPublish}
          disabled={togglingPublish}
          className={`flex items-center gap-2.5 px-5 py-2.5 rounded-xl font-bold text-sm transition-all shadow-md ${
            status?.autoPublishEnabled
              ? 'text-white'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
          style={status?.autoPublishEnabled ? { background: 'linear-gradient(135deg, #16a34a, #15803d)' } : {}}
        >
          {togglingPublish ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : status?.autoPublishEnabled ? (
            <Power className="w-4 h-4" />
          ) : (
            <PowerOff className="w-4 h-4" />
          )}
          {status?.autoPublishEnabled ? 'Auto-Publish ON' : 'Draft Mode'}
        </button>
      </div>

      {/* Auto-publish notice */}
      <div className={`rounded-xl px-4 py-3 text-sm flex items-start gap-2.5 ${
        status?.autoPublishEnabled
          ? 'bg-green-50 border border-green-200 text-green-700'
          : 'bg-amber-50 border border-amber-200 text-amber-700'
      }`}>
        {status?.autoPublishEnabled
          ? <><CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" /> <span><strong>Auto-Publish is ON.</strong> AI-generated content will be published directly to the website.</span></>
          : <><AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" /> <span><strong>Draft Mode is ON.</strong> AI-generated content will be saved as drafts for your review before publishing.</span></>
        }
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatusCard label="Sources Monitored" value={status?.sourcesCount || 0} icon={Globe} color="#2563eb" />
        <StatusCard label="Activities Logged" value={status?.activityCount || 0} icon={Activity} color="#16a34a" />
        <StatusCard label="Errors Detected" value={status?.errorCount || 0} icon={AlertCircle} color="#ef4444" />
        <StatusCard label="Last Action" value={status?.lastActivity ? '✅ Recent' : '—'} icon={Clock} color="#7c3aed" />
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-slate-100 rounded-xl">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab.id
                ? 'bg-white text-slate-800 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <tab.icon className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* ── OVERVIEW TAB ─────────────────────────────────────── */}
      {activeTab === 'overview' && (
        <div className="space-y-4">
          {/* Niche Config */}
          <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
            <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
              <Search className="w-4 h-4 text-blue-500" /> Niche / Keywords Configuration
            </h3>
            <div className="flex gap-3">
              <input
                value={niche}
                onChange={e => setNiche(e.target.value)}
                placeholder="e.g. government jobs India, SSC, UPSC, Railway"
                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-700 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50"
              />
              <button
                onClick={handleFetchTrends}
                disabled={loadingTrends}
                className="px-4 py-2.5 rounded-xl text-white text-sm font-bold flex items-center gap-2 transition-all"
                style={{ background: 'linear-gradient(135deg, #7c3aed, #2563eb)' }}
              >
                {loadingTrends ? <Loader2 className="w-4 h-4 animate-spin" /> : <TrendingUp className="w-4 h-4" />}
                Find Trends
              </button>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
            <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
              <Zap className="w-4 h-4 text-yellow-500" /> Quick Generate
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Latest Sarkari Jobs Post', type: 'job', icon: '💼' },
                { label: 'Admit Card Update', type: 'admit_card', icon: '🎫' },
                { label: 'Result Notification', type: 'result', icon: '📊' },
                { label: 'Scholarship Alert', type: 'scholarship', icon: '🎓' },
              ].map(item => (
                <button
                  key={item.type}
                  onClick={() => handleGeneratePost(`Latest ${item.label} 2024-25`, item.type)}
                  disabled={isGenerating !== null}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50 transition-all text-left disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <span className="text-xl">{item.icon}</span>
                  <div>
                    <p className="text-sm font-semibold text-slate-700">{item.label}</p>
                    <p className="text-xs text-slate-400">AI will generate + {status?.autoPublishEnabled ? 'publish' : 'draft'}</p>
                  </div>
                  {isGenerating === `Latest ${item.label} 2024-25` && (
                    <Loader2 className="w-4 h-4 animate-spin text-blue-500 ml-auto" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── SOURCES TAB ──────────────────────────────────────── */}
      {activeTab === 'sources' && (
        <div className="space-y-4">
          {/* Add Source */}
          <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
            <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
              <Plus className="w-4 h-4 text-green-500" /> Add Source URL
            </h3>
            <div className="space-y-3">
              <input
                value={newSourceName}
                onChange={e => setNewSourceName(e.target.value)}
                placeholder="Source name (e.g. SSC Official Site)"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50"
              />
              <div className="flex gap-3">
                <input
                  value={newSourceUrl}
                  onChange={e => setNewSourceUrl(e.target.value)}
                  placeholder="https://ssc.nic.in"
                  className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50"
                  onKeyDown={e => e.key === 'Enter' && handleAddSource()}
                />
                <button
                  onClick={handleAddSource}
                  disabled={isAddingSource || !newSourceUrl.trim()}
                  className="px-5 py-2.5 rounded-xl text-white text-sm font-bold flex items-center gap-2 disabled:opacity-50"
                  style={{ background: 'linear-gradient(135deg, #1e3a5f, #2563eb)' }}
                >
                  {isAddingSource ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  Add
                </button>
              </div>
            </div>
          </div>

          {/* Source List */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-50">
              <h3 className="font-bold text-slate-800">Monitored Sources ({sources.length})</h3>
            </div>
            {sources.length === 0 ? (
              <div className="py-12 text-center">
                <Globe className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                <p className="text-slate-400 text-sm">No sources added yet</p>
                <p className="text-slate-400 text-xs mt-1">Add government job websites to monitor</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-50">
                {sources.map(source => (
                  <div key={source.id} className="flex items-center justify-between px-5 py-4 hover:bg-slate-50 transition-all">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                        <Globe className="w-4 h-4 text-blue-500" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-700">{source.name}</p>
                        <p className="text-xs text-slate-400 truncate max-w-xs">{source.url}</p>
                        {source.lastScraped && (
                          <p className="text-xs text-green-500">Last scraped: {new Date(source.lastScraped).toLocaleDateString('en-IN')}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleGeneratePost(`Latest updates from ${source.name}`, 'job')}
                        disabled={isGenerating !== null}
                        className="px-3 py-1.5 text-xs font-bold text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-all"
                      >
                        Generate Post
                      </button>
                      <button
                        onClick={() => handleDeleteSource(source.id)}
                        className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg transition-all"
                      >
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

      {/* ── TRENDS TAB ───────────────────────────────────────── */}
      {activeTab === 'trends' && (
        <div className="space-y-3">
          {loadingTrends ? (
            <div className="py-16 text-center">
              <Loader2 className="w-10 h-10 animate-spin text-blue-500 mx-auto mb-3" />
              <p className="text-slate-500 text-sm">AI is searching for trending topics...</p>
              <p className="text-slate-400 text-xs mt-1">Using Gemini + Google Search</p>
            </div>
          ) : trends.length === 0 ? (
            <div className="py-12 text-center bg-white rounded-2xl border border-slate-100">
              <TrendingUp className="w-10 h-10 text-slate-200 mx-auto mb-3" />
              <p className="text-slate-400 text-sm">No trends fetched yet</p>
              <button
                onClick={handleFetchTrends}
                className="mt-4 px-5 py-2.5 rounded-xl text-white text-sm font-bold"
                style={{ background: 'linear-gradient(135deg, #7c3aed, #2563eb)' }}
              >
                Fetch Trending Topics
              </button>
            </div>
          ) : (
            trends.map((trend, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs px-2 py-0.5 rounded-full font-bold uppercase"
                        style={{ background: '#eff6ff', color: '#2563eb' }}>
                        {trend.contentType}
                      </span>
                      <span className={`text-xs font-bold ${
                        trend.relevanceScore >= 80 ? 'text-green-600' : 'text-amber-600'
                      }`}>
                        {trend.relevanceScore}% relevant
                      </span>
                    </div>
                    <h4 className="font-bold text-slate-800 text-sm mb-1">{trend.title}</h4>
                    <p className="text-xs text-slate-500 leading-relaxed">{trend.summary}</p>
                  </div>
                  <button
                    onClick={() => handleGeneratePost(trend.title, trend.contentType)}
                    disabled={isGenerating !== null}
                    className="flex-shrink-0 px-3 py-2 rounded-xl text-xs font-bold text-white flex items-center gap-1.5 disabled:opacity-50"
                    style={{ background: 'linear-gradient(135deg, #1e3a5f, #2563eb)' }}
                  >
                    {isGenerating === trend.title ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Sparkles className="w-3.5 h-3.5" />
                    )}
                    Create Post
                  </button>
                </div>
              </motion.div>
            ))
          )}
        </div>
      )}

      {/* ── ACTIVITY LOG TAB ─────────────────────────────────── */}
      {activeTab === 'activity' && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-50 flex items-center justify-between">
            <h3 className="font-bold text-slate-800">Activity Log ({activityLogs.length})</h3>
            <button onClick={fetchStatus} className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-all">
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
          {activityLogs.length === 0 ? (
            <div className="py-12 text-center">
              <Activity className="w-10 h-10 text-slate-200 mx-auto mb-3" />
              <p className="text-slate-400 text-sm">No activity logged yet</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-50 max-h-[500px] overflow-y-auto">
              {activityLogs.map(log => (
                <div
                  key={log.id}
                  className="px-5 py-3.5 hover:bg-slate-50 transition-all cursor-pointer"
                  onClick={() => setExpandedLog(expandedLog === log.id ? null : log.id)}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                      log.status === 'success' ? 'bg-green-400' :
                      log.status === 'failed' ? 'bg-red-400' : 'bg-yellow-400'
                    }`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-700 truncate">{log.action}</p>
                      <p className="text-xs text-slate-400">
                        {new Date(log.timestamp).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
                      </p>
                    </div>
                    {expandedLog === log.id
                      ? <ChevronDown className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                      : <ChevronRight className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                    }
                  </div>
                  <AnimatePresence>
                    {expandedLog === log.id && (
                      <motion.p
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="text-xs text-slate-500 mt-2 pl-5 bg-slate-50 rounded-lg p-2 overflow-hidden"
                      >
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
