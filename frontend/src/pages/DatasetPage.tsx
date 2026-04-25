import { useState, useMemo } from 'react';
import { Upload, FileSpreadsheet, AlertTriangle, ShieldCheck, BarChart2, PieChart as PieIcon, Activity, Database, Info } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, CartesianGrid } from 'recharts';
import { analyzeDatasetBias, type DatasetAnalysisResult } from '../engine';
import { Link } from 'react-router-dom';

export default function DatasetPage() {
  const [csvData, setCsvData] = useState<any[] | null>(null);
  const [headers, setHeaders] = useState<string[]>([]);
  const [fileName, setFileName] = useState('');
  
  const [targetCol, setTargetCol] = useState('');
  const [sensitiveCol, setSensitiveCol] = useState('');
  const [analysis, setAnalysis] = useState<DatasetAnalysisResult | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const lines = text.split('\n').filter(l => l.trim());
      const cols = lines[0].split(',').map(c => c.trim());
      const rows = lines.slice(1).map(line => {
        const values = line.split(',');
        const obj: any = {};
        cols.forEach((col, i) => { obj[col] = values[i]?.trim(); });
        return obj;
      });
      setHeaders(cols);
      setCsvData(rows);
      setTargetCol('');
      setSensitiveCol('');
      setAnalysis(null);
    };
    reader.readAsText(file);
  };

  const runAnalysis = () => {
    if (!csvData || !targetCol || !sensitiveCol) return;
    const result = analyzeDatasetBias(csvData, targetCol, sensitiveCol);
    setAnalysis(result);
  };

  const chartData = useMemo(() => {
    if (!analysis) return [];
    return Object.entries(analysis.groups).map(([name, stats]) => ({
      name,
      rate: Math.round((stats as any).rate),
      total: (stats as any).total
    }));
  }, [analysis]);

  return (
    <div className="surface-glow" style={{ minHeight: '100vh' }}>
      <header className="page-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div className="page-header-eyebrow"><Database size={12} color="#6366f1" /> DATASET AUDIT CORE</div>
            <h1 className="page-title">Universal Bias Analyzer</h1>
          </div>
          <div className="card" style={{ padding: 4, display: 'flex', gap: 4, background: 'rgba(0,0,0,0.2)' }}>
             <Link to="/predict" className="btn-ghost" style={{ fontSize: 11, padding: '6px 12px', textDecoration: 'none' }}>DOMAIN MODE</Link>
             <button className="btn-ghost active" style={{ fontSize: 11, padding: '6px 12px', background: '#6366f120', color: '#818cf8' }}>UPLOAD MODE</button>
          </div>
        </div>
      </header>

      <main className="page-body" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        {!csvData ? (
          <div className="card fade-up" style={{ padding: 60, border: '2px dashed rgba(99,102,241,0.2)', textAlign: 'center', background: 'rgba(99,102,241,0.02)' }}>
             <div style={{ width: 64, height: 64, background: '#6366f115', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                <Upload size={32} color="#6366f1" />
             </div>
             <h2 style={{ fontSize: 20, fontWeight: 900, marginBottom: 8 }}>Drop CSV Dataset</h2>
             <p style={{ color: '#475569', fontSize: 14, marginBottom: 24, maxWidth: 400, margin: '0 auto 24px' }}>Upload any custom dataset to audit fairness across outcomes and demographics.</p>
             <label className="btn-primary" style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                <FileSpreadsheet size={16} /> BROWSE FILES
                <input type="file" accept=".csv" hidden onChange={handleFileUpload} />
             </label>
          </div>
        ) : (
          <div className="fade-up" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
             {/* Preview & Config */}
             <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 24 }}>
                <div className="card" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                   <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                         <FileSpreadsheet size={16} color="#6366f1" />
                         <span style={{ fontSize: 13, fontWeight: 800 }}>{fileName}</span>
                      </div>
                      <button onClick={() => setCsvData(null)} style={{ fontSize: 11, color: '#f87171', fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer' }}>CHANGE FILE</button>
                   </div>
                   <div style={{ overflowX: 'auto', maxHeight: 300 }}>
                      <table className="data-table">
                         <thead>
                            <tr>{headers.map(h => <th key={h}>{h}</th>)}</tr>
                         </thead>
                         <tbody>
                            {csvData.slice(0, 8).map((row, i) => (
                               <tr key={i}>{headers.map(h => <td key={h} style={{ fontSize: 11 }}>{row[h]}</td>)}</tr>
                            ))}
                         </tbody>
                      </table>
                   </div>
                   <div style={{ padding: 12, background: 'rgba(0,0,0,0.1)', fontSize: 10, color: '#475569', textAlign: 'center' }}>Showing first 8 of {csvData.length} records</div>
                </div>

                <div className="card" style={{ padding: 24 }}>
                   <div className="stat-label" style={{ marginBottom: 20 }}>Analysis Parameters</div>
                   <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                      <div>
                         <label className="field-label">Target Variable (Outcome)</label>
                         <select className="field-input" value={targetCol} onChange={e => setTargetCol(e.target.value)}>
                            <option value="">Select Column...</option>
                            {headers.map(h => <option key={h} value={h}>{h}</option>)}
                         </select>
                         <div style={{ fontSize: 10, color: '#475569', marginTop: 4 }}>Example: "Approved", "Selected", or "Target"</div>
                      </div>
                      <div>
                         <label className="field-label">Sensitive Attribute (Proxy)</label>
                         <select className="field-input" value={sensitiveCol} onChange={e => setSensitiveCol(e.target.value)}>
                            <option value="">Select Column...</option>
                            {headers.map(h => <option key={h} value={h}>{h}</option>)}
                         </select>
                         <div style={{ fontSize: 10, color: '#475569', marginTop: 4 }}>Example: "Gender", "Race", or "Age Group"</div>
                      </div>
                      <button className="btn-primary" disabled={!targetCol || !sensitiveCol} onClick={runAnalysis} style={{ marginTop: 8 }}>
                         <Activity size={16} /> ANALYZE DATASET
                      </button>
                   </div>
                </div>
             </div>

             {/* Results */}
             {analysis && (
                <div className="fade-up" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                   <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
                      <div className="card" style={{ padding: 24, borderTop: `4px solid ${analysis.biasDetected ? '#ef4444' : '#10b981'}` }}>
                         <div className="stat-label">Fairness Score</div>
                         <div style={{ fontSize: 32, fontWeight: 900, color: analysis.biasDetected ? '#ef4444' : '#10b981' }}>{analysis.fairnessScore}%</div>
                         <div style={{ fontSize: 11, color: '#475569', marginTop: 4 }}>{analysis.biasDetected ? 'Bias Detected' : 'Fair Distribution'}</div>
                      </div>
                      <div className="card" style={{ padding: 24 }}>
                         <div className="stat-label">Max Disparity</div>
                         <div style={{ fontSize: 32, fontWeight: 900 }}>{analysis.diff}%</div>
                         <div style={{ fontSize: 11, color: '#475569', marginTop: 4 }}>Across {Object.keys(analysis.groups).length} groups</div>
                      </div>
                      <div className={`card ${analysis.biasDetected ? 'card-glow-red' : 'card-glow-green'}`} style={{ padding: 24 }}>
                         <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                            {analysis.biasDetected ? <AlertTriangle size={16} color="#ef4444" /> : <ShieldCheck size={16} color="#10b981" />}
                            <span style={{ fontSize: 13, fontWeight: 900 }}>INSIGHT</span>
                         </div>
                         <p style={{ fontSize: 13, lineHeight: 1.5, color: '#94a3b8' }}>{analysis.explanation}</p>
                      </div>
                   </div>

                   <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 20 }}>
                      <div className="card" style={{ padding: 24 }}>
                         <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24 }}>
                            <BarChart2 size={16} color="#6366f1" />
                            <div style={{ fontSize: 14, fontWeight: 800 }}>Selection Rate by Group</div>
                         </div>
                         <ResponsiveContainer width="100%" height={240}>
                            <BarChart data={chartData}>
                               <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                               <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                               <YAxis unit="%" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                               <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12 }} />
                               <Bar dataKey="rate" name="Selection Rate %" radius={[4, 4, 0, 0]} barSize={40}>
                                  {chartData.map((_: any, i: number) => <Cell key={i} fill={i === 0 ? '#6366f1' : '#312e81'} />)}
                               </Bar>
                            </BarChart>
                         </ResponsiveContainer>
                      </div>

                      <div className="card" style={{ padding: 24, display: 'flex', flexDirection: 'column' }}>
                         <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24 }}>
                            <PieIcon size={16} color="#6366f1" />
                            <div style={{ fontSize: 14, fontWeight: 800 }}>Sample Distribution</div>
                         </div>
                         <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <ResponsiveContainer width="100%" height={180}>
                               <PieChart>
                                  <Pie data={chartData} innerRadius={60} outerRadius={80} dataKey="total" stroke="none">
                                     <Cell fill="#6366f1" />
                                     <Cell fill="#312e81" />
                                     <Cell fill="#1e1b4b" />
                                     <Cell fill="#4338ca" />
                                  </Pie>
                                  <Tooltip />
                               </PieChart>
                            </ResponsiveContainer>
                         </div>
                         <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'center', marginTop: 16 }}>
                            {chartData.slice(0, 4).map((g, i) => (
                               <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 10, color: '#64748b' }}>
                                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: ['#6366f1','#312e81','#1e1b4b','#4338ca'][i] }} /> {g.name}
                               </div>
                            ))}
                         </div>
                      </div>
                   </div>

                   <div className="card" style={{ padding: 20, display: 'flex', alignItems: 'center', gap: 12, background: 'rgba(99,102,241,0.05)', border: '1px solid rgba(99,102,241,0.1)' }}>
                      <Info size={16} color="#818cf8" />
                      <div style={{ fontSize: 12, color: '#818cf8' }}>
                         <strong>Methodology:</strong> Disparate Impact Ratio analysis comparing selection rates across groups defined by <em>{sensitiveCol}</em> for the target <em>{targetCol}</em>.
                      </div>
                   </div>
                </div>
             )}
          </div>
        )}
      </main>
    </div>
  );
}
