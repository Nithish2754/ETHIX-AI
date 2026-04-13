import { ShieldAlert, Fingerprint, BarChart3, Database, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function HomePage() {
  return (
    <div className="flex flex-col items-center text-center space-y-16 py-12">
      {/* Hero Section */}
      <section className="space-y-6 max-w-4xl">
        <h1 className="text-6xl md:text-8xl font-black tracking-tighter">
          Building <span className="text-neon-blue drop-shadow-[0_0_20px_rgba(0,243,255,0.5)]">Fair</span> & 
          <br />Transparent AI
        </h1>
        <p className="text-xl text-gray-400 max-w-2xl mx-auto">
          ETHIX AI is a cutting-edge platform designed to detect bias, measure fairness, and provide explainability for machine learning systems in real-time.
        </p>
        <div className="flex gap-4 justify-center pt-4">
          <Link to="/upload" className="neon-button px-8 py-4 rounded-full font-bold text-lg">
            Get Started
          </Link>
          <button className="px-8 py-4 rounded-full font-bold text-lg border border-white/20 hover:bg-white/5 transition-all">
            Documentation
          </button>
        </div>
      </section>

      {/* Features Grid */}
      <div className="grid md:grid-cols-3 gap-8 w-full">
        <FeatureCard 
          icon={<ShieldAlert className="w-10 h-10 text-neon-blue" />}
          title="Bias Detection"
          description="Identify statistical disparities across sensitive attributes like gender, race, or income."
        />
        <FeatureCard 
          icon={<BarChart3 className="w-10 h-10 text-neon-purple" />}
          title="Fairness Metrics"
          description="Measure demographic parity and equal opportunity with precision dashboards."
        />
        <FeatureCard 
          icon={<Fingerprint className="w-10 h-10 text-green-400" />}
          title="XAI Explainability"
          description="Understand why decisions are made using SHAP-powered feature importance analysis."
        />
        <FeatureCard 
          icon={<Database className="w-10 h-10 text-orange-400" />}
          title="Auto Balancing"
          description="Correct dataset imbalances automatically using oversampling and reweighing techniques."
        />
        <FeatureCard 
          icon={<Lock className="w-10 h-10 text-red-500" />}
          title="Immutable Logs"
          description="Every decision is hashed and logged in a secure, blockchain-inspired ledger."
        />
        <FeatureCard 
          icon={<ShieldAlert className="w-10 h-10 text-blue-400" />}
          title="Real-time Correction"
          description="Live threshold adjustment to ensure equitable outcomes during prediction."
        />
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: any, title: string, description: string }) {
  return (
    <div className="glass-card p-8 text-left group hover:border-neon-blue/50 transition-all duration-300">
      <div className="mb-4">{icon}</div>
      <h3 className="text-xl font-bold mb-2 group-hover:text-neon-blue transition-colors">{title}</h3>
      <p className="text-gray-400 leading-relaxed">{description}</p>
    </div>
  );
}
