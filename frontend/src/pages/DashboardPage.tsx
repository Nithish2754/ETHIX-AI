import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { AlertTriangle, CheckCircle, Activity, Target } from 'lucide-react';
import axios from 'axios';

export default function DashboardPage() {
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMetrics();
  }, []);

  const fetchMetrics = async () => {
    try {
      // For demo, we use the expert sample
      const response = await axios.post('http://localhost:8000/analyze-bias?filename=sample_expert.csv&target_col=target&sensitive_col=gender');
      setMetrics(response.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center py-20 animate-pulse text-neon-blue">Loading Neural Architecture...</div>;
  if (!metrics) return <div className="text-center py-20 text-red-400">Please upload data first to view dashboard.</div>;

  const biasLevel = metrics.bias_score > 0.1 ? 'High' : metrics.bias_score > 0.05 ? 'Moderate' : 'Low';
  const biasColor = biasLevel === 'High' ? 'text-red-500' : biasLevel === 'Moderate' ? 'text-yellow-500' : 'text-green-500';

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-4xl font-bold glow-text">Fairness Dashboard</h2>
          <p className="text-gray-400">Real-time bias analysis of your current model and data.</p>
        </div>
        <div className="glass-card px-6 py-2 flex items-center gap-3 border-neon-blue/30">
          <Activity className="w-5 h-5 text-neon-blue" />
          <span className="font-mono text-neon-blue">LIVE MONITORING</span>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid md:grid-cols-4 gap-6">
        <StatCard 
          icon={<AlertTriangle className={biasColor} />}
          label="Bias Level"
          value={biasLevel}
          subtext={`Variance: ${metrics.bias_score.toFixed(4)}`}
        />
        <StatCard 
          icon={<Target className="text-neon-purple" />}
          label="Sensitive Attribute"
          value={metrics.attribute.toUpperCase()}
          subtext="Monitoring feature"
        />
        <StatCard 
          icon={<Activity className="text-green-400" />}
          label="Parity Check"
          value={metrics.bias_score < 0.1 ? "PASSED" : "FAILED"}
          subtext="80% Rule Compliance"
        />
        <StatCard 
          icon={<CheckCircle className="text-blue-400" />}
          label="Correction Meta"
          value="ACTIVE"
          subtext="Threshold Reweighing"
        />
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Disparity Chart */}
        <div className="glass-card p-6">
          <h3 className="text-xl font-bold mb-6">Demographic Parity (Selection Rate)</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={metrics.metrics}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2d3748" />
                <XAxis dataKey="group" stroke="#718096" />
                <YAxis stroke="#718096" domain={[0, 1]} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#161a23', border: '1px solid #00f3ff' }}
                  itemStyle={{ color: '#00f3ff' }}
                />
                <Bar dataKey="rate" fill="#00f3ff" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Suggested Improvements */}
        <div className="glass-card p-6 space-y-6">
            <h3 className="text-xl font-bold">Fairness Insights</h3>
            <div className="space-y-4">
                <InsightItem 
                    title="Data Imbalance Detected"
                    description={`The selection rate for ${metrics.metrics[0].group} is significantly ${metrics.metrics[0].rate > metrics.metrics[1].rate ? 'higher' : 'lower'} than ${metrics.metrics[1].group}.`}
                    type="warning"
                />
                <InsightItem 
                    title="Correction Recommendation"
                    description="Apply reweighing to the training samples to neutralize historical bias in labels."
                    type="info"
                />
                <InsightItem 
                    title="Transparency Log"
                    description="XAI explanation is required for all positive outcomes to verify ethical compliance."
                    type="check"
                />
            </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, subtext }: any) {
  return (
    <div className="glass-card p-6 border-l-4 border-l-transparent hover:border-l-neon-blue transition-all">
      <div className="flex items-center gap-3 mb-4">
        {icon}
        <span className="text-gray-400 text-sm uppercase tracking-wider font-bold">{label}</span>
      </div>
      <div className="text-3xl font-black mb-1">{value}</div>
      <div className="text-xs text-gray-500 font-mono italic">{subtext}</div>
    </div>
  );
}

function InsightItem({ title, description, type }: any) {
    const colors = {
        warning: 'border-yellow-500/30 text-yellow-500',
        info: 'border-neon-blue/30 text-neon-blue',
        check: 'border-green-500/30 text-green-500'
    };
    return (
        <div className={`p-4 rounded-lg border bg-white/5 ${colors[type as keyof typeof colors]}`}>
            <h4 className="font-bold mb-1">{title}</h4>
            <p className="text-sm opacity-80">{description}</p>
        </div>
    );
}
