'use client';

import { RefreshCcw, WifiOff } from 'lucide-react';

interface ConnectionErrorProps {
  error: string;
  onRetry: () => void;
}

export function ConnectionError({ error, onRetry }: ConnectionErrorProps) {
  return (
    <div className="max-w-xl mx-auto my-8 p-8 bg-red-500/5 border border-red-500/10 rounded-[2rem] backdrop-blur-xl animate-in fade-in slide-in-from-top-4 duration-700">
      <div className="flex flex-col items-center text-center space-y-6">
        <div className="p-5 bg-red-500/10 rounded-3xl shadow-inner group transition-all duration-500">
          <WifiOff className="w-10 h-10 text-red-500" />
        </div>
        
        <div className="space-y-2">
          <h2 className="text-2xl font-extrabold text-white tracking-tight">Device Not Reachable</h2>
          <p className="text-slate-400 text-sm max-w-xs mx-auto leading-relaxed">
            We're unable to establish a connection with the controller. Please ensure the system is powered and online.
          </p>
        </div>

        <div className="w-full">
          <button
            onClick={onRetry}
            className="w-full flex items-center justify-center gap-2 bg-white text-slate-950 hover:bg-slate-100 px-8 py-4 rounded-2xl font-bold transition-all active:scale-[0.98] shadow-lg shadow-white/5"
          >
            <RefreshCcw className="w-5 h-5" />
            Reconnect System
          </button>
        </div>

        <details className="w-full group">
          <summary className="text-[0.6rem] font-bold uppercase tracking-[0.2em] text-slate-600 hover:text-slate-400 cursor-pointer transition-colors list-none py-2">
            View Error Details
          </summary>
          <div className="mt-2 p-4 bg-black/40 rounded-2xl border border-white/5 text-[0.7rem] font-mono text-red-400/70 break-all text-left">
            {error}
          </div>
        </details>
      </div>
    </div>
  );
}


