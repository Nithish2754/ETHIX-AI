// ─────────────────────────────────────────────
//  ETHIX AI – Core Multi-Domain Engine (v4.6)
// ─────────────────────────────────────────────

export type Domain = 'hiring' | 'loan' | 'healthcare' | 'promotion' | 'insurance' | 'scholarship';

export interface DatasetAnalysisResult {
  groups: Record<string, { total: number; selected: number; rate: number }>;
  diff: number;
  fairnessScore: number;
  biasDetected: boolean;
  explanation: string;
}

export interface DomainConfig {
  id: Domain;
  label: string;
  badge: string;
  color: string;
  fields: Array<{ id: string; label: string; type: 'number' | 'range' | 'select'; min?: number; max?: number; step?: number; options?: string[] }>;
  outcomeLabels: [string, string]; 
}

export const DOMAINS: Record<Domain, DomainConfig> = {
  hiring: { id: 'hiring', label: 'Candidate Hiring', badge: 'HR', color: '#8b5cf6', fields: [{ id: 'gender', label: 'Gender', type: 'select', options: ['male', 'female', 'non-binary'] }, { id: 'age', label: 'Age', type: 'number', min: 18, max: 70 }, { id: 'education', label: 'Education', type: 'select', options: ['Bachelors', 'Masters', 'PhD'] }, { id: 'experience', label: 'Experience (Years)', type: 'range', min: 0, max: 40, step: 1 }], outcomeLabels: ['Selected', 'Rejected'] },
  loan: { id: 'loan', label: 'Financial Lending', badge: 'FIN', color: '#06b6d4', fields: [{ id: 'gender', label: 'Gender', type: 'select', options: ['male', 'female', 'non-binary'] }, { id: 'income', label: 'Monthly Income (₹)', type: 'range', min: 10000, max: 500000, step: 5000 }, { id: 'credit_score', label: 'CIBIL Score', type: 'range', min: 300, max: 900, step: 1 }, { id: 'loan_amount', label: 'Loan Amount (₹)', type: 'range', min: 50000, max: 5000000, step: 25000 }], outcomeLabels: ['Approved', 'Rejected'] },
  healthcare: { id: 'healthcare', label: 'Medical Diagnosis', badge: 'MED', color: '#10b981', fields: [{ id: 'gender', label: 'Gender', type: 'select', options: ['male', 'female', 'non-binary'] }, { id: 'age', label: 'Age', type: 'number', min: 0, max: 100 }, { id: 'health_score', label: 'Health Score', type: 'range', min: 0, max: 100, step: 1 }, { id: 'symptoms', label: 'Symptom Severity', type: 'select', options: ['Low', 'Medium', 'High'] }], outcomeLabels: ['Low Risk', 'High Risk'] },
  promotion: { id: 'promotion', label: 'Employee Promotion', badge: 'PRO', color: '#f59e0b', fields: [{ id: 'gender', label: 'Gender', type: 'select', options: ['male', 'female', 'non-binary'] }, { id: 'experience', label: 'Tenure (Years)', type: 'range', min: 0, max: 30, step: 1 }, { id: 'perf_score', label: 'Performance Score', type: 'range', min: 0, max: 100, step: 1 }, { id: 'department', label: 'Department', type: 'select', options: ['Sales', 'Engineering', 'HR', 'Admin'] }], outcomeLabels: ['Promoted', 'Not Promoted'] },
  insurance: { id: 'insurance', label: 'Insurance Approval', badge: 'INS', color: '#ec4899', fields: [{ id: 'gender', label: 'Gender', type: 'select', options: ['male', 'female', 'non-binary'] }, { id: 'age', label: 'Age', type: 'number', min: 18, max: 100 }, { id: 'driving_history', label: 'Driving Record', type: 'select', options: ['Good', 'Average', 'Poor'] }, { id: 'claim_history', label: 'Past Claims', type: 'range', min: 0, max: 10, step: 1 }], outcomeLabels: ['Approved', 'Rejected'] },
  scholarship: { id: 'scholarship', label: 'Scholarship Grant', badge: 'EDU', color: '#6366f1', fields: [{ id: 'gender', label: 'Gender', type: 'select', options: ['male', 'female', 'non-binary'] }, { id: 'academic_score', label: 'Academic GPA %', type: 'range', min: 0, max: 100, step: 1 }, { id: 'family_income', label: 'Family Income (₹)', type: 'range', min: 50000, max: 1000000, step: 10000 }, { id: 'category', label: 'Student Category', type: 'select', options: ['General', 'OBC', 'SC/ST', 'EWS'] }], outcomeLabels: ['Granted', 'Not Granted'] }
};

export interface PredictionResult { decision: string; confidence: number; score: number; featureImportance: any[]; blockchainHash: string; }
export interface BiasResult { biasDetected: boolean; biasImpact: number; fairnessScore: number; riskLevel: string; originalDecision: string; correctedDecision: string; groupParity: any; }
export interface LogEntry { id: string; domain: Domain; timestamp: string; input: Record<string, any>; prediction: PredictionResult; bias: BiasResult; }

export interface TrendPoint {
  time: string;
  biasRate: number;
  fairness: number;
}

export interface DashboardStats {
  total: number;
  biasCases: number;
  biasRate: number;
  avgFairness: number;
  domainStats: Record<Domain, { count: number; biasCases: number; biasRate: number; fairness: number }>;
  trendData: TrendPoint[];
}

const STABLE_KEY = 'ethix_v4_6_audit_ledger';
const generateHash = () => '0x' + Array.from({length: 40}, () => Math.floor(Math.random() * 16).toString(16)).join('');

export const getLogs = (): LogEntry[] => {
  try { return JSON.parse(localStorage.getItem(STABLE_KEY) || '[]'); } catch (e) { return []; }
};

export const clearLogs = () => localStorage.removeItem(STABLE_KEY);

export function saveLog(entry: Omit<LogEntry, 'id' | 'timestamp'>) {
  const full: LogEntry = { ...entry, id: `TX-${Date.now()}`, timestamp: new Date().toISOString() };
  localStorage.setItem(STABLE_KEY, JSON.stringify([full, ...getLogs()].slice(0, 200)));
  return full;
}

export function getStats(): DashboardStats {
  const logs = getLogs();
  const ds: any = {};
  (Object.keys(DOMAINS) as Domain[]).forEach(d => { ds[d] = { count: 0, biasCases: 0, biasRate: 0, fairness: 100 }; });
  
  logs.forEach(l => {
    if (!ds[l.domain]) return;
    ds[l.domain].count++;
    if (l.bias.biasDetected) ds[l.domain].biasCases++;
    // Cumulative average fairness with safety
    const currentCount = ds[l.domain].count;
    ds[l.domain].fairness = (ds[l.domain].fairness * (currentCount - 1) + l.bias.fairnessScore) / currentCount;
  });

  // Calculate rates for each domain with safety checks (NaN prevention)
  Object.keys(ds).forEach(k => {
    const d = ds[k as Domain];
    d.biasRate = d.count > 0 ? Math.round((d.biasCases / d.count) * 100) : 0;
    d.fairness = Math.round(d.fairness || 100);
  });

  const totalBias = logs.filter(l => l.bias.biasDetected).length;
  const avgFairness = logs.length ? Math.round(logs.reduce((a, b) => a + b.bias.fairnessScore, 0) / logs.length) : 100;

  // Generate trend data from last 15 logs
  const trendData: TrendPoint[] = logs.slice(0, 15).reverse().map(l => ({
    time: new Date(l.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    biasRate: l.bias.biasDetected ? 100 : 0,
    fairness: l.bias.fairnessScore
  }));

  // If no logs, provide empty but initialized trend
  if (trendData.length === 0) {
    for(let i=0; i<10; i++) {
       trendData.push({ time: `--:--`, biasRate: 0, fairness: 100 });
    }
  }

  return {
    total: logs.length,
    biasCases: totalBias,
    biasRate: logs.length ? Math.round((totalBias / logs.length) * 100) : 0,
    avgFairness,
    domainStats: ds,
    trendData
  };
}

export function simulateDomain(domain: Domain, input: any, forceGender?: string): { score: number; decision: string; shap: any[] } {
  let score = 50;
  const gender = forceGender || input.gender;
  const biasFactor = gender === 'female' ? -15 : gender === 'non-binary' ? -10 : 0;

  switch(domain) {
    case 'hiring': score = ((input.experience || 0) / 40) * 60 + 25 + biasFactor; break;
    case 'loan': score = ((input.credit_score || 300) - 300) / 600 * 50 + 10 + biasFactor; break;
    case 'healthcare': score = (100 - (input.health_score || 50)) * 0.8 + 10 + (biasFactor * -1); break;
    case 'promotion': score = ((input.perf_score || 0) / 100) * 70 + 30 + biasFactor; break;
    case 'insurance': score = (input.driving_history === 'Good' ? 80 : 40) + 20 + biasFactor; break;
    case 'scholarship': score = ((input.academic_score || 0) / 100) * 60 + 40 + (biasFactor * -1); break;
  }
  const decision = Math.round(score) >= 55 ? DOMAINS[domain].outcomeLabels[0] : DOMAINS[domain].outcomeLabels[1];
  return { score: Math.round(score), decision, shap: [] };
}

export async function executeAnalysis(domain: Domain, input: any): Promise<{ prediction: PredictionResult, bias: BiasResult, source: 'api' | 'simulated' }> {
  const current = simulateDomain(domain, input);
  const groups = ['male', 'female', 'non-binary'];
  const results = groups.map(g => simulateDomain(domain, input, g));
  const scores = results.map(r => r.score);
  const maxDiff = Math.max(...scores) - Math.min(...scores);
  const fairnessScore = Math.max(0, 100 - (maxDiff * 2));
  const biasDetected = results.some(r => r.decision !== results[0].decision);

  const groupParity = groups.map((g, i) => ({
    group: g,
    rate: results[i].score,
    selected: results[i].decision === DOMAINS[domain].outcomeLabels[0]
  }));

  return {
    prediction: { decision: current.decision, confidence: 94, score: current.score, featureImportance: [], blockchainHash: generateHash() },
    bias: { biasDetected, biasImpact: Math.round(maxDiff), fairnessScore: Math.round(fairnessScore), riskLevel: fairnessScore < 75 ? 'Critical' : 'Fair', originalDecision: current.decision, correctedDecision: results[0].decision, groupParity },
    source: 'simulated'
  };
}

export function analyzeDatasetBias(data: any[], target: string, sensitive: string): DatasetAnalysisResult {
  const groups: any = {};
  data.forEach(row => {
    const s = String(row[sensitive] || 'Unknown');
    const t = String(row[target]).toLowerCase();
    const isOk = ['1','true','selected','approved','granted','yes'].includes(t);
    if (!groups[s]) groups[s] = { total: 0, selected: 0, rate: 0 };
    groups[s].total++; if (isOk) groups[s].selected++;
  });
  Object.keys(groups).forEach(k => { groups[k].rate = groups[k].total > 0 ? (groups[k].selected / groups[k].total) * 100 : 0; });
  const rates = Object.values(groups).map((g: any) => g.rate);
  const diff = rates.length > 1 ? Math.max(...rates) - Math.min(...rates) : 0;
  const biasDetected = diff > 15;
  const explanation = biasDetected 
    ? `Systemic disparity of ${Math.round(diff)}% detected across ${sensitive} groups. The model favors specific segments significantly.`
    : `The dataset shows a balanced distribution across ${sensitive} groups with minimal outcome disparity.`;
    
  return { groups, diff: Math.round(diff), fairnessScore: Math.round(Math.max(0, 100 - diff)), biasDetected, explanation };
}
export async function runStressTest(domain: Domain, baseInput: any, iterations: number = 20) {
  const variations = [];
  const groups = ['male', 'female', 'non-binary'];
  
  for (let i = 0; i < iterations; i++) {
    const input = { ...baseInput };
    DOMAINS[domain].fields.forEach(f => {
      if (f.type === 'range' || f.type === 'number') {
        const range = (f.max || 100) - (f.min || 0);
        const delta = (Math.random() - 0.5) * (range * 0.15); // 15% variation
        input[f.id] = Math.round(Math.min(f.max || 100, Math.max(f.min || 0, (input[f.id] || 0) + delta)));
      }
      if (f.id === 'gender') {
        input[f.id] = groups[Math.floor(Math.random() * groups.length)];
      }
    });
    
    const res = await executeAnalysis(domain, input);
    variations.push(res);
  }
  
  const biasedCount = variations.filter(v => v.bias.biasDetected).length;
  const avgFairness = variations.reduce((acc, v) => acc + v.bias.fairnessScore, 0) / iterations;
  
  return {
    total: iterations,
    biasedCount,
    biasRate: Math.round((biasedCount / iterations) * 100),
    avgFairness: Math.round(avgFairness),
    details: variations
  };
}
