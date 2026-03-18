'use client';

import { AlertTriangle, RefreshCcw, WifiOff, Terminal, ExternalLink } from 'lucide-react';

interface ConnectionErrorProps {
  error: string;
  onRetry: () => void;
  backendUrl?: string;
}

export function ConnectionError({ error, onRetry, backendUrl = 'http://localhost:3000' }: ConnectionErrorProps) {
  return (
    <div className="relative group max-w-4xl mx-auto my-12 overflow-hidden rounded-[3rem] p-1 transition-all duration-700 hover:scale-[1.01] hover:shadow-[0_0_80px_-20px_rgba(239,68,68,0.2)]">
      {/* Background Flowing Gradient */}
      <div className="absolute inset-0 bg-gradient-to-tr from-red-600/30 via-orange-600/20 to-red-600/30 animate-pulse transition-opacity duration-1000 group-hover:opacity-60" />
      
      <div className="relative bg-[#0a0f1d]/95 backdrop-blur-3xl rounded-[2.9rem] p-8 md:p-14 border border-white/5 shadow-2xl">
        <div className="grid md:grid-cols-12 gap-12 items-center">
          
          {/* Visual Indicator */}
          <div className="md:col-span-4 flex flex-col items-center justify-center space-y-6">
            <div className="relative">
              {/* Outer Rings */}
              <div className="absolute inset-[-40px] border border-red-500/10 rounded-full animate-[ping_3s_linear_infinite]" />
              <div className="absolute inset-[-20px] border border-red-500/20 rounded-full animate-[ping_4s_linear_infinite_1s]" />
              
              <div className="w-32 h-32 bg-gradient-to-br from-red-500/20 to-orange-500/10 rounded-[2.5rem] flex items-center justify-center border border-red-500/30 shadow-[0_0_50px_rgba(239,68,68,0.15)] relative z-10">
                <WifiOff className="w-16 h-16 text-red-500 drop-shadow-[0_0_10px_rgba(239,68,68,0.5)]" />
              </div>
              
              <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-red-600 rounded-2xl border-4 border-[#0a0f1d] flex items-center justify-center z-20 shadow-xl">
                <AlertTriangle className="w-5 h-5 text-white" />
              </div>
            </div>
            
            <div className="text-center space-y-2">
              <span className="inline-flex items-center gap-2 text-[0.65rem] font-black uppercase tracking-[0.3em] text-red-500 bg-red-500/10 px-4 py-1.5 rounded-full border border-red-500/20">
                Connection Fault
              </span>
              <p className="text-slate-500 text-sm font-medium">ERROR_CODE: BACKEND_UNREACHABLE</p>
            </div>
          </div>

          {/* Main Content */}
          <div className="md:col-span-8 space-y-8">
            <div className="space-y-4">
              <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight leading-none bg-clip-text text-transparent bg-gradient-to-b from-white to-slate-400">
                Oops! System Disconnected.
              </h2>
              <p className="text-lg text-slate-400 leading-relaxed font-medium">
                We're having trouble reaching the command center. This usually means the backend service at <code className="text-red-400/80 bg-red-500/5 px-2 py-0.5 rounded border border-red-500/10 font-mono">{backendUrl}</code> isn't active.
              </p>
            </div>

            {/* Error Log */}
            <div className="bg-black/40 rounded-3xl p-6 border border-white/5 font-mono text-[0.8rem] space-y-3 group-hover:border-red-500/20 transition-all duration-500 group-hover:translate-x-1">
              <div className="flex items-center justify-between text-slate-500">
                <div className="flex items-center gap-2">
                  <Terminal className="w-4 h-4" />
                  <span className="uppercase tracking-widest text-[0.6rem] font-bold">Raw Stack Trace / Message</span>
                </div>
                <div className="flex gap-1">
                  <div className="w-2 h-2 rounded-full bg-slate-800" />
                  <div className="w-2 h-2 rounded-full bg-slate-800" />
                  <div className="w-2 h-2 rounded-full bg-slate-800" />
                </div>
              </div>
              <p className="text-red-400/90 leading-relaxed break-all selection:bg-red-500/30">{error}</p>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4 items-center">
              <button
                onClick={onRetry}
                className="w-full sm:w-auto min-w-[200px] group/btn bg-white text-slate-950 hover:bg-slate-100 px-8 py-4 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all active:scale-[0.97] shadow-[0_10px_30px_-10px_rgba(255,255,255,0.3)]"
              >
                <RefreshCcw className="w-5 h-5 group-hover/btn:rotate-180 transition-transform duration-500" />
                Reconnect System
              </button>
              
              <a 
                href={backendUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-full sm:w-auto text-slate-400 hover:text-white px-6 py-4 rounded-2xl font-semibold flex items-center justify-center gap-2 transition-colors border border-transparent hover:border-white/5 hover:bg-white/5"
              >
                Open API Docs
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>

            {/* Diagnostics */}
            <div className="pt-8 border-t border-white/5 grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <h4 className="text-[0.6rem] font-black tracking-widest text-slate-500 uppercase">Check Status</h4>
                <ul className="space-y-1.5 text-xs text-slate-400">
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
                    API Service Process
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                    Port 3000 Listening
                  </li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="text-[0.6rem] font-black tracking-widest text-slate-500 uppercase">Recovery Steps</h4>
                <p className="text-xs text-slate-500 leading-tight">
                  Run <code className="text-white/80">npm run dev</code> in the backend directory to restart.
                </p>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
