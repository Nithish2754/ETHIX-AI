import { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Zap, ShieldCheck, AlertTriangle, Activity, Briefcase, IndianRupee, HeartPulse, Trophy, Car, GraduationCap } from 'lucide-react';
import { getStats, DOMAINS, type DashboardStats, type Domain } from '../engine';

const domainIcons: Record<Domain, any> = {
  hiring: Briefcase, loan: IndianRupee, healthcare: HeartPulse,
  promotion: Trophy, insurance: Car, scholarship: GraduationCap
};

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    setStats(getStats());
  }, []);

  if (!stats) return null;

  return (
    <div className="surface-glow" style={{ minHeight: '100vh' }}>
      <header className="page-header">
        <div className="page-header-eyebrow">
          <Activity size={12} color="#6366f1" /> CROSS-DOMAIN ANALYTICS v4.6
        </div>
        <h1 className="page-title">Global Bias Detection System</h1>
        <p className="page-sub">Real-time detection and analysis of algorithmic bias across 6 specialized sectors.</p>
      </header>

      <main className="page-body">
        {/* Primary Metrics Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20, marginBottom: 32 }}>
          <div className="stat-card stat-card-purple">
            <div className="stat-icon stat-icon-purple"><Activity size={20} color="#8b5cf6" /></div>
            <div className="stat-label">Total Evaluations</div>
            <div className="stat-value">{stats.total}</div>
            <div className="stat-sub">Across all sectors</div>
          </div>
          
          <div className="stat-card stat-card-red">
            <div className="stat-icon stat-icon-red"><AlertTriangle size={20} color="#ef4444" /></div>
            <div className="stat-label">Bias Cases Detected</div>
            <div className="stat-value" style={{ color: '#ef4444' }}>{stats.biasCases}</div>
            <div className="stat-sub">Manual & Auto intercepts</div>
          </div>

          <div className="stat-card stat-card-cyan">
            <div className="stat-icon stat-icon-cyan"><ShieldCheck size={20} color="#06b6d4" /></div>
            <div className="stat-label">Overall Bias Rate</div>
            <div className="stat-value">{stats.biasRate}%</div>
            <div className="stat-sub">Systemic frequency</div>
          </div>

          <div className="stat-card stat-card-green">
            <div className="stat-icon stat-icon-green"><Activity size={20} color="#10b981" /></div>
            <div className="stat-label">Avg Fairness Score</div>
            <div className="stat-value">{stats.avgFairness}%</div>
            <div className="stat-sub">Secondary metric</div>
          </div>
        </div>

        {/* Sector Bias Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
          {(Object.keys(DOMAINS) as Domain[]).map(id => {
            const d = DOMAINS[id];
            const s = stats.domainStats[id];
            const Icon = domainIcons[id];
            const hasBias = s.biasCases > 0;
            
            return (
              <div key={id} className="card" style={{ padding: 24, position: 'relative', overflow: 'hidden' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ padding: 8, background: d.color + '15', borderRadius: 8 }}>
                       <Icon size={16} color={d.color} />
                    </div>
                    <span style={{ fontWeight: 900, fontSize: 13, color: '#f1f5f9' }}>{d.badge} SECTOR</span>
                  </div>
                  <div style={{ fontSize: 10, color: '#475569', fontWeight: 800 }}>{s.count} LOGS</div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                   <div>
                      <div className="stat-label" style={{ marginBottom: 4 }}>Bias Status</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 16, fontWeight: 900, color: hasBias ? '#ef4444' : '#10b981' }}>
                         {hasBias ? (
                           <><AlertTriangle size={16} /> BIAS DETECTED ❌</>
                         ) : (
                           <><ShieldCheck size={16} /> NO BIAS ✅</>
                         )}
                      </div>
                   </div>

                   <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                      <div>
                         <div className="stat-label">Bias Rate</div>
                         <div style={{ fontSize: 24, fontWeight: 900, color: hasBias ? '#ef4444' : '#f1f5f9' }}>{s.biasRate}%</div>
                      </div>
                      <div>
                         <div className="stat-label">Fairness Score</div>
                         <div style={{ fontSize: 20, fontWeight: 700, opacity: 0.6 }}>{s.fairness}%</div>
                      </div>
                   </div>

                   <div className="progress-track" style={{ height: 4 }}>
                      <div className="progress-fill" style={{ width: `${100 - s.biasRate}%`, background: d.color }} />
                   </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Global Trend Visualization */}
        <div className="card" style={{ marginTop: 32, padding: 24 }}>
           <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Zap size={16} color="#6366f1" /> Systemic Bias Trend Line
           </div>
           <div style={{ height: 250, width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                 <AreaChart data={stats.trendData}>
                    <defs>
                       <linearGradient id="colorBias" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                       </linearGradient>
                       <linearGradient id="colorFairness" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                       </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                    <XAxis 
                       dataKey="time" 
                       stroke="#475569" 
                       fontSize={10} 
                       tickLine={false} 
                       axisLine={false} 
                    />
                    <YAxis 
                       stroke="#475569" 
                       fontSize={10} 
                       tickLine={false} 
                       axisLine={false} 
                       domain={[0, 100]}
                    />
                    <Tooltip 
                       contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 8, fontSize: 12 }}
                       itemStyle={{ fontWeight: 700 }}
                    />
                    <Area 
                       type="monotone" 
                       dataKey="fairness" 
                       stroke="#10b981" 
                       strokeWidth={3}
                       fillOpacity={1} 
                       fill="url(#colorFairness)" 
                       name="Fairness Score"
                    />
                    <Area 
                       type="monotone" 
                       dataKey="biasRate" 
                       stroke="#ef4444" 
                       strokeWidth={2}
                       fillOpacity={1} 
                       fill="url(#colorBias)" 
                       name="Bias Incident"
                       strokeDasharray="5 5"
                    />
                 </AreaChart>
              </ResponsiveContainer>
           </div>
        </div>
      </main>
    </div>
  );
}
