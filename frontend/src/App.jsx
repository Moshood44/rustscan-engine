import { useState, useEffect, useRef } from 'react';
import { Search, ShieldCheck, Activity, AlertTriangle, Terminal, Twitter } from 'lucide-react';

function App() {
  const [walletAddress, setWalletAddress] = useState('');
  const [scanState, setScanState] = useState('idle'); // idle | scanning | complete
  const [logs, setLogs] = useState([]);
  const [scanResult, setScanResult] = useState(null);
  const logsEndRef = useRef(null);

  const handleScan = async (e) => {
    e.preventDefault();
    if (!walletAddress.trim()) return;
    
    setScanState('scanning');
    setLogs(["Initiating scan request..."]);
    setScanResult(null);

    try {
      const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080';
      const response = await fetch(`${API_BASE}/api/scan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address: walletAddress })
      });

      if (!response.ok) {
        throw new Error('Scan failed. Ensure backend and API key are active.');
      }

      const data = await response.json();
      
      // We simulate terminal logs with artificial delay for aesthetic effect
      const logsSequence = data.terminal_logs;
      let currentStep = 0;
      
      const interval = setInterval(() => {
        if (currentStep < logsSequence.length) {
          setLogs(prev => [...prev, `[${new Date().toISOString().split('T')[1].slice(0, 8)}] > ${logsSequence[currentStep]}`]);
          currentStep++;
        } else {
          clearInterval(interval);
          setScanResult(data);
          setScanState('complete');
        }
      }, 600);
      
    } catch(err) {
       setLogs(prev => [...prev, `[ERROR] > ${err.message}`]);
       setScanState('complete'); // Or an 'error' state, but kept simple
    }
  };

  useEffect(() => {
    if (logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);

  return (
    <div className="min-h-screen bg-obsidian text-slate-200 font-sans flex flex-col items-center p-6 relative overflow-hidden selection:bg-rust-orange/30 selection:text-white">
      {/* Background Decorative Gradient Elements */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-rust-orange/10 blur-[150px] rounded-full pointer-events-none -z-10" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-cyber-blue/10 blur-[150px] rounded-full pointer-events-none -z-10" />

      {/* Main Content Area */}
      <header className="w-full max-w-4xl mt-12 mb-16 text-center flex flex-col items-center">
        <div className="flex items-center gap-4 mb-4">
          <div className="p-3 bg-rust-orange/10 border border-rust-orange/30 rounded-xl">
            <ShieldCheck className="w-10 h-10 text-rust-orange" />
          </div>
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-white drop-shadow-lg">
            RustScan
          </h1>
        </div>
        <p className="text-xl text-slate-400 font-mono tracking-widest max-w-2xl mx-auto uppercase text-sm md:text-base">
          High-Precision Cross-Chain Analytics Engine
        </p>
      </header>

      <main className="w-full max-w-4xl flex-grow flex flex-col items-center">
        {/* Input Section */}
        <section className="w-full mb-12">
          <form onSubmit={handleScan} className="flex flex-col md:flex-row gap-4 w-full">
            <div className="relative flex-grow group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-500 group-focus-within:text-cyber-blue transition-colors" />
              <input 
                type="text" 
                value={walletAddress}
                onChange={(e) => setWalletAddress(e.target.value)}
                placeholder="Enter Wallet or Contract Address (0x...)" 
                disabled={scanState === 'scanning'}
                className="w-full bg-[#161b22] border border-slate-700 focus:border-cyber-blue/50 focus:ring-1 focus:ring-cyber-blue/50 rounded-xl py-4 pl-14 pr-4 text-white font-mono placeholder:text-slate-600 outline-none transition-all shadow-inner disabled:opacity-50"
              />
            </div>
            <button 
              type="submit" 
              disabled={scanState === 'scanning' || !walletAddress.trim()}
              className="bg-rust-orange hover:bg-[#de4b35] text-white font-semibold py-4 px-10 rounded-xl shadow-[0_0_15px_rgba(206,65,43,0.3)] hover:shadow-[0_0_25px_rgba(206,65,43,0.6)] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-[0_0_15px_rgba(206,65,43,0.3)] transition-all font-sans tracking-wide uppercase text-sm md:text-base whitespace-nowrap"
            >
              {scanState === 'scanning' ? 'Scanning...' : 'Scan Wallet'}
            </button>
          </form>
        </section>

        {/* Terminal Output Section */}
        {(scanState === 'scanning' || scanState === 'complete') && (
          <section className="w-full mb-12 max-w-3xl animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-[#0a0d12] border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
              <div className="bg-[#121820] border-b border-slate-800 px-4 py-2 flex items-center gap-2">
                <Terminal className="w-4 h-4 text-slate-500" />
                <span className="text-xs font-mono text-slate-500">rust-scanner@mainnet ~ </span>
              </div>
              <div className="p-6 h-[250px] overflow-y-auto font-mono text-sm md:text-base flex flex-col gap-2 relative">
                 {logs.map((log, index) => (
                   <span key={index} className={`${index === logs.length - 1 && scanState === 'scanning' ? 'text-cyber-blue animate-pulse' : log.includes('[ERROR]') ? 'text-red-500' : 'text-slate-400'}`}>
                     {log}
                   </span>
                 ))}
                 <div ref={logsEndRef} />
                 {scanState === 'scanning' && (
                    <span className="inline-block w-2 h-5 bg-cyber-blue animate-pulse mt-2" />
                 )}
              </div>
            </div>
          </section>
        )}

        {/* Trust Dashboard */}
        {(scanState === 'complete' && scanResult) && (
          <section className="w-full grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
            {/* Card 1: Security */}
            <div className="bg-[#161b22]/80 backdrop-blur border border-slate-800 rounded-2xl p-6 shadow-lg hover:border-cyber-blue/40 transition-colors group">
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-slate-400 font-medium uppercase tracking-wider text-sm">Security</h3>
                <div className="p-2 bg-cyber-blue/10 rounded-lg group-hover:bg-cyber-blue/20 transition-colors">
                  <ShieldCheck className="w-6 h-6 text-cyber-blue" />
                </div>
              </div>
              <p className="text-lg md:text-xl font-bold text-white mb-2 leading-tight">{scanResult.security}</p>
              <p className="text-sm text-green-400 font-mono">Monitored</p>
            </div>

            {/* Card 2: Activity */}
            <div className="bg-[#161b22]/80 backdrop-blur border border-slate-800 rounded-2xl p-6 shadow-lg hover:border-slate-600 transition-colors group">
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-slate-400 font-medium uppercase tracking-wider text-sm">Activity</h3>
                <div className="p-2 bg-slate-800 rounded-lg group-hover:bg-slate-700 transition-colors">
                  <Activity className="w-6 h-6 text-slate-300" />
                </div>
              </div>
              <p className="text-lg md:text-xl font-bold text-white mb-2 leading-tight">{scanResult.activity}</p>
              <p className="text-sm text-slate-500 font-mono">Data retrieved</p>
            </div>

            {/* Card 3: Risk Level */}
            <div className="bg-[#161b22]/80 backdrop-blur border border-slate-800 rounded-2xl p-6 shadow-lg hover:border-green-500/40 transition-colors group">
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-slate-400 font-medium uppercase tracking-wider text-sm">Risk Level</h3>
                <div className={`p-2 rounded-lg transition-colors ${scanResult.risk_level.includes('High') ? 'bg-rust-orange/10 group-hover:bg-rust-orange/20' : 'bg-green-500/10 group-hover:bg-green-500/20'}`}>
                  <AlertTriangle className={`w-6 h-6 ${scanResult.risk_level.includes('High') ? 'text-rust-orange' : 'text-green-500'}`} />
                </div>
              </div>
              <p className="text-lg md:text-xl font-bold text-white mb-2 leading-tight">{scanResult.risk_level}</p>
              <p className={`text-sm font-mono ${scanResult.risk_level.includes('High') ? 'text-rust-orange' : 'text-green-400'}`}>Assessed</p>
            </div>
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="w-full max-w-5xl mt-20 pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-3">
          <span className="text-slate-500 font-mono text-sm">Target Asset: </span>
          <span className="text-rust-orange font-bold px-3 py-1 bg-rust-orange/10 rounded-full border border-rust-orange/20">
            $RSCAN <span className="text-white ml-2">$0.042</span>
          </span>
        </div>
        
        <a 
          href="https://x.com/0X_Santan_dev" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-slate-400 hover:text-white transition-colors flex items-center gap-2"
        >
          <Twitter className="w-5 h-5" />
          <span className="font-mono text-sm">@0X_Santan_dev</span>
        </a>
      </footer>
    </div>
  );
}

export default App;
