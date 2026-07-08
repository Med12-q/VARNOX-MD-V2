import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Users, 
  MessageSquare, 
  TerminalSquare, 
  Cpu, 
  HardDrive, 
  Clock,
  Activity,
  LogOut,
  RotateCcw
} from "lucide-react";
import { 
  useGetDashboardStats, getGetDashboardStatsQueryKey,
  useGetRecentActivity, getGetRecentActivityQueryKey,
  useGetBotInfo,
  useDisconnectBot,
  useRestartBot
} from "@workspace/api-client-react";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis } from "recharts";

// Animated counter component
function AnimatedCounter({ value }: { value: number }) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = value;
    if (start === end) return;
    
    let totalDuration = 1000;
    let incrementTime = (totalDuration / end);
    // limit max increments to avoid lag
    if (incrementTime < 10) incrementTime = 10;
    
    const steps = totalDuration / incrementTime;
    const stepValue = end / steps;
    
    let current = 0;
    const timer = setInterval(() => {
      current += stepValue;
      if (current >= end) {
        setDisplayValue(end);
        clearInterval(timer);
      } else {
        setDisplayValue(Math.floor(current));
      }
    }, incrementTime);

    return () => clearInterval(timer);
  }, [value]);

  return <span>{displayValue.toLocaleString()}</span>;
}

function StatCard({ title, value, icon: Icon, colorClass, delay = 0, isPercent = false }: any) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, type: "spring" }}
      className={`glass-card p-6 rounded-2xl relative overflow-hidden group`}
    >
      <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${colorClass} opacity-10 rounded-bl-full transition-transform group-hover:scale-110`} />
      
      <div className="flex justify-between items-start mb-4 relative z-10">
        <h3 className="text-muted-foreground font-medium text-sm">{title}</h3>
        <div className={`p-2 rounded-lg bg-background/50 border border-border`}>
          <Icon className="w-5 h-5 text-foreground" />
        </div>
      </div>
      
      <div className="relative z-10">
        <span className="text-3xl font-bold font-mono">
          <AnimatedCounter value={value || 0} />
          {isPercent && "%"}
        </span>
      </div>
    </motion.div>
  );
}

export default function Dashboard() {
  const { data: stats } = useGetDashboardStats({ query: { refetchInterval: 10000, queryKey: getGetDashboardStatsQueryKey() } });
  const { data: activity } = useGetRecentActivity({ query: { refetchInterval: 5000, queryKey: getGetRecentActivityQueryKey() } });
  const { data: botInfo } = useGetBotInfo();
  
  const disconnectMutation = useDisconnectBot();
  const restartMutation = useRestartBot();

  // Mock data for the chart since API doesn't provide historical data yet
  const chartData = [
    { time: '00:00', msgs: 120 }, { time: '04:00', msgs: 80 }, 
    { time: '08:00', msgs: 450 }, { time: '12:00', msgs: 980 }, 
    { time: '16:00', msgs: 1200 }, { time: '20:00', msgs: 850 }, 
    { time: '24:00', msgs: 600 }
  ];

  const formatUptime = (seconds: number) => {
    if (!seconds) return "0h 0m";
    const d = Math.floor(seconds / (3600*24));
    const h = Math.floor(seconds % (3600*24) / 3600);
    const m = Math.floor(seconds % 3600 / 60);
    if (d > 0) return `${d}j ${h}h`;
    return `${h}h ${m}m`;
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gradient">Centre de Contrôle</h1>
          <p className="text-muted-foreground mt-1">
            Instance: {botInfo?.name || 'VARNOX'} <span className="text-primary font-mono text-xs ml-2 border border-primary/30 px-2 py-0.5 rounded-full bg-primary/10">v{botInfo?.version || '2.0.0'}</span>
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={() => restartMutation.mutate()}
            disabled={restartMutation.isPending}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border bg-card hover:bg-card-border transition-colors text-sm font-medium"
          >
            <RotateCcw className={`w-4 h-4 ${restartMutation.isPending ? "animate-spin text-primary" : ""}`} />
            Redémarrer
          </button>
          <button 
            onClick={() => {
              if(confirm("Voulez-vous vraiment déconnecter le bot ?")) {
                disconnectMutation.mutate();
              }
            }}
            disabled={disconnectMutation.isPending}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-destructive/10 border border-destructive/30 hover:bg-destructive/20 text-destructive transition-colors text-sm font-medium"
          >
            <LogOut className="w-4 h-4" />
            Déconnecter
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Groupes Actifs" value={stats?.totalGroups || 0} icon={Users} colorClass="from-primary to-transparent" delay={0.1} />
        <StatCard title="Utilisateurs" value={stats?.totalUsers || 0} icon={MessageSquare} colorClass="from-secondary to-transparent" delay={0.2} />
        <StatCard title="Commandes" value={stats?.commandsUsed || 0} icon={TerminalSquare} colorClass="from-green-500 to-transparent" delay={0.3} />
        <StatCard title="Messages Traités" value={stats?.messagesHandled || 0} icon={Activity} colorClass="from-yellow-500 to-transparent" delay={0.4} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* System Monitor */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="lg:col-span-2 glass-card rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" /> Flux de Messages
            </h2>
            <div className="flex gap-4 text-xs font-mono text-muted-foreground">
              <div className="flex items-center gap-1"><Cpu className="w-3 h-3 text-primary" /> CPU: {stats?.cpuUsage || 0}%</div>
              <div className="flex items-center gap-1"><HardDrive className="w-3 h-3 text-secondary" /> RAM: {stats?.memoryUsage || 0}%</div>
              <div className="flex items-center gap-1"><Clock className="w-3 h-3 text-green-500" /> UP: {formatUptime(stats?.uptime || 0)}</div>
            </div>
          </div>
          
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorMsgs" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="time" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                  itemStyle={{ color: 'hsl(var(--foreground))' }}
                />
                <Area type="monotone" dataKey="msgs" stroke="hsl(var(--primary))" strokeWidth={2} fillOpacity={1} fill="url(#colorMsgs)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Activity Feed */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="glass-card rounded-2xl p-0 overflow-hidden flex flex-col"
        >
          <div className="p-6 border-b border-border bg-card/50">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <TerminalSquare className="w-5 h-5 text-secondary" /> Console en direct
            </h2>
          </div>
          
          <div className="flex-1 p-6 overflow-y-auto max-h-[300px] space-y-4 font-mono text-sm">
            {!activity || activity.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">Aucune activité récente</div>
            ) : (
              activity.map((item, i) => (
                <motion.div 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  key={item.id} 
                  className="flex gap-3 items-start"
                >
                  <span className="text-muted-foreground shrink-0 mt-0.5">
                    {new Date(item.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', second:'2-digit'})}
                  </span>
                  <div>
                    <span className={
                      item.type === 'command' ? 'text-primary' : 
                      item.type === 'error' ? 'text-destructive' : 
                      item.type === 'join' ? 'text-green-500' : 
                      'text-secondary'
                    }>
                      [{item.type.toUpperCase()}]
                    </span>
                    <span className="text-foreground ml-2">{item.description}</span>
                    {item.user && <span className="text-muted-foreground block text-xs mt-0.5">User: {item.user}</span>}
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
