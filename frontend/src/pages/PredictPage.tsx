import { useState, useEffect } from 'react';
import { Zap, Loader, Fingerprint, Briefcase, IndianRupee, HeartPulse, Trophy, Car, GraduationCap, Activity, ShieldCheck, AlertTriangle, Info, BarChart2, GitCompare, Boxes, Download, CheckCircle2 } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell, LineChart, Line } from 'recharts';
import { executeAnalysis, saveLog, runStressTest, DOMAINS, type Domain } from '../engine';
import { useToast } from '../ToastContext';

const fmtVal = (val: any, id: string) => {
  if (val === undefined || val === null) return '0';
  if (id === 'income' || id === 'loan_amount' || id === 'family_income') return `₹${Number(val).toLocaleString('en-IN')}`;
  return val;
};

export default function PredictPage() {
  const [domain, setDomain] = useState<Domain>('hiring');
  const [tab, setTab] = useState<'single' | 'compare' | 'stress'>('single');
  const [form, setForm] = useState<any>({});
  const [loading, setLoading] = useState(false);
  
  // Single Analysis State
  const [res, setRes] = useState<any>(null);
  
  // Comparison State
  const [compareA, setCompareA] = useState<any>(null);
  const [compareB, setCompareB] = useState<any>(null);

  // Stress Test State
  const [stressRes, setStressRes] = useState<any>(null);

  const { addToast } = useToast();

  useEffect(() => {
    const config = DOMAINS[domain];
    const init: any = {};
    config.fields.forEach(f => {
       if (f.type === 'select') init[f.id] = f.options?.[0];
       else if (f.type === 'range') init[f.id] = (f.min! + f.max!) / 2;
       else init[f.id] = f.min || 0;
    });
    setForm(init); 
    setRes(null); setCompareA(null); setCompareB(null); setStressRes(null);
  }, [domain]);

  const handleRun = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (tab === 'single') {
        const analysis = await executeAnalysis(domain, form);
        saveLog({ domain, input: form, prediction: analysis.prediction, bias: analysis.bias });
        setRes(analysis);
        analysis.bias.biasDetected ? addToast('Bias Detected!', 'danger') : addToast('Fairness Validated.', 'success');
      } 
      else if (tab === 'compare') {
        const analysis = await executeAnalysis(domain, form);
        if (!compareA) setCompareA(analysis);
        else {
           setCompareB(analysis);
           addToast('Comparison Generated', 'info');
        }
      }
      else if (tab === 'stress') {
        const results = await runStressTest(domain, form);
        setStressRes(results);
        addToast('Stress Test Complete', 'success');
      }
    } catch (err) { addToast('Audit failed.', 'danger'); }
    finally { setLoading(false); }
  };

  const handleAutofill = () => {
    const samples: Record<Domain, any> = {
      hiring: { gender: 'female', age: 25, education: 'Masters', experience: 2 },
      loan: { gender: 'male', income: 75000, credit_score: 720, loan_amount: 1500000 },
      healthcare: { gender: 'non-binary', age: 45, health_score: 85, symptoms: 'Medium' },
      promotion: { gender: 'female', experience: 5, perf_score: 92, department: 'Engineering' },
      insurance: { gender: 'male', age: 30, driving_history: 'Good', claim_history: 1 },
      scholarship: { gender: 'female', academic_score: 88, family_income: 200000, category: 'OBC' }
    };
    setForm(samples[domain]);
    addToast('Sample data applied', 'success');
  };

  const exportReport = () => {
    if (!res && !compareB && !stressRes) return;
    
    let content = `ETHIX AI - BIAS ANALYSIS REPORT\n`;
    content += `Generated: ${new Date().toLocaleString()}\n`;
    content += `Domain: ${DOMAINS[domain].label}\n`;
    content += `-------------------------------------------\n\n`;

    if (tab === 'single' && res) {
      content += `ANALYSIS SUMMARY:\n`;
      content += `Decision: ${res.prediction.decision}\n`;
      content += `Bias Detected: ${res.bias.biasDetected ? 'YES' : 'NO'}\n`;
      content += `Fairness Score: ${res.bias.fairnessScore}/100\n`;
      content += `Bias Impact: ${res.bias.biasImpact}%\n`;
    } else if (tab === 'compare' && compareB) {
      content += `COMPARISON MODE:\n`;
      content += `Scenario A Fairness: ${compareA.bias.fairnessScore}%\n`;
      content += `Scenario B Fairness: ${compareB.bias.fairnessScore}%\n`;
      content += `Improvement: ${compareB.bias.fairnessScore - compareA.bias.fairnessScore}%\n`;
    } else if (tab === 'stress' && stressRes) {
      content += `STRESS TEST RESULTS:\n`;
      content += `Total Variations: ${stressRes.total}\n`;
      content += `Biased Cases: ${stressRes.biasedCount}\n`;
      content += `Average Fairness: ${stressRes.avgFairness}%\n`;
    }

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ethix_ai_report_${Date.now()}.txt`;
    a.click();
    addToast('Report downloaded successfully', 'success');
  };

  return (
    <div className="surface-glow" style={{ minHeight: '100vh' }}>
      <header className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <div className="page-header-eyebrow"><Activity size={12} color="#6366f1" /> AUDIT ENGINE v4.6</div>
          <h1 className="page-title">Ethical Prediction</h1>
          <p className="page-sub">Advanced bias detection and robustness stress-testing.</p>
        </div>
        
        <div style={{ display: 'flex', gap: 12, marginBottom: 4 }}>
           <button onClick={() => setTab('single')} className={`btn-ghost ${tab === 'single' ? 'active' : ''}`} style={{ fontSize: 12 }}>
              <Zap size={14} /> Single
           </button>
           <button onClick={() => setTab('compare')} className={`btn-ghost ${tab === 'compare' ? 'active' : ''}`} style={{ fontSize: 12 }}>
              <GitCompare size={14} /> Compare
           </button>
           <button onClick={() => setTab('stress')} className={`btn-ghost ${tab === 'stress' ? 'active' : ''}`} style={{ fontSize: 12 }}>
              <Boxes size={14} /> Stress Test
           </button>
        </div>
      </header>

      <main className="page-body">
        <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: 24 }}>
          {/* Inputs */}
          <section className="fade-up">
            <div style={{ display: 'flex', gap: 8, marginBottom: 16, overflowX: 'auto', paddingBottom: 8 }}>
               {(Object.keys(DOMAINS) as Domain[]).map(id => (
                 <button key={id} onClick={() => setDomain(id)} className={`btn-ghost ${domain === id ? 'active' : ''}`} style={{ fontSize: 11, whiteSpace: 'nowrap' }}>{DOMAINS[id].badge}</button>
               ))}
            </div>
            
            <form onSubmit={handleRun} className="card" style={{ padding: 24, borderTop: `4px solid ${DOMAINS[domain].color}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                 <div style={{ fontSize: 14, fontWeight: 800 }}>{DOMAINS[domain].label}</div>
                 <button type="button" onClick={handleAutofill} className="btn-ghost" style={{ fontSize: 10, padding: '4px 8px' }} title="Use sample data to quickly test bias detection">
                    ✨ Try Sample Data
                 </button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                 {DOMAINS[domain].fields.map(f => (
                   <div key={f.id}>
                     <label className="field-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>{f.label}</span>
                        {f.type === 'range' && <span style={{ color: DOMAINS[domain].color }}>{fmtVal(form[f.id], f.id)}</span>}
                     </label>
                     {f.type === 'select' ? (
                       <select className="field-input" value={form[f.id] || ''} onChange={e => setForm({ ...form, [f.id]: e.target.value })}>
                         {f.options?.map(o => <option key={o} value={o}>{o.toUpperCase()}</option>)}
                       </select>
                     ) : (
                       <input type={f.type === 'range' ? 'range' : 'number'} className={f.type === 'range' ? 'field-slider' : 'field-input'} min={f.min} max={f.max} step={f.step} value={form[f.id] ?? 0} onChange={e => setForm({ ...form, [f.id]: +e.target.value })} />
                     )}
                   </div>
                 ))}
              </div>
              <button type="submit" disabled={loading} className="btn-primary" style={{ marginTop: 24, background: DOMAINS[domain].color }}>
                {loading ? <Loader className="spin" size={16} /> : (tab === 'stress' ? <Boxes size={16} /> : (tab === 'compare' ? <GitCompare size={16} /> : <Zap size={16} />))} 
                {tab === 'stress' ? 'RUN STRESS TEST' : (tab === 'compare' ? (compareA ? 'COMPARE WITH SCENARIO B' : 'LOCK SCENARIO A') : 'AUDIT NOW')}
              </button>
              
              {(res || compareB || stressRes) && (
                <button type="button" onClick={exportReport} className="btn-ghost" style={{ width: '100%', marginTop: 12, justifyContent: 'center' }}>
                   <Download size={14} /> EXPORT REPORT
                </button>
              )}
            </form>
          </section>

          {/* Results */}
          <section>
            {tab === 'single' && (
              !res ? (
                <div className="card empty-state" style={{ height: '100%', borderStyle: 'dashed' }}>
                   <p style={{ color: '#4b5563' }}>Enter data and run audit to view fairness metrics.</p>
                </div>
              ) : (
                <div className="fade-up" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                   <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                      <div className="card" style={{ padding: 24, borderLeft: `4px solid ${res.bias.biasDetected ? '#ef4444' : '#10b981'}` }}>
                         <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                            <div className="stat-label">Bias Detection</div>
                            <div title="Bias is detected if changing sensitive attributes alters the decision."><Info size={14} color="#475569" /></div>
                         </div>
                         <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <div style={{ padding: 12, borderRadius: 12, background: res.bias.biasDetected ? '#ef444415' : '#10b98115' }}>
                               {res.bias.biasDetected ? <AlertTriangle color="#ef4444" /> : <ShieldCheck color="#10b981" />}
                            </div>
                            <div>
                               <div style={{ fontSize: 24, fontWeight: 900, color: res.bias.biasDetected ? '#ef4444' : '#10b981' }}>{res.bias.biasDetected ? 'YES' : 'NO'}</div>
                               <div style={{ fontSize: 11, color: '#64748b' }}>Bias {res.bias.biasDetected ? 'Detected' : 'Not Found'}</div>
                            </div>
                         </div>
                      </div>

                      <div className="card" style={{ padding: 24, borderLeft: `4px solid ${res.bias.riskLevel === 'Critical' ? '#ef4444' : '#10b981'}` }}>
                         <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                            <div className="stat-label">Fairness Score</div>
                            <div title="Quantifies outcome equality across demographics."><Info size={14} color="#475569" /></div>
                         </div>
                         <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                            <span style={{ fontSize: 32, fontWeight: 900 }}>{res.bias.fairnessScore}</span>
                            <span style={{ fontSize: 14, color: '#475569' }}>/ 100</span>
                         </div>
                         <div className="progress-track" style={{ marginTop: 12, height: 4 }}>
                            <div className="progress-fill" style={{ width: `${res.bias.fairnessScore}%`, background: res.bias.riskLevel === 'Critical' ? '#ef4444' : '#10b981' }} />
                         </div>
                      </div>
                   </div>

                   <div className="card" style={{ padding: 24 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                         <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <BarChart2 size={16} color="#6366f1" />
                            <div style={{ fontSize: 14, fontWeight: 800 }}>Demographic Parity Comparison</div>
                         </div>
                         <div className="badge badge-neutral" style={{ fontSize: 9 }}>DIFF: {res.bias.biasImpact}%</div>
                      </div>
                      <ResponsiveContainer width="100%" height={160}>
                         <BarChart data={res.bias.groupParity}>
                            <XAxis dataKey="group" tick={{ fill: '#475569', fontSize: 11, textTransform: 'capitalize' }} axisLine={false} tickLine={false} />
                            <YAxis hide domain={[0, 100]} />
                            <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12 }} />
                            <Bar dataKey="rate" radius={[6, 6, 0, 0]} barSize={40}>
                               {res.bias.groupParity.map((g: any, i: number) => <Cell key={i} fill={g.selected ? '#10b981' : '#ef4444'} fillOpacity={0.6} stroke={g.selected ? '#10b981' : '#ef4444'} />)}
                            </Bar>
                         </BarChart>
                      </ResponsiveContainer>
                   </div>

                   <div className="card" style={{ padding: 24, borderLeft: '4px solid #6366f1' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                         <span style={{ fontSize: 20 }}>🧠</span>
                         <div className="stat-label" style={{ color: '#6366f1' }}>AI Insight</div>
                      </div>
                      <p style={{ fontSize: 14, color: '#f1f5f9', lineHeight: 1.6 }}>
                         {res.bias.biasDetected ? (
                            <>The system shows bias against <span style={{ fontWeight: 800, color: '#ef4444' }}>{res.bias.groupParity.find((g: any) => !g.selected)?.group || 'certain groups'}</span> with a selection rate difference of <span style={{ fontWeight: 800 }}>{res.bias.biasImpact}%</span>.</>
                         ) : (
                            <>No significant bias detected. The model treats groups fairly in the <span style={{ textTransform: 'capitalize' }}>{domain}</span> context.</>
                         )}
                      </p>
                   </div>

                   <div className="card" style={{ padding: 24, borderLeft: '4px solid #f59e0b' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                         <span style={{ fontSize: 20 }}>🔧</span>
                         <div className="stat-label" style={{ color: '#f59e0b' }}>Suggested Fix</div>
                      </div>
                      <div style={{ fontSize: 14, color: '#94a3b8' }}>
                         {res.bias.biasDetected ? "Implement threshold calibration to equalize opportunity." : "The system is currently fair. Continue monitoring."}
                      </div>
                   </div>
                </div>
              )
            )}

            {tab === 'compare' && (
              <div className="fade-up">
                 {!compareA ? (
                    <div className="card empty-state" style={{ height: 400, borderStyle: 'dashed' }}>
                       <GitCompare size={40} color="#4b5563" style={{ marginBottom: 16 }} />
                       <p style={{ color: '#4b5563' }}>Enter data for <b>Scenario A</b> and click Lock.</p>
                    </div>
                 ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                       <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                          <div className="card" style={{ padding: 24, borderTop: '4px solid #6366f1' }}>
                             <div className="stat-label">Scenario A</div>
                             <div style={{ fontSize: 28, fontWeight: 900, margin: '12px 0' }}>{compareA.bias.fairnessScore}% <span style={{ fontSize: 12, fontWeight: 500, color: '#64748b' }}>FAIRNESS</span></div>
                             <div className="badge badge-neutral">BIAS: {compareA.bias.biasImpact}%</div>
                          </div>
                          
                          {compareB ? (
                             <div className="card" style={{ padding: 24, borderTop: '4px solid #06b6d4' }}>
                                <div className="stat-label">Scenario B</div>
                                <div style={{ fontSize: 28, fontWeight: 900, margin: '12px 0' }}>{compareB.bias.fairnessScore}% <span style={{ fontSize: 12, fontWeight: 500, color: '#64748b' }}>FAIRNESS</span></div>
                                <div className="badge badge-neutral">BIAS: {compareB.bias.biasImpact}%</div>
                             </div>
                          ) : (
                             <div className="card" style={{ padding: 24, borderStyle: 'dashed', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <p style={{ fontSize: 13, color: '#4b5563' }}>Modify inputs and click Lock for Scenario B</p>
                             </div>
                          )}
                       </div>

                       {compareB && (
                          <div className="card" style={{ padding: 24, textAlign: 'center' }}>
                             <div className="stat-label">Comparison Result</div>
                             <div style={{ fontSize: 20, fontWeight: 800, marginTop: 8 }}>
                                {compareB.bias.fairnessScore > compareA.bias.fairnessScore ? (
                                   <span style={{ color: '#10b981' }}>📈 Improvement: +{compareB.bias.fairnessScore - compareA.bias.fairnessScore}% Fairness</span>
                                ) : compareB.bias.fairnessScore < compareA.bias.fairnessScore ? (
                                   <span style={{ color: '#ef4444' }}>📉 Decline: {compareB.bias.fairnessScore - compareA.bias.fairnessScore}% Fairness</span>
                                ) : (
                                   <span>No Change in Fairness Score</span>
                                )}
                             </div>
                          </div>
                       )}
                       
                       <button onClick={() => { setCompareA(null); setCompareB(null); }} className="btn-ghost" style={{ width: 'fit-content', alignSelf: 'center' }}>Reset Comparison</button>
                    </div>
                 )}
              </div>
            )}

            {tab === 'stress' && (
              <div className="fade-up">
                 {!stressRes ? (
                    <div className="card empty-state" style={{ height: 400, borderStyle: 'dashed' }}>
                       <Boxes size={40} color="#4b5563" style={{ marginBottom: 16 }} />
                       <p style={{ color: '#4b5563' }}>Run stress test to check model robustness across 20 variations.</p>
                    </div>
                 ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                       <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
                          <div className="card" style={{ padding: 24 }}>
                             <div className="stat-label">Total Tests</div>
                             <div style={{ fontSize: 32, fontWeight: 900 }}>{stressRes.total}</div>
                          </div>
                          <div className="card" style={{ padding: 24 }}>
                             <div className="stat-label">Biased Cases</div>
                             <div style={{ fontSize: 32, fontWeight: 900, color: stressRes.biasedCount > 0 ? '#ef4444' : '#10b981' }}>{stressRes.biasedCount}</div>
                          </div>
                          <div className="card" style={{ padding: 24 }}>
                             <div className="stat-label">Avg Fairness</div>
                             <div style={{ fontSize: 32, fontWeight: 900 }}>{stressRes.avgFairness}%</div>
                          </div>
                       </div>

                       <div className="card" style={{ padding: 24 }}>
                          <div className="stat-label" style={{ marginBottom: 20 }}>Robustness Distribution</div>
                          <div style={{ height: 200 }}>
                             <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={stressRes.details.map((d: any, i: number) => ({ id: i, fairness: d.bias.fairnessScore }))}>
                                   <Bar dataKey="fairness" radius={[2, 2, 0, 0]}>
                                      {stressRes.details.map((d: any, i: number) => (
                                         <Cell key={i} fill={d.bias.biasDetected ? '#ef4444' : '#6366f1'} fillOpacity={0.4} />
                                      ))}
                                   </Bar>
                                   <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12 }} />
                                </BarChart>
                             </ResponsiveContainer>
                          </div>
                          <div style={{ textAlign: 'center', fontSize: 12, color: '#4b5563', marginTop: 12 }}>
                             Out of {stressRes.total} test cases, {stressRes.biasedCount} showed bias ({stressRes.biasRate}%)
                          </div>
                       </div>
                       
                       <button onClick={() => setStressRes(null)} className="btn-ghost" style={{ width: 'fit-content', alignSelf: 'center' }}>Clear Results</button>
                    </div>
                 )}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
