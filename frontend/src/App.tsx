import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Home, LayoutDashboard, Upload, Zap, ClipboardList, ShieldCheck } from 'lucide-react';
import HomePage from './pages/HomePage';
import DashboardPage from './pages/DashboardPage';
import UploadPage from './pages/UploadPage';
import PredictionPage from './pages/PredictionPage';
import LogsPage from './pages/LogsPage';

function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-dark-bg/80 backdrop-blur-md border-b border-white/10 px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <ShieldCheck className="w-8 h-8 text-neon-blue group-hover:scale-110 transition-transform" />
          <span className="text-2xl font-bold tracking-tighter glow-text">
            ETHIX <span className="text-neon-blue">AI</span>
          </span>
        </Link>
        
        <div className="flex items-center gap-8">
          <Link to="/" className="hover:text-neon-blue transition-colors flex items-center gap-1">
            <Home className="w-4 h-4" /> Home
          </Link>
          <Link to="/upload" className="hover:text-neon-blue transition-colors flex items-center gap-1">
            <Upload className="w-4 h-4" /> Upload
          </Link>
          <Link to="/dashboard" className="hover:text-neon-blue transition-colors flex items-center gap-1">
            <LayoutDashboard className="w-4 h-4" /> Dashboard
          </Link>
          <Link to="/predict" className="hover:text-neon-blue transition-colors flex items-center gap-1">
            <Zap className="w-4 h-4" /> Predict
          </Link>
          <Link to="/logs" className="hover:text-neon-blue transition-colors flex items-center gap-1">
            <ClipboardList className="w-4 h-4" /> Logs
          </Link>
        </div>
      </div>
    </nav>
  );
}

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-dark-bg text-white selection:bg-neon-blue/30">
        <Navbar />
        <main className="pt-24 pb-12 px-6 max-w-7xl mx-auto">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/upload" element={<UploadPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/predict" element={<PredictionPage />} />
            <Route path="/logs" element={<LogsPage />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
