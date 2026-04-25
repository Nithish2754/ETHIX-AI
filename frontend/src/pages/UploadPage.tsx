import { useState } from 'react';
import { Upload, FileUp, CheckCircle2, AlertCircle } from 'lucide-react';
import axios from 'axios';

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [dataInfo, setDataInfo] = useState<any>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const uploadFile = async () => {
    if (!file) return;
    setStatus('uploading');
    
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/upload-dataset`, formData);
      setDataInfo(response.data);
      setStatus('success');
    } catch (err) {
      console.error(err);
      setStatus('error');
    }
  };

  const trainModel = async () => {
    try {
        const target = dataInfo.columns[dataInfo.columns.length - 1];
        const sensitive = dataInfo.columns[0]; 
        await axios.post(`${import.meta.env.VITE_API_URL}/train-model?filename=${dataInfo.filename}&target_col=${target}`);
        alert("Model trained successfully!");
    } catch (err) {
        alert("Training failed: " + err);
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8 py-12">
      <div className="text-center space-y-4">
        <h2 className="text-4xl font-bold glow-text">Upload Dataset</h2>
        <p className="text-gray-400">Upload your CSV file to analyze bias and train a fair model.</p>
      </div>

      <div className={`glass-card p-12 border-2 border-dashed transition-all ${file ? 'border-neon-blue' : 'border-white/10'}`}>
        <label className="flex flex-col items-center justify-center cursor-pointer space-y-4">
          <FileUp className={`w-16 h-16 ${file ? 'text-neon-blue' : 'text-gray-500'}`} />
          <span className="text-lg font-medium">{file ? file.name : 'Select CSV File'}</span>
          <input type="file" className="hidden" accept=".csv" onChange={handleFileChange} />
        </label>
      </div>

      {file && status === 'idle' && (
        <button 
          onClick={uploadFile}
          className="w-full neon-button py-4 rounded-xl font-bold text-lg"
        >
          Initialize Analysis
        </button>
      )}

      {status === 'uploading' && (
        <div className="text-center p-4 glass-card border-neon-blue animate-pulse">
           Analyzing data architecture...
        </div>
      )}

      {status === 'success' && dataInfo && (
        <div className="glass-card p-6 space-y-4 border-green-500/30">
          <div className="flex items-center gap-2 text-green-400 font-bold">
            <CheckCircle2 className="w-6 h-6" /> DATA ANALYZED SUCCESSFULLY
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="bg-white/5 p-3 rounded-lg">
                <div className="text-gray-400">Rows Detected</div>
                <div className="text-xl font-bold">{dataInfo.rows}</div>
            </div>
            <div className="bg-white/5 p-3 rounded-lg">
                <div className="text-gray-400">Features</div>
                <div className="text-xl font-bold">{dataInfo.columns.length}</div>
            </div>
          </div>
          <button 
            onClick={trainModel}
            className="w-full bg-white text-dark-bg py-3 rounded-lg font-bold hover:bg-neon-blue transition-colors"
          >
            Train Bias-Aware Model
          </button>
        </div>
      )}

      {status === 'error' && (
        <div className="glass-card p-6 flex items-center gap-4 border-red-500/30 text-red-400">
          <AlertCircle className="w-8 h-8" />
          <span>Upload failed. Please ensure the CSV format is correct.</span>
        </div>
      )}
    </div>
  );
}
