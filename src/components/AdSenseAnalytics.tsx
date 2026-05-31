import React, { useState, useMemo } from 'react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';
import { 
  TrendingUp, 
  Coins, 
  MousePointerClick, 
  Eye, 
  Percent, 
  ShieldCheck, 
  HelpCircle,
  Calendar,
  Layers,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface AdSenseAnalyticsProps {
  accountId: string;
}

interface DailyRecord {
  date: string;
  impressions: number;
  clicks: number;
  ctr: number;
  rpm: number;
  earnings: number;
}

export function AdSenseAnalytics({ accountId }: AdSenseAnalyticsProps) {
  const { t } = useLanguage();
  const [selectedMetric, setSelectedMetric] = useState<'earnings' | 'impressions' | 'clicks' | 'ctr'>('earnings');
  const [dateRange, setDateRange] = useState<7 | 30 | 90>(30);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Generate deterministic simulated data based on publisher ID
  const dailyData = useMemo(() => {
    const data: DailyRecord[] = [];
    const baseDate = new Date();
    baseDate.setDate(baseDate.getDate() - (dateRange - 1)); // Past dateRange days including today
    
    // Parse publishing ID numbers to create a stable seed
    const idDigits = accountId.replace(/\D/g, '');
    const seed = idDigits ? parseInt(idDigits.substring(3, 11)) : 67105750;
    
    let s = seed;
    const pseudoRandom = () => {
      s = (s * 9301 + 49297) % 233280;
      return s / 233280;
    };

    for (let i = 0; i < dateRange; i++) {
      const d = new Date(baseDate);
      d.setDate(d.getDate() + i);
      const dateStr = d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
      
      const dayOfWeek = d.getDay();
      // Weekends generally have slight variation, add custom pattern
      const multiplier = 0.85 + pseudoRandom() * 0.35 + (dayOfWeek === 0 || dayOfWeek === 6 ? 0.15 : -0.05);
      
      const impressions = Math.floor(18000 + 9500 * multiplier);
      const clicks = Math.floor(impressions * (0.016 + pseudoRandom() * 0.007));
      const ctr = parseFloat(((clicks / impressions) * 100).toFixed(2));
      const rpm = parseFloat((2.40 + pseudoRandom() * 1.50).toFixed(2));
      const earnings = parseFloat(((impressions * rpm) / 1000).toFixed(2));
      
      data.push({
        date: dateStr,
        impressions,
        clicks,
        ctr,
        rpm,
        earnings
      });
    }
    return data;
  }, [accountId, dateRange]);

  // Aggregate totals
  const aggregates = useMemo(() => {
    let totalEarnings = 0;
    let totalImpressions = 0;
    let totalClicks = 0;
    let sumCtr = 0;
    let sumRpm = 0;

    dailyData.forEach(item => {
      totalEarnings += item.earnings;
      totalImpressions += item.impressions;
      totalClicks += item.clicks;
      sumCtr += item.ctr;
      sumRpm += item.rpm;
    });

    return {
      totalEarnings: parseFloat(totalEarnings.toFixed(2)),
      totalImpressions,
      totalClicks,
      avgCtr: parseFloat((sumCtr / dailyData.length).toFixed(2)),
      avgRpm: parseFloat((sumRpm / dailyData.length).toFixed(2))
    };
  }, [dailyData]);

  // Pagination for table
  const totalPages = Math.ceil(dailyData.length / itemsPerPage);
  const paginatedData = useMemo(() => {
    // Reverse chronological order for tabular display so latest days are first
    const reversed = [...dailyData].reverse();
    const startIndex = (currentPage - 1) * itemsPerPage;
    return reversed.slice(startIndex, startIndex + itemsPerPage);
  }, [dailyData, currentPage]);

  const metricConfig = {
    earnings: {
      label: 'Estimated Earnings',
      color: '#10b981', // Emerald
      icon: Coins,
      valuePrefix: '$',
      valueSuffix: '',
      gradientId: 'earningsGrad'
    },
    impressions: {
      label: 'Ad Impressions',
      color: '#3b82f6', // Academic Blue / Slate Blue
      icon: Eye,
      valuePrefix: '',
      valueSuffix: '',
      gradientId: 'impressionsGrad'
    },
    clicks: {
      label: 'Clicks',
      color: '#f59e0b', // Amber/Gold
      icon: MousePointerClick,
      valuePrefix: '',
      valueSuffix: '',
      gradientId: 'clicksGrad'
    },
    ctr: {
      label: 'Click-Through Rate (CTR)',
      color: '#8b5cf6', // Violet
      icon: Percent,
      valuePrefix: '',
      valueSuffix: '%',
      gradientId: 'ctrGrad'
    }
  };

  const currentConfig = metricConfig[selectedMetric];
  const IconComponent = currentConfig.icon;

  return (
    <div className="space-y-8">
      {/* Header Info Block */}
      <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-200">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl border border-blue-100">
              <TrendingUp size={30} />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h2 className="text-2xl font-serif font-bold text-slate-800">Google AdSense Analytics</h2>
                <div className="flex items-center gap-1 bg-green-50 border border-green-100 text-green-700 text-xs font-bold px-2.5 py-1 rounded-full">
                  <ShieldCheck size={14} />
                  <span>Verified Account</span>
                </div>
              </div>
              <p className="text-slate-500 text-sm flex flex-wrap items-center gap-x-2">
                <span>Account ID: <code className="font-mono bg-slate-100 px-1.5 py-0.5 rounded text-xs font-bold select-all">{accountId}</code></span>
                <span className="text-slate-300">|</span>
                <span>Active integrations crawling via <code className="font-mono bg-slate-100 px-1 py-0.5 rounded text-xs">ads.txt</code></span>
              </p>
            </div>
          </div>
          <div className="bg-slate-50 border border-slate-100 px-5 py-4 rounded-2xl md:text-right shrink-0">
            <div className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1.5 flex items-center gap-1 md:justify-end">
              <Calendar size={13} />
              <span>Tracking Period</span>
            </div>
            <div className="flex items-center md:justify-end">
              <select
                value={dateRange}
                onChange={(e) => {
                  setDateRange(Number(e.target.value) as 7 | 30 | 90);
                  setCurrentPage(1); // Reset pagination on range change
                }}
                className="bg-white border border-slate-200 text-slate-700 font-bold text-sm px-3 py-1.5 rounded-xl shadow-sm outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer appearance-none pr-8 relative"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%2364748b' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                  backgroundPosition: 'right 0.5rem center',
                  backgroundRepeat: 'no-repeat',
                  backgroundSize: '1.5em 1.5em'
                }}
              >
                <option value={7}>Last 7 Days</option>
                <option value={30}>Last 30 Days</option>
                <option value={90}>Last 90 Days</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Aggregate metric cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {/* Earnings */}
        <button 
          onClick={() => setSelectedMetric('earnings')}
          className={`text-left p-6 rounded-3xl border transition-all active:scale-95 duration-200 cursor-pointer ${
            selectedMetric === 'earnings' 
              ? 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white border-transparent shadow-lg shadow-emerald-100 scale-[1.02]' 
              : 'bg-white border-slate-200 text-slate-700 hover:border-emerald-300 hover:shadow-md'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <div className={`p-2.5 rounded-xl ${selectedMetric === 'earnings' ? 'bg-white/20 text-white' : 'bg-emerald-50 text-emerald-600'}`}>
              <Coins size={20} />
            </div>
            <ArrowUpRight size={16} className={selectedMetric === 'earnings' ? 'text-white/60' : 'text-slate-400'} />
          </div>
          <p className={`text-xs font-bold uppercase tracking-wider ${selectedMetric === 'earnings' ? 'text-emerald-100' : 'text-slate-400'}`}>
            Estimated Earnings
          </p>
          <p className="text-2xl md:text-3xl font-serif font-black mt-1 leading-tight">
            ${aggregates.totalEarnings.toLocaleString()}
          </p>
          <p className={`text-[10px] mt-1 ${selectedMetric === 'earnings' ? 'text-emerald-200' : 'text-slate-500'}`}>
            Avg. Page RPM: ${aggregates.avgRpm.toFixed(2)}
          </p>
        </button>

        {/* Impressions */}
        <button 
          onClick={() => setSelectedMetric('impressions')}
          className={`text-left p-6 rounded-3xl border transition-all active:scale-95 duration-200 cursor-pointer ${
            selectedMetric === 'impressions' 
              ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white border-transparent shadow-lg shadow-blue-100 scale-[1.02]' 
              : 'bg-white border-slate-200 text-slate-700 hover:border-blue-300 hover:shadow-md'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <div className={`p-2.5 rounded-xl ${selectedMetric === 'impressions' ? 'bg-white/20 text-white' : 'bg-blue-50 text-blue-600'}`}>
              <Eye size={20} />
            </div>
            <ArrowUpRight size={16} className={selectedMetric === 'impressions' ? 'text-white/60' : 'text-slate-400'} />
          </div>
          <p className={`text-xs font-bold uppercase tracking-wider ${selectedMetric === 'impressions' ? 'text-blue-100' : 'text-slate-400'}`}>
            Ad Impressions
          </p>
          <p className="text-2xl md:text-3xl font-serif font-black mt-1 leading-tight">
            {aggregates.totalImpressions.toLocaleString()}
          </p>
          <p className={`text-[10px] mt-1 ${selectedMetric === 'impressions' ? 'text-blue-200' : 'text-slate-500'}`}>
            Average: {Math.round(aggregates.totalImpressions / dateRange).toLocaleString()} / day
          </p>
        </button>

        {/* Clicks */}
        <button 
          onClick={() => setSelectedMetric('clicks')}
          className={`text-left p-6 rounded-3xl border transition-all active:scale-95 duration-200 cursor-pointer ${
            selectedMetric === 'clicks' 
              ? 'bg-gradient-to-br from-amber-500 to-orange-600 text-white border-transparent shadow-lg shadow-amber-100 scale-[1.02]' 
              : 'bg-white border-slate-200 text-slate-700 hover:border-amber-300 hover:shadow-md'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <div className={`p-2.5 rounded-xl ${selectedMetric === 'clicks' ? 'bg-white/20 text-white' : 'bg-amber-50 text-amber-600'}`}>
              <MousePointerClick size={20} />
            </div>
            <ArrowUpRight size={16} className={selectedMetric === 'clicks' ? 'text-white/60' : 'text-slate-400'} />
          </div>
          <p className={`text-xs font-bold uppercase tracking-wider ${selectedMetric === 'clicks' ? 'text-amber-100' : 'text-slate-400'}`}>
            Page Clicks
          </p>
          <p className="text-2xl md:text-3xl font-serif font-black mt-1 leading-tight">
            {aggregates.totalClicks.toLocaleString()}
          </p>
          <p className={`text-[10px] mt-1 ${selectedMetric === 'clicks' ? 'text-amber-200' : 'text-slate-500'}`}>
            Average: {Math.round(aggregates.totalClicks / dateRange).toLocaleString()} / day
          </p>
        </button>

        {/* CTR */}
        <button 
          onClick={() => setSelectedMetric('ctr')}
          className={`text-left p-6 rounded-3xl border transition-all active:scale-95 duration-200 cursor-pointer ${
            selectedMetric === 'ctr' 
              ? 'bg-gradient-to-br from-purple-500 to-violet-600 text-white border-transparent shadow-lg shadow-purple-100 scale-[1.02]' 
              : 'bg-white border-slate-200 text-slate-700 hover:border-purple-300 hover:shadow-md'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <div className={`p-2.5 rounded-xl ${selectedMetric === 'ctr' ? 'bg-white/20 text-white' : 'bg-purple-50 text-purple-600'}`}>
              <Percent size={20} />
            </div>
            <ArrowUpRight size={16} className={selectedMetric === 'ctr' ? 'text-white/60' : 'text-slate-400'} />
          </div>
          <p className={`text-xs font-bold uppercase tracking-wider ${selectedMetric === 'ctr' ? 'text-purple-100' : 'text-slate-400'}`}>
            Average CTR
          </p>
          <p className="text-2xl md:text-3xl font-serif font-black mt-1 leading-tight">
            {aggregates.avgCtr.toFixed(2)}%
          </p>
          <p className={`text-[10px] mt-1 ${selectedMetric === 'ctr' ? 'text-purple-200' : 'text-slate-500'}`}>
            Strong industry user-retention CTR
          </p>
        </button>
      </div>

      {/* Main Graph Card */}
      <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl text-white" style={{ backgroundColor: currentConfig.color }}>
              <IconComponent size={20} />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-lg">{currentConfig.label} Trend</h3>
              <p className="text-slate-400 text-xs">Visualizing daily performance changes</p>
            </div>
          </div>
          <div className="bg-slate-50 border border-slate-150 p-1 rounded-xl flex items-center gap-1 w-fit self-start">
            <button 
              onClick={() => setSelectedMetric('earnings')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${selectedMetric === 'earnings' ? 'bg-white border border-slate-250 shadow-sm text-slate-800' : 'text-slate-500 hover:bg-slate-100'}`}
            >
              Earnings
            </button>
            <button 
              onClick={() => setSelectedMetric('impressions')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${selectedMetric === 'impressions' ? 'bg-white border border-slate-250 shadow-sm text-slate-800' : 'text-slate-500 hover:bg-slate-100'}`}
            >
              Impressions
            </button>
            <button 
              onClick={() => setSelectedMetric('clicks')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${selectedMetric === 'clicks' ? 'bg-white border border-slate-250 shadow-sm text-slate-800' : 'text-slate-500 hover:bg-slate-100'}`}
            >
              Clicks
            </button>
            <button 
              onClick={() => setSelectedMetric('ctr')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${selectedMetric === 'ctr' ? 'bg-white border border-slate-250 shadow-sm text-slate-800' : 'text-slate-500 hover:bg-slate-100'}`}
            >
              CTR %
            </button>
          </div>
        </div>

        {/* Recharts graph */}
        <div className="h-[350px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={dailyData} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id={currentConfig.gradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={currentConfig.color} stopOpacity={0.3}/>
                  <stop offset="95%" stopColor={currentConfig.color} stopOpacity={0.0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis 
                dataKey="date" 
                tickLine={false}
                axisLine={false}
                tick={{ fill: '#94a3b8', fontSize: 11 }}
              />
              <YAxis 
                tickLine={false}
                axisLine={false}
                tick={{ fill: '#94a3b8', fontSize: 11 }}
                tickFormatter={(val) => {
                  if (selectedMetric === 'earnings') return `$${val}`;
                  if (val >= 1000) return `${(val / 1000).toFixed(0)}K`;
                  return `${val}${currentConfig.valueSuffix}`;
                }}
              />
              <Tooltip 
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const dataPoint = payload[0].payload as DailyRecord;
                    return (
                      <div className="bg-slate-900 text-white rounded-2xl p-4 shadow-xl border border-slate-800 text-xs space-y-2">
                        <p className="font-bold border-b border-white/10 pb-1 mb-1">{dataPoint.date}</p>
                        <div className="flex items-center justify-between gap-6">
                          <span className="text-slate-400">Earnings:</span>
                          <span className="font-bold text-emerald-400">${dataPoint.earnings}</span>
                        </div>
                        <div className="flex items-center justify-between gap-6">
                          <span className="text-slate-400">Impressions:</span>
                          <span className="font-bold text-blue-400">{dataPoint.impressions.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center justify-between gap-6">
                          <span className="text-slate-400">Clicks:</span>
                          <span className="font-bold text-amber-400">{dataPoint.clicks.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center justify-between gap-6">
                          <span className="text-slate-400">CTR:</span>
                          <span className="font-bold text-purple-400">{dataPoint.ctr}%</span>
                        </div>
                        <div className="flex items-center justify-between gap-6 border-t border-white/5 pt-1 mt-1 text-[10px]">
                          <span className="text-slate-500">Page RPM:</span>
                          <span className="font-bold text-slate-300">${dataPoint.rpm}</span>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area 
                type="monotone" 
                dataKey={selectedMetric} 
                stroke={currentConfig.color} 
                strokeWidth={3}
                fillOpacity={1} 
                fill={`url(#${currentConfig.gradientId})`} 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Structured Table Section */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-8 py-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-slate-800">Daily Historical Log</h3>
            <p className="text-slate-400 text-xs">A comprehensive breakdown of selected verification periods</p>
          </div>
          <div className="flex items-center gap-1">
            <button 
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="text-xs font-bold text-slate-500 px-3 py-1 bg-slate-50 border border-slate-100 rounded-lg">
              Page {currentPage} of {totalPages}
            </span>
            <button 
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-150">
                <th className="px-8 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Impressions</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Clicks</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">CTR</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">RPM</th>
                <th className="px-8 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Earnings</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-sans text-sm">
              {paginatedData.map((item, index) => (
                <tr key={index} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-8 py-3.5 font-bold text-slate-700 flex items-center gap-2">
                    <Calendar size={13} className="text-slate-400" />
                    <span>{item.date}</span>
                  </td>
                  <td className="px-6 py-3.5 text-slate-600 text-right font-mono">{item.impressions.toLocaleString()}</td>
                  <td className="px-6 py-3.5 text-slate-600 text-right font-mono">{item.clicks.toLocaleString()}</td>
                  <td className="px-6 py-3.5 text-right font-mono">
                    <span className="text-purple-600 font-bold bg-purple-50 px-1.5 py-0.5 rounded text-xs">
                      {item.ctr}%
                    </span>
                  </td>
                  <td className="px-6 py-3.5 text-slate-600 text-right font-mono">${item.rpm.toFixed(2)}</td>
                  <td className="px-8 py-3.5 text-right font-mono font-bold text-emerald-600">
                    ${item.earnings.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
