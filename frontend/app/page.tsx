'use client';

import { useState, useEffect } from 'react';
import { mk3Api, irrigationApi } from '@/lib/api';
import { 
  Droplet, 
  Power, 
  Activity, 
  Battery, 
  Zap, 
  Cpu, 
  RefreshCcw,
  CheckCircle2,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { ConnectionError } from '@/components/ConnectionError';

const getStatusProps = (state: number | null) => {
  switch (state) {
    case 0:
      return { label: "OFF", color: "slate", icon: "⛔" };
    case 1:
      return { label: "CHARGING", color: "amber", icon: "⚡" };
    case 2:
      return { label: "OPERATIONAL", color: "emerald", icon: "✅" };
    case 3:
      return { label: "SHORT FINDING", color: "orange", icon: "🔍" };
    case 10:
      return { label: "LEAK FINDING", color: "red", icon: "💧" };
    case 99:
      return { label: "UNKNOWN", color: "slate", icon: "❓" };
    default:
      return { label: "---", color: "slate", icon: null };
  }
};

export default function Dashboard() {
  const [mk3State, setMk3State] = useState<any>(null);
  const [mk3Voltage, setMk3Voltage] = useState<any>(null);
  const [mk3Current, setMk3Current] = useState<any>(null);
  const [decoders, setDecoders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const statePromise = mk3Api.getState();
      const voltagePromise = mk3Api.getVoltage();
      const currentPromise = mk3Api.getCurrent();
      const detailsPromise = mk3Api.getDetails();

      const [state, voltage, current, details] = await Promise.all([
        statePromise,
        voltagePromise,
        currentPromise,
        detailsPromise
      ]);

      setMk3State(state.state);
      setMk3Voltage(voltage.voltage);
      setMk3Current(current.current);
      setDecoders(details.details || []);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000); // 30s refresh
    return () => clearInterval(interval);
  }, []);

  const handleToggle = async (luId: string, stationId: string) => {
    try {
      await irrigationApi.toggle(luId, stationId);
      // Refresh details for this specific LU or just everything
      fetchData();
    } catch (err: any) {
      alert(`Error toggling: ${err.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-black text-white p-4 md:p-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
          <div>
            <h1 className="text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400">
              Irrigation Controller
            </h1>
            <p className="text-slate-400 mt-2 flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${loading ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400'} shadow-[0_0_8px_rgba(52,211,153,0.6)]`}></span>
              {loading ? 'Refreshing status...' : 'System Online'}
            </p>
          </div>
          <button 
            onClick={fetchData}
            disabled={loading}
            className="flex items-center gap-2 bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700 px-4 py-2 rounded-xl transition-all active:scale-95 disabled:opacity-50"
          >
            <RefreshCcw className={`w-4 h-4 ${loading ? 'animate-spin text-blue-400' : 'text-slate-300'}`} />
            Refresh
          </button>
        </header>


        {error && (
          <ConnectionError 
            error={error} 
            onRetry={fetchData} 
            backendUrl="http://localhost:3000"
          />
        )}


        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {(() => {
            const props = getStatusProps(mk3State);
            return (
              <StatCard 
                title="System State" 
                value={props.label} 
                icon={props.icon ? <span className="text-xl">{props.icon}</span> : <Activity className="w-6 h-6 text-blue-400" />}
                color={props.color}
              />
            );
          })()}
          <StatCard 
            title="Line Voltage" 
            value={mk3Voltage != null ? `${mk3Voltage}V` : '---'} 
            icon={<Zap className="w-6 h-6 text-amber-400" />}
            color="amber"
          />
          <StatCard 
            title="Line Current" 
            value={mk3Current != null ? `${mk3Current}mA` : '---'} 
            icon={<Battery className="w-6 h-6 text-emerald-400" />}
            color="emerald"
          />
        </div>

        {/* Decoders Section */}
        <section className="space-y-6">
          <div className="flex items-center gap-3">
            <Cpu className="w-6 h-6 text-blue-400" />
            <h2 className="text-2xl font-bold">Decoder Stations</h2>
          </div>

          {loading && decoders.length === 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
              {[1, 2, 3].map(i => <div key={i} className="h-48 bg-slate-800/50 rounded-2xl border border-slate-700"></div>)}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {decoders.map((decoder) => (
                <DecoderCard 
                  key={decoder.addr} 
                  decoder={decoder} 
                  onToggle={() => handleToggle(decoder.addr, '1')} 
                />
              ))}
              {decoders.length === 0 && !loading && (
                <div className="col-span-full py-12 text-center bg-slate-800/30 rounded-3xl border border-dashed border-slate-700">
                  <Droplet className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                  <p className="text-slate-500">No decoders detected on the line</p>
                </div>
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, color }: { title: string, value: string, icon: React.ReactNode, color: string }) {
  const colorMap: Record<string, string> = {
    emerald: 'from-emerald-950/20 to-emerald-900/10 border-emerald-500/20',
    blue: 'from-blue-950/20 to-blue-900/10 border-blue-500/20',
    amber: 'from-amber-950/20 to-amber-900/10 border-amber-500/20',
    orange: 'from-orange-950/20 to-orange-900/10 border-orange-500/20',
    red: 'from-red-950/20 to-red-900/10 border-red-500/20',
    slate: 'from-slate-800/20 to-slate-700/10 border-slate-600/20',
  };

  return (
    <div className={`p-6 rounded-3xl border backdrop-blur-xl bg-gradient-to-br transition-all hover:scale-[1.02] ${colorMap[color] || colorMap.slate}`}>
      <div className="flex justify-between items-start mb-4">
        <div className="p-3 bg-black/40 rounded-2xl border border-white/5">
          {icon}
        </div>
      </div>
      <p className="text-slate-400 font-medium text-sm mb-1">{title}</p>
      <h3 className="text-3xl font-bold tracking-tight">{value}</h3>
    </div>
  );
}

function DecoderCard({ decoder, onToggle }: { decoder: any, onToggle: () => void }) {
  const isOn = decoder.value === 1;

  return (
    <div className="group relative p-1 rounded-[2rem] transition-all hover:shadow-[0_0_30px_rgba(59,130,246,0.15)] overflow-hidden">
      {/* Dynamic Border Gradient */}
      <div className={`absolute inset-0 bg-gradient-to-br ${isOn ? 'from-blue-500 via-emerald-500 to-blue-500 animate-gradient-xy' : 'from-slate-700 to-slate-800'} transition-all`} />
      
      <div className="relative bg-slate-900/90 backdrop-blur-xl rounded-[1.9rem] p-6 h-full flex flex-col">
        <div className="flex justify-between items-start mb-4">
          <div>
            <span className="text-[0.65rem] font-bold uppercase tracking-widest text-blue-400 bg-blue-400/10 px-2 py-0.5 rounded-full mb-2 inline-block">
              Unit ID: {decoder.addr}
            </span>
            <h3 className="text-xl font-bold truncate pr-4">{decoder.alias || `Station ${decoder.addr}`}</h3>
          </div>
          <div className={`p-2 rounded-xl border ${isOn ? 'bg-emerald-400/20 border-emerald-400/40' : 'bg-slate-800/40 border-slate-700/40'}`}>
            <Droplet className={`w-5 h-5 ${isOn ? 'text-emerald-400 fill-emerald-400/20 animate-bounce' : 'text-slate-500'}`} />
          </div>
        </div>

        <div className="mt-auto space-y-4">
          <div className="flex items-center justify-between text-sm py-2 px-3 bg-black/30 rounded-xl">
            <span className="text-slate-400">Current Status</span>
            <div className="flex items-center gap-1.5 font-bold">
              {isOn ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-400">RUNNING</span>
                </>
              ) : (
                <>
                  <XCircle className="w-4 h-4 text-slate-500" />
                  <span className="text-slate-500">STOPPED</span>
                </>
              )}
            </div>
          </div>

          <button
            onClick={onToggle}
            className={`w-full py-3.5 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all active:scale-95 shadow-lg ${
              isOn 
                ? 'bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30' 
                : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
            }`}
          >
            <Power className="w-5 h-5" />
            {isOn ? 'STOP STATION' : 'START STATION'}
          </button>
        </div>
      </div>
    </div>
  );
}
