import { useState } from 'react';
import { Zap, ShieldCheck, Info, Database, Fingerprint } from 'lucide-react';
import axios from 'axios';

export default function PredictionPage() {
  const [formData, setFormData] = useState({
    gender: 'female',
    income: 4000,
    region: 'rural',
    credit_score: 650,
    loan_amount: 15000
  });
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/predict`, {
        data: formData,
        sensitive_attr: 'gender',
        apply_correction: true
      });
      setResult(response.data);
      setLoading(false);
    } catch (err) {
      alert("Prediction failed. Ensure model is trained.");
      setLoading(false);
    }
  };

  return (
    <div className="grid md:grid-cols-2 gap-12 py-8 animate-in fade-in duration-500">
      <div className="space-y-8">
        <div>
          <h2 className="text-4xl font-bold glow-text">Ethical Prediction</h2>
          <p className="text-gray-400">Input features to see raw vs bias-corrected AI outcomes.</p>
        </div>

        <form onSubmit={handleSubmit} className="glass-card p-8 space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-400">GENDER</label>
              <select 
                className="w-full bg-white/5 border border-white/10 p-3 rounded-lg focus:border-neon-blue outline-none"
                value={formData.gender}
                onChange={(e) => setFormData({...formData, gender: e.target.value})}
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-400">REGION</label>
              <select 
                className="w-full bg-white/5 border border-white/10 p-3 rounded-lg focus:border-neon-blue outline-none"
                value={formData.region}
                onChange={(e) => setFormData({...formData, region: e.target.value})}
              >
                <option value="urban">Urban</option>
                <option value="rural">Rural</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-400">MONTHLY INCOME ($)</label>
            <input 
              type="number"
              className="w-full bg-white/5 border border-white/10 p-3 rounded-lg focus:border-neon-blue outline-none"
              value={formData.income}
              onChange={(e) => setFormData({...formData, income: Number(e.target.value)})}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-400">CREDIT SCORE</label>
            <input 
              type="number"
              className="w-full bg-white/5 border border-white/10 p-3 rounded-lg focus:border-neon-blue outline-none"
              value={formData.credit_score}
              onChange={(e) => setFormData({...formData, credit_score: Number(e.target.value)})}
            />
          </div>

          <button 
            type="submit"
            className="w-full neon-button py-4 rounded-xl font-bold flex items-center justify-center gap-2"
            disabled={loading}
          >
            {loading ? "Neural Computation..." : <><Zap className="w-5 h-5" /> Execute Prediction</>}
          </button>
        </form>
      </div>

      <div className="space-y-8">
        {result ? (
          <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
            {/* Prediction Result */}
            <div className="glass-card p-8 border-neon-blue/40 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4">
                    <ShieldCheck className="w-12 h-12 text-neon-blue opacity-20" />
                </div>
                <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                    <Fingerprint className="text-neon-blue" /> DECISION OUTCOME
                </h3>
                
                <div className="grid grid-cols-2 gap-8">
                    <div className="text-center p-4 bg-white/5 rounded-xl border border-white/5">
                        <div className="text-gray-400 text-sm mb-1 uppercase">Raw Model AI</div>
                        <div className={`text-4xl font-black ${result.raw_prediction === 1 ? 'text-green-400' : 'text-red-400'}`}>
                            {result.raw_prediction === 1 ? 'APPROVED' : 'DENIED'}
                        </div>
                    </div>
                    <div className="text-center p-4 bg-neon-blue/10 rounded-xl border border-neon-blue/30">
                        <div className="text-neon-blue text-sm mb-1 uppercase font-bold">Ethix Correction</div>
                        <div className={`text-4xl font-black ${result.corrected_prediction === 1 ? 'text-green-400' : 'text-red-400'}`}>
                            {result.corrected_prediction === 1 ? 'APPROVED' : 'DENIED'}
                        </div>
                    </div>
                </div>

                {result.bias_mitigated && (
                    <div className="mt-4 p-3 bg-yellow-500/20 border border-yellow-500/40 text-yellow-500 rounded-lg text-sm font-bold flex items-center gap-2">
                        <Info className="w-4 h-4" /> BIAS MITIGATION APPLIED: OUTCOME REVERSED FOR EQUITY
                    </div>
                )}
            </div>

            {/* XAI Explanation */}
            <div className="glass-card p-6">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <Database className="text-neon-purple" /> XAI EXPLANATION (SHAP)
                </h3>
                <div className="space-y-3">
                    {result.explanation.map((item: any, idx: number) => (
                        <div key={idx} className="space-y-1">
                            <div className="flex justify-between text-xs font-mono">
                                <span>{item.feature.toUpperCase()}</span>
                                <span className="text-neon-blue">{(item.importance * 100).toFixed(1)}%</span>
                            </div>
                            <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                                <div 
                                    className="bg-neon-blue h-full shadow-[0_0_8px_rgba(0,243,255,0.6)]" 
                                    style={{ width: `${Math.abs(item.importance) * 100}%` }}
                                ></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Blockchain Proof */}
            <div className="glass-card p-4 border-dashed border-white/20">
                <div className="text-xs text-gray-500 font-mono mb-1 uppercase tracking-widest">Immutable Ledger Hash</div>
                <div className="text-[10px] font-mono text-neon-blue break-all uppercase">{result.blockchain_hash}</div>
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center glass-card border-dashed p-12 text-gray-600">
            <ShieldCheck className="w-20 h-20 mb-4 opacity-10" />
            <p>Awaiting Decision Execution...</p>
          </div>
        )}
      </div>
    </div>
  );
}
