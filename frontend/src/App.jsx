import { useState, useEffect, useRef } from 'react';
import { 
  Search, ShieldCheck, Activity, AlertTriangle, Terminal, Twitter, 
  Menu, X, Info, HelpCircle, FileText, CheckCircle, Unlock, Users, Star, Droplet, Share2, Lock
} from 'lucide-react';

function App() {
  const [currentView, setCurrentView] = useState('scanner');
  const [walletAddress, setWalletAddress] = useState('');
  const [scanState, setScanState] = useState('idle'); // idle | scanning | complete
  const [logs, setLogs] = useState([]);
  const [scanResult, setScanResult] = useState(null);
  const [faqOpen, setFaqOpen] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const logsEndRef = useRef(null);

  // URL Hash Routing
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      if (['scanner', 'how-it-works', 'about', 'faq'].includes(hash)) {
        setCurrentView(hash);
      } else if (!hash) {
        setCurrentView('scanner');
      }
      setMobileMenuOpen(false);
    };

    window.addEventListener('hashchange', handleHashChange);
    handleHashChange(); // Initial check

    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

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
       setScanState('complete');
    }
  };

  useEffect(() => {
    if (logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);

  const toggleFaq = (index) => {
    setFaqOpen(faqOpen === index ? null : index);
  };

  const shareOnX = () => {
    if (!scanResult) return;
    const text = `I just verified ${scanResult.address.slice(0, 6)}...${scanResult.address.slice(-4)}!\n\nSecurity: ${scanResult.security}\nRisk Level: ${scanResult.risk_level}\n\nVerify yours on RustScan 🦀\n@0X_Santan_dev`;
    const url = `https://x.com/intent/tweet?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const renderNavLinks = () => (
    <>
      <a href="#scanner" className={`font-mono uppercase tracking-wide text-sm hover:text-rust-orange transition-colors ${currentView === 'scanner' ? 'text-rust-orange' : 'text-slate-400'}`}>Scanner</a>
      <a href="#how-it-works" className={`font-mono uppercase tracking-wide text-sm hover:text-rust-orange transition-colors ${currentView === 'how-it-works' ? 'text-rust-orange' : 'text-slate-400'}`}>How it Works</a>
      <a href="#about" className={`font-mono uppercase tracking-wide text-sm hover:text-rust-orange transition-colors ${currentView === 'about' ? 'text-rust-orange' : 'text-slate-400'}`}>About</a>
      <a href="#faq" className={`font-mono uppercase tracking-wide text-sm hover:text-rust-orange transition-colors ${currentView === 'faq' ? 'text-rust-orange' : 'text-slate-400'}`}>FAQ</a>
    </>
  );

  return (
    <div className="min-h-screen bg-obsidian text-slate-200 font-sans flex flex-col items-center relative overflow-hidden selection:bg-rust-orange/30 selection:text-white">
      {/* Background Decorative Gradient Elements */}
      <div className="fixed top-0 right-0 w-[500px] h-[500px] bg-rust-orange/10 blur-[150px] rounded-full pointer-events-none -z-10" />
      <div className="fixed bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-cyber-blue/10 blur-[150px] rounded-full pointer-events-none -z-10" />

      {/* Header */}
      <header className="w-full sticky top-0 z-50 bg-[#0d1117]/80 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
          <a href="#scanner" className="flex items-center gap-3 group">
            <div className="p-2 bg-rust-orange/10 border border-rust-orange/30 rounded-lg group-hover:bg-rust-orange/20 transition-colors">
              <ShieldCheck className="w-6 h-6 text-rust-orange" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white drop-shadow-lg">RustScan</span>
          </a>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            {renderNavLinks()}
          </nav>

          {/* Mobile Menu Toggle */}
          <button className="md:hidden text-slate-400 hover:text-white" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Nav */}
        {mobileMenuOpen && (
          <nav className="md:hidden bg-[#161b22] border-b border-slate-800 px-6 py-4 flex flex-col gap-4 shadow-xl">
            {renderNavLinks()}
          </nav>
        )}
      </header>

      <main className="w-full max-w-5xl flex-grow flex flex-col items-center p-6 mt-8">
        
        {/* VIEW: SCANNER */}
        {currentView === 'scanner' && (
          <div className="w-full flex flex-col items-center animate-in fade-in slide-in-from-bottom-4 duration-500">
            <header className="w-full max-w-4xl mb-12 text-center flex flex-col items-center">
              <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-white drop-shadow-lg mb-4">
                Verify Before You Trust
              </h2>
              <p className="text-lg text-slate-400 font-mono tracking-widest max-w-2xl mx-auto uppercase text-sm md:text-base">
                High-Precision Cross-Chain Analytics Engine
              </p>
            </header>

            {/* Input Section */}
            <section className="w-full mb-12 max-w-4xl">
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

            {/* Expanded Trust Dashboard */}
            {(scanState === 'complete' && scanResult) && (
              <section className="w-full animate-in fade-in slide-in-from-bottom-8 duration-700">
                <div className="flex justify-between items-end mb-6">
                  <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                    <CheckCircle className="text-cyber-blue w-6 h-6" /> Scan Results
                  </h3>
                  <button onClick={shareOnX} className="flex items-center gap-2 bg-[#1da1f2]/10 hover:bg-[#1da1f2]/20 text-[#1da1f2] border border-[#1da1f2]/30 px-4 py-2 rounded-lg font-mono text-sm transition-colors">
                    <Share2 className="w-4 h-4" /> Share on X
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Card 1: Risk Level */}
                  <div className={`bg-[#161b22]/80 backdrop-blur border rounded-2xl p-6 transition-colors group ${scanResult.risk_level.includes('Danger') || scanResult.risk_level.includes('High') ? 'border-red-500/30 hover:border-red-500/60 shadow-[0_0_20px_rgba(239,68,68,0.1)]' : 'border-slate-800 hover:border-rust-orange/40 shadow-lg'}`}>
                    <div className="flex items-start justify-between mb-4">
                      <h3 className="text-slate-400 font-medium uppercase tracking-wider text-sm">Overall Risk</h3>
                      <div className={`p-2 rounded-lg transition-colors ${scanResult.risk_level.includes('Danger') || scanResult.risk_level.includes('High') ? 'bg-red-500/10 text-red-500' : 'bg-green-500/10 text-green-500'}`}>
                        <AlertTriangle className="w-6 h-6" />
                      </div>
                    </div>
                    <p className={`text-lg md:text-xl font-bold mb-2 leading-tight ${scanResult.risk_level.includes('Danger') || scanResult.risk_level.includes('High') ? 'text-red-500' : 'text-white'}`}>{scanResult.risk_level}</p>
                    <p className="text-sm font-mono text-slate-500">Engine Assessment</p>
                  </div>

                  {/* Card 2: Mint Authority */}
                  <div className={`bg-[#161b22]/80 backdrop-blur border rounded-2xl p-6 transition-colors group ${scanResult.mint_authority?.includes('Danger') ? 'border-red-500/30 hover:border-red-500/60' : 'border-slate-800 hover:border-cyber-blue/40'}`}>
                    <div className="flex items-start justify-between mb-4">
                      <h3 className="text-slate-400 font-medium uppercase tracking-wider text-sm">Mint Authority</h3>
                      <div className="p-2 bg-slate-800 rounded-lg group-hover:bg-slate-700 transition-colors">
                        <ShieldCheck className="w-6 h-6 text-slate-300" />
                      </div>
                    </div>
                    <p className={`text-lg md:text-xl font-bold mb-2 leading-tight ${scanResult.mint_authority?.includes('Danger') ? 'text-red-500' : 'text-white'}`}>{scanResult.mint_authority || 'Unknown'}</p>
                    <p className="text-sm text-slate-500 font-mono">Token Supply Control</p>
                  </div>

                  {/* Card 3: Freeze Authority */}
                  <div className={`bg-[#161b22]/80 backdrop-blur border rounded-2xl p-6 transition-colors group ${scanResult.freeze_authority?.includes('Danger') ? 'border-red-500/30 hover:border-red-500/60' : 'border-slate-800 hover:border-cyber-blue/40'}`}>
                    <div className="flex items-start justify-between mb-4">
                      <h3 className="text-slate-400 font-medium uppercase tracking-wider text-sm">Freeze Authority</h3>
                      <div className="p-2 bg-slate-800 rounded-lg group-hover:bg-slate-700 transition-colors">
                        <Lock className="w-6 h-6 text-slate-300" />
                      </div>
                    </div>
                    <p className={`text-lg md:text-xl font-bold mb-2 leading-tight ${scanResult.freeze_authority?.includes('Danger') ? 'text-red-500' : 'text-white'}`}>{scanResult.freeze_authority || 'Unknown'}</p>
                    <p className="text-sm text-slate-500 font-mono">Account Lock Control</p>
                  </div>

                  {/* Card 4: LP Lock Status */}
                  <div className={`bg-[#161b22]/80 backdrop-blur border rounded-2xl p-6 transition-colors group ${scanResult.lp_lock_status?.includes('Unlocked') ? 'border-red-500/30 hover:border-red-500/60' : 'border-slate-800 hover:border-cyber-blue/40'}`}>
                    <div className="flex items-start justify-between mb-4">
                      <h3 className="text-slate-400 font-medium uppercase tracking-wider text-sm">LP Lock Status</h3>
                      <div className="p-2 bg-slate-800 rounded-lg group-hover:bg-slate-700 transition-colors">
                        <Droplet className="w-6 h-6 text-slate-300" />
                      </div>
                    </div>
                    <p className={`text-lg md:text-xl font-bold mb-2 leading-tight ${scanResult.lp_lock_status?.includes('Unlocked') ? 'text-red-500' : 'text-white'}`}>{scanResult.lp_lock_status || 'Unknown'}</p>
                    <p className="text-sm text-slate-500 font-mono">Liquidity Pool Security</p>
                  </div>

                  {/* Card 5: Top 10 Holders */}
                  <div className={`bg-[#161b22]/80 backdrop-blur border rounded-2xl p-6 transition-colors group ${scanResult.top_10_holder_concentration?.includes('Danger') ? 'border-red-500/30 hover:border-red-500/60' : 'border-slate-800 hover:border-cyber-blue/40'}`}>
                    <div className="flex items-start justify-between mb-4">
                      <h3 className="text-slate-400 font-medium uppercase tracking-wider text-sm">Top 10 Holders</h3>
                      <div className="p-2 bg-slate-800 rounded-lg group-hover:bg-slate-700 transition-colors">
                        <Users className="w-6 h-6 text-slate-300" />
                      </div>
                    </div>
                    <p className={`text-lg md:text-xl font-bold mb-2 leading-tight ${scanResult.top_10_holder_concentration?.includes('Danger') ? 'text-red-500' : 'text-white'}`}>{scanResult.top_10_holder_concentration || 'Unknown'}</p>
                    <p className="text-sm text-slate-500 font-mono">Wallet Concentration</p>
                  </div>
                  
                  {/* Card 6: Dev Reputation */}
                  <div className={`bg-[#161b22]/80 backdrop-blur border rounded-2xl p-6 transition-colors group ${scanResult.creator_reputation?.includes('Danger') ? 'border-red-500/30 hover:border-red-500/60' : 'border-slate-800 hover:border-cyber-blue/40'}`}>
                    <div className="flex items-start justify-between mb-4">
                      <h3 className="text-slate-400 font-medium uppercase tracking-wider text-sm">Dev Reputation</h3>
                      <div className="p-2 bg-slate-800 rounded-lg group-hover:bg-slate-700 transition-colors">
                        <Star className="w-6 h-6 text-slate-300" />
                      </div>
                    </div>
                    <p className={`text-lg md:text-xl font-bold mb-2 leading-tight ${scanResult.creator_reputation?.includes('Danger') ? 'text-red-500' : 'text-white'}`}>{scanResult.creator_reputation || 'Unknown'}</p>
                    <p className="text-sm text-slate-500 font-mono">RugCheck.xyz integration</p>
                  </div>
                  
                  {/* Card 7: Honeypot Test (Bonus) */}
                  <div className={`bg-[#161b22]/80 backdrop-blur border rounded-2xl p-6 transition-colors group md:col-span-2 lg:col-span-3 ${scanResult.honeypot_test?.includes('Danger') ? 'border-red-500/30 hover:border-red-500/60' : 'border-slate-800 hover:border-green-500/40 shadow-lg'}`}>
                    <div className="flex items-start justify-between mb-4">
                      <h3 className="text-slate-400 font-medium uppercase tracking-wider text-sm">Honeypot Simulation</h3>
                      <div className={`p-2 rounded-lg transition-colors ${scanResult.honeypot_test?.includes('Danger') ? 'bg-red-500/10 text-red-500' : 'bg-green-500/10 text-green-500'}`}>
                        {scanResult.honeypot_test?.includes('Danger') ? <AlertTriangle className="w-6 h-6" /> : <Unlock className="w-6 h-6" />}
                      </div>
                    </div>
                    <p className={`text-lg md:text-xl font-bold mb-2 leading-tight ${scanResult.honeypot_test?.includes('Danger') ? 'text-red-500' : 'text-white'}`}>{scanResult.honeypot_test || 'Unknown'}</p>
                    <p className="text-sm text-slate-500 font-mono">Buy/Sell Tx Simulation Logic</p>
                  </div>

                </div>
              </section>
            )}
          </div>
        )}

        {/* VIEW: HOW IT WORKS */}
        {currentView === 'how-it-works' && (
          <div className="w-full max-w-3xl animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-white mb-4">How It Works</h2>
              <p className="text-slate-400 font-mono tracking-wide">The mechanics behind the scanner.</p>
            </div>
            
            <div className="relative border-l-2 border-slate-800 ml-6 md:ml-0 pl-8 md:pl-0 md:border-none space-y-12">
               <div className="md:flex items-center justify-between group">
                  <div className="md:w-5/12 text-right hidden md:block pr-8">
                     <h3 className="text-xl font-bold text-white mb-2">1. The Payload</h3>
                     <p className="text-slate-400 text-sm">You input a smart contract or wallet address. Our Vite frontend securely packages the payload.</p>
                  </div>
                  <div className="absolute left-[-9px] md:relative md:left-0 w-4 h-4 rounded-full bg-rust-orange border-4 border-[#0d1117] group-hover:scale-125 transition-transform"></div>
                  <div className="md:w-5/12 text-left md:pl-8">
                     <h3 className="text-xl font-bold text-white mb-2 md:hidden">1. The Payload</h3>
                     <p className="text-slate-400 text-sm md:hidden mb-4">You input a smart contract or wallet address. Our Vite frontend securely packages the payload.</p>
                     <div className="bg-[#161b22] p-4 rounded-xl border border-slate-800 font-mono text-xs text-cyber-blue">
                       POST /api/scan<br/>
                       {`{ "address": "0x..." }`}
                     </div>
                  </div>
               </div>
               
               <div className="md:flex items-center justify-between group flex-row-reverse">
                  <div className="md:w-5/12 text-left hidden md:block pl-8">
                     <h3 className="text-xl font-bold text-white mb-2">2. Rust Axum Engine</h3>
                     <p className="text-slate-400 text-sm">The payload is caught by our sub-millisecond Rust backend, securely processing the architecture.</p>
                  </div>
                  <div className="absolute left-[-9px] md:relative md:left-0 w-4 h-4 rounded-full bg-cyber-blue border-4 border-[#0d1117] group-hover:scale-125 transition-transform"></div>
                  <div className="md:w-5/12 text-right md:pr-8">
                     <h3 className="text-xl font-bold text-white mb-2 md:hidden">2. Rust Axum Engine</h3>
                     <p className="text-slate-400 text-sm md:hidden mb-4">The payload is caught by our sub-millisecond Rust backend, securely processing the architecture.</p>
                     <div className="bg-[#161b22] p-4 rounded-xl border border-slate-800 text-center">
                       <Terminal className="w-8 h-8 mx-auto text-slate-500" />
                     </div>
                  </div>
               </div>

               <div className="md:flex items-center justify-between group">
                  <div className="md:w-5/12 text-right hidden md:block pr-8">
                     <h3 className="text-xl font-bold text-white mb-2">3. RPC Node Fetching</h3>
                     <p className="text-slate-400 text-sm">The Rust engine communicates directly with Alchemy RPCs to fetch cross-chain data asynchronously.</p>
                  </div>
                  <div className="absolute left-[-9px] md:relative md:left-0 w-4 h-4 rounded-full bg-green-500 border-4 border-[#0d1117] group-hover:scale-125 transition-transform"></div>
                  <div className="md:w-5/12 text-left md:pl-8">
                     <h3 className="text-xl font-bold text-white mb-2 md:hidden">3. RPC Node Fetching</h3>
                     <p className="text-slate-400 text-sm md:hidden mb-4">The Rust engine communicates directly with Alchemy RPCs to fetch cross-chain data asynchronously.</p>
                     <div className="bg-[#161b22] p-4 rounded-xl border border-slate-800 text-center">
                       <Activity className="w-8 h-8 mx-auto text-slate-500" />
                     </div>
                  </div>
               </div>
            </div>
          </div>
        )}

        {/* VIEW: ABOUT */}
        {currentView === 'about' && (
          <div className="w-full max-w-3xl animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div className="bg-[#161b22]/50 border border-slate-800 rounded-3xl p-8 md:p-12 backdrop-blur-sm relative overflow-hidden">
               <div className="absolute top-0 right-0 w-64 h-64 bg-rust-orange/5 blur-[100px] rounded-full pointer-events-none" />
               <h2 className="text-3xl md:text-5xl font-bold text-white mb-8 border-b border-slate-800 pb-6">The Truth Behind the Code</h2>
               
               <div className="space-y-6 text-slate-300 leading-relaxed">
                 <p className="text-lg">
                   The cryptocurrency landscape is a dark forest. Millions of dollars are lost every day to unverified smart contracts, hidden mint routines, and concealed liquidity drains. 
                 </p>
                 <p className="text-lg">
                   <strong>RustScan</strong> was built to illuminate that dark forest.
                 </p>
                 <div className="my-8 p-6 bg-[#0a0d12] border-l-4 border-rust-orange rounded-r-xl">
                   <p className="text-xl font-mono text-rust-orange italic">
                     "Our mission is to bring unflinching transparency to Web3 using high-performance engineering."
                   </p>
                 </div>
                 <p className="text-lg">
                   Why Rust? In Web3, milliseconds matter. While other scanners rely on bloated Node.js backends that bottleneck during high network congestion, RustScan is engineered from the ground up utilizing <span className="text-cyber-blue font-mono">Rust</span> and <span className="text-cyber-blue font-mono">Axum</span>. 
                 </p>
                 <p className="text-lg">
                   This grants us sub-millisecond precision, memory safety without garbage collection overhead, and the ability to parse massive RPC payloads instantly. We don't just verify trust; we compile it.
                 </p>
               </div>
             </div>
          </div>
        )}

        {/* VIEW: FAQ */}
        {currentView === 'faq' && (
          <div className="w-full max-w-3xl animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-white mb-4">Frequently Asked Questions</h2>
              <p className="text-slate-400 font-mono tracking-wide">Got questions? We've got data.</p>
            </div>

            <div className="space-y-4">
              {[
                {
                  q: "What is a Mint Authority?",
                  a: "The Mint Authority is the wallet address that has the power to create new tokens. If this authority is active (Danger), the creator can infinitely inflate the token supply, destroying the value of your holdings. A 'Safe' status means this power has been mathematically revoked."
                },
                {
                  q: "Why is Liquidity Locking important?",
                  a: "Liquidity is the pool of funds that allows you to sell the token. If the liquidity is 'Unlocked', the creator can withdraw those funds at any time, leaving you with worthless tokens you can't sell (a 'Rug Pull'). Locking liquidity secures the trading pool."
                },
                {
                  q: "What is the Honeypot Simulation?",
                  a: "A honeypot is a malicious contract that allows you to buy tokens, but prevents you from selling them. RustScan runs a simulated environment mimicking a buy and a sell transaction to ensure two-way trading is functionally open."
                },
                {
                  q: "How does $RSCAN power this tool?",
                  a: "$RSCAN is the native utility token of the RustScan ecosystem. While the basic scanner is free, holding $RSCAN unlocks premium tier API access, ultra-low latency RPC nodes, and real-time Discord/Telegram alert webhooks for newly launched safe contracts."
                }
              ].map((faq, idx) => (
                <div key={idx} className="bg-[#161b22] border border-slate-800 rounded-xl overflow-hidden transition-all duration-300">
                  <button 
                    onClick={() => toggleFaq(idx)}
                    className="w-full flex items-center justify-between p-6 text-left focus:outline-none"
                  >
                    <span className="font-bold text-lg text-white">{faq.q}</span>
                    <span className="text-rust-orange font-mono text-xl">{faqOpen === idx ? '-' : '+'}</span>
                  </button>
                  <div className={`overflow-hidden transition-all duration-300 ease-in-out ${faqOpen === idx ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                    <div className="p-6 pt-0 text-slate-400 leading-relaxed border-t border-slate-800/50 mt-2">
                      {faq.a}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="w-full max-w-5xl mt-auto py-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4 relative z-10">
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
