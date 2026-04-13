import { useEffect, useState } from 'react';
import { ClipboardList, Shield, Clock, Hash } from 'lucide-react';
import axios from 'axios';

export default function LogsPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const response = await axios.get('http://localhost:8000/logs');
      setLogs(response.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 py-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-4xl font-bold glow-text">Transparency Ledger</h2>
          <p className="text-gray-400">Secure, append-only logs for ethical auditing.</p>
        </div>
        <button 
          onClick={fetchLogs}
          className="bg-white/5 border border-white/10 px-4 py-2 rounded-lg hover:border-neon-blue transition-all"
        >
          Refresh Ledger
        </button>
      </div>

      <div className="overflow-x-auto glass-card">
        <table className="w-full text-left">
          <thead className="border-b border-white/10 bg-white/5">
            <tr>
              <th className="p-4 text-xs font-bold text-gray-400">TIMESTAMP</th>
              <th className="p-4 text-xs font-bold text-gray-400">OUTCOME</th>
              <th className="p-4 text-xs font-bold text-gray-400">INPUT SNAPSHOT</th>
              <th className="p-4 text-xs font-bold text-gray-400">CRYPTOGRAPHIC HASH</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {logs.map((log: any) => {
              const data = JSON.parse(log.data);
              return (
                <tr key={log.id} className="hover:bg-white/5 transition-colors group">
                  <td className="p-4 font-mono text-xs text-gray-500">
                    <div className="flex items-center gap-2">
                        <Clock className="w-3 h-3" />
                        {new Date(log.timestamp * 1000).toLocaleString()}
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black tracking-widest ${log.prediction === 1 ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                      {log.prediction === 1 ? 'APPROVED' : 'DENIED'}
                    </span>
                  </td>
                  <td className="p-4 text-xs text-gray-400">
                    {Object.entries(data.input).slice(0, 3).map(([k, v]: any) => `${k}:${v}`).join(', ')}...
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                        <Hash className="w-3 h-3 text-neon-blue" />
                        <span className="font-mono text-[10px] text-neon-blue group-hover:text-white truncate max-w-[200px]">
                            {log.hash}
                        </span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {logs.length === 0 && !loading && (
          <div className="p-20 text-center text-gray-600 italic"> Ledger is empty. Execute a prediction to generate a block.</div>
        )}
      </div>
    </div>
  );
}
