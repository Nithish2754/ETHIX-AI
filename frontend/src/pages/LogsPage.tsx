import { useState, useEffect, useMemo } from 'react';
import { ClipboardList, Search, Clock, ChevronDown, ChevronUp, Fingerprint } from 'lucide-react';
import { getLogs, clearLogs, DOMAINS, type LogEntry, type Domain } from '../engine';
import { useToast } from '../ToastContext';

const fmtDate = (iso: string) => new Date(iso).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

function LogRow({ log }: { log: LogEntry }) {
  const [open, setOpen] = useState(false);
  const d = DOMAINS[log.domain];

  return (
    <>
      <tr onClick={() => setOpen(!open)} style={{ cursor: 'pointer' }} className={open ? 'active-row' : ''}>
        <td>
           <span className="badge" style={{ background: d.color + '15', color: d.color }}>{d.badge}</span>
        </td>
        <td>
           <div style={{ fontSize: 13, fontWeight: 700 }}>{log.prediction.decision}</div>
           <div style={{ fontSize: 10, color: '#475569' }}>{fmtDate(log.timestamp)}</div>
        </td>
        <td>
           <span className={`badge ${log.bias.biasDetected ? 'badge-danger' : 'badge-success'}`}>
              {log.bias.biasDetected ? 'BIASED' : 'FAIR'}
           </span>
        </td>
        <td>
           <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div className="progress-track" style={{ width: 60 }}>
                 <div className="progress-fill" style={{ width: `${log.bias.fairnessScore}%`, background: log.bias.fairnessScore > 80 ? '#10b981' : '#f59e0b' }} />
              </div>
              <span style={{ fontSize: 11, fontWeight: 800 }}>{log.bias.fairnessScore}%</span>
           </div>
        </td>
        <td style={{ color: '#475569' }}>{open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}</td>
      </tr>
      {open && (
        <tr className="fade-up">
          <td colSpan={5} style={{ padding: 0, background: 'rgba(255,255,255,0.01)' }}>
            <div style={{ padding: 24, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 32 }}>
               <div>
                  <div className="stat-label" style={{ marginBottom: 12 }}>Input Parameters</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                     {Object.entries(log.input).map(([k, v]) => (
                        <div key={k} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11 }}>
                           <span style={{ color: '#64748b', textTransform: 'capitalize' }}>{k}</span>
                           <span style={{ fontWeight: 700 }}>{v}</span>
                        </div>
                     ))}
                  </div>
               </div>
               <div>
                  <div className="stat-label" style={{ marginBottom: 12 }}>Audit Trace</div>
                  <div style={{ fontSize: 12 }}>Original: <span style={{ fontWeight: 700 }}>{log.bias.originalDecision}</span></div>
                  <div style={{ fontSize: 12 }}>Corrected: <span style={{ fontWeight: 700, color: '#10b981' }}>{log.bias.correctedDecision}</span></div>
               </div>
               <div>
                  <div className="stat-label" style={{ marginBottom: 12 }}>Secured Proof</div>
                  <div className="card" style={{ padding: 12, background: '#030712' }}>
                     <Fingerprint size={14} color="#06b6d4" style={{ marginBottom: 8 }} />
                     <div style={{ fontSize: 9, fontFamily: 'JetBrains Mono', color: '#334155', wordBreak: 'break-all' }}>{log.prediction.blockchainHash}</div>
                  </div>
               </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

export default function LogsPage() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [filter, setFilter] = useState<Domain | 'all'>('all');
  const { addToast } = useToast();

  useEffect(() => {
    const refresh = () => setLogs(getLogs());
    refresh();
    const iv = setInterval(refresh, 5000);
    return () => clearInterval(iv);
  }, []);

  const filtered = useMemo(() => logs.filter(l => filter === 'all' || l.domain === filter), [logs, filter]);

  return (
    <div className="surface-glow" style={{ minHeight: '100vh' }}>
      <header className="page-header">
         <div className="page-header-eyebrow"><ClipboardList size={12} color="#6366f1" /> CROSS-DOMAIN AUDIT</div>
         <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
               <h1 className="page-title">Compliance Ledger</h1>
               <p className="page-sub">Transaction history across all 6 AI evaluation sectors.</p>
            </div>
            <button onClick={() => { clearLogs(); setLogs([]); addToast('Logs cleared', 'info'); }} className="btn-danger">PURGE ALL</button>
         </div>
      </header>

      <main className="page-body">
         <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
            <button onClick={() => setFilter('all')} className={`btn-ghost ${filter === 'all' ? 'active' : ''}`} style={{ fontSize: 11 }}>ALL</button>
            {(Object.keys(DOMAINS) as Domain[]).map(d => (
               <button key={d} onClick={() => setFilter(d)} className={`btn-ghost ${filter === d ? 'active' : ''}`} style={{ fontSize: 11, color: filter === d ? DOMAINS[d].color : '' }}>
                  {DOMAINS[d].badge}
               </button>
            ))}
         </div>

         <div className="card">
            <table className="data-table">
               <thead>
                  <tr><th>Sector</th><th>Result</th><th>Audit</th><th>Fairness</th><th /></tr>
               </thead>
               <tbody>
                  {filtered.map(l => <LogRow key={l.id} log={l} />)}
               </tbody>
            </table>
         </div>
      </main>
    </div>
  );
}
