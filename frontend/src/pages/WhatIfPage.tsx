import { useState, useEffect, useCallback } from 'react';
import { GitCompare, RefreshCw, AlertTriangle, CheckCircle, Briefcase, IndianRupee, HeartPulse } from 'lucide-react';
import { executeAnalysis, DOMAINS, type Domain, type BiasResult } from '../engine';

function DomainTab({ active, onSelect }: { active: Domain; onSelect: (d: Domain) => void }) {
  return (
    <div style={{ display: 'flex', gap: 10, marginBottom: 24 }}>
      {(Object.keys(DOMAINS) as Domain[]).map(id => {
        const Icon = id === 'hiring' ? Briefcase : id === 'loan' ? IndianRupee : HeartPulse;
        const active_ = active === id;
        return (
          <button key={id} onClick={() => onSelect(id)} className={`btn-ghost ${active_ ? 'active' : ''}`} style={{ 
            fontSize: 12, padding: '8px 16px', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 8,
            border: active_ ? `1px solid ${DOMAINS[id].color}40` : '1px solid transparent',
            background: active_ ? DOMAINS[id].color + '10' : 'transparent',
            color: active_ ? DOMAINS[id].color : ''
          }}>
            <Icon size={14} /> {DOMAINS[id].badge}
          </button>
        );
      })}
    </div>
  );
}

function ScenarioCard({ domain, tag, color, input, result, onChange }: { domain: Domain; tag: string; color: string; input: any; result: BiasResult | null; onChange: (k: string, v: any) => void }) {
  const d = DOMAINS[domain];
  return (
    <div className="card fade-up" style={{ padding: 24, borderTop: `4px solid ${color}` }}>
       <div style={{ fontSize: 11, fontWeight: 900, color, marginBottom: 20 }}>{tag.toUpperCase()}</div>
       
       <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {d.fields.slice(0, 4).map(f => (
            <div key={f.id}>
               <label className="field-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>{f.label}</span>
                  {f.type === 'range' && <span style={{ color, fontSize: 10 }}>{input[f.id] ?? 0}</span>}
               </label>
               {f.type === 'select' ? (
                 <select className="field-input" value={input[f.id] || ''} onChange={e => onChange(f.id, e.target.value)}>
                    {f.options?.map(o => <option key={o} value={o}>{o.toUpperCase()}</option>)}
                 </select>
               ) : (
                 <input type="range" className="field-slider" min={f.min} max={f.max} step={f.step} value={input[f.id] ?? 0} onChange={e => onChange(f.id, +e.target.value)} />
               )}
            </div>
          ))}
       </div>

       {result && (
         <div style={{ marginTop: 24, padding: 16, background: 'rgba(0,0,0,0.2)', borderRadius: 12 }}>
            <div style={{ fontSize: 10, color: '#475569', marginBottom: 8 }}>OUTCOME</div>
            <div style={{ fontSize: 24, fontWeight: 900, color: result.correctedDecision === d.outcomeLabels[0] ? '#10b981' : '#ef4444' }}>
               {result.correctedDecision.toUpperCase()}
            </div>
         </div>
       )}
    </div>
  );
}

export default function WhatIfPage() {
  const [domain, setDomain] = useState<Domain>('hiring');
  const [a, setA] = useState<any>({});
  const [b, setB] = useState<any>({});
  const [ra, setRa] = useState<BiasResult | null>(null);
  const [rb, setRb] = useState<BiasResult | null>(null);

  useEffect(() => {
    const init: any = {};
    DOMAINS[domain].fields.forEach(f => {
       if (f.type === 'select') init[f.id] = f.options?.[0];
       else if (f.type === 'range') init[f.id] = (f.min! + f.max!) / 2;
    });
    setA({ ...init });
    setB({ ...init, gender: 'female' });
  }, [domain]);

  const compute = useCallback(async () => {
    if (!a.gender) return;
    const [resA, resB] = await Promise.all([executeAnalysis(domain, a), executeAnalysis(domain, b)]);
    setRa(resA.bias); setRb(resB.bias);
  }, [domain, a, b]);

  useEffect(() => { compute(); }, [compute]);

  const match = ra && rb && ra.correctedDecision === rb.correctedDecision;

  return (
    <div className="surface-glow" style={{ minHeight: '100vh' }}>
      <header className="page-header">
        <div className="page-header-eyebrow"><GitCompare size={12} color="#6366f1" /> CROSS-DOMAIN SIMULATOR</div>
        <h1 className="page-title">Counterfactual Analysis</h1>
        <p className="page-sub">Stress-test AI decisions by varying sensitive attributes across domains.</p>
      </header>

      <main className="page-body">
        <DomainTab active={domain} onSelect={setDomain} />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
           <ScenarioCard domain={domain} tag="Scenario A" color="#6366f1" input={a} result={ra} onChange={(k, v) => setA({ ...a, [k]: v })} />
           <ScenarioCard domain={domain} tag="Scenario B" color="#06b6d4" input={b} result={rb} onChange={(k, v) => setB({ ...b, [k]: v })} />
        </div>

        {ra && rb && (
          <div className="card fade-up" style={{ marginTop: 24, padding: 24, background: match ? 'rgba(16,185,129,0.03)' : 'rgba(239,68,68,0.03)', border: match ? '1px solid rgba(16,185,129,0.1)' : '1px solid rgba(239,68,68,0.1)' }}>
             <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{ background: match ? '#10b981' : '#ef4444', padding: 12, borderRadius: 12 }}>
                   {match ? <CheckCircle size={24} color="white" /> : <AlertTriangle size={24} color="white" />}
                </div>
                <div>
                   <div style={{ fontSize: 18, fontWeight: 900 }}>{match ? 'Demographic Parity Confirmed' : 'Disparate Treatment Detected'}</div>
                   <div style={{ fontSize: 14, color: '#64748b' }}>Changing the sensitive attribute {match ? 'did not' : 'resulted in a'} change the AI outcome for this {domain} case.</div>
                </div>
             </div>
          </div>
        )}
      </main>
    </div>
  );
}
