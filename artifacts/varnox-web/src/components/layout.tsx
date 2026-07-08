import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { 
  LayoutDashboard, 
  TerminalSquare, 
  Users, 
  MessageSquare,
  Activity,
  Menu,
  X
} from "lucide-react";
import { useGetBotStatus, getGetBotStatusQueryKey } from "@workspace/api-client-react";

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const { data: botStatus } = useGetBotStatus({ query: { refetchInterval: 3000, queryKey: getGetBotStatusQueryKey() } });
  const isConnected = botStatus?.state === "connected";

  // Auto close mobile menu on navigation
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location]);

  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/commands", label: "Commandes", icon: TerminalSquare },
    { href: "/groups", label: "Groupes", icon: Users },
    { href: "/users", label: "Utilisateurs", icon: MessageSquare },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col md:flex-row overflow-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-grid bg-grid-animated opacity-30"></div>
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary/10 blur-[120px]"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-secondary/10 blur-[120px]"></div>
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 border-r border-border/50 bg-card/40 backdrop-blur-xl z-20 h-screen sticky top-0">
        <div className="p-6 flex items-center gap-3 border-b border-border/50">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg neon-glow">
            <Activity className="text-primary-foreground w-6 h-6" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-lg tracking-wider text-gradient">VARNOX</span>
            <span className="text-xs text-muted-foreground font-mono tracking-widest">MD-V2</span>
          </div>
        </div>

        <div className="flex-1 py-8 px-4 flex flex-col gap-2">
          {navItems.map((item) => {
            const isActive = location === item.href;
            return (
              <Link 
                key={item.href} 
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group relative overflow-hidden ${
                  isActive 
                    ? "bg-primary/10 text-primary border border-primary/20" 
                    : "text-muted-foreground hover:text-foreground hover:bg-card-border"
                }`}
              >
                {isActive && (
                  <motion.div 
                    layoutId="activeTab" 
                    className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent opacity-50"
                    initial={false}
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <item.icon className={`w-5 h-5 z-10 ${isActive ? "text-primary" : "group-hover:text-primary transition-colors"}`} />
                <span className="font-medium z-10">{item.label}</span>
              </Link>
            );
          })}
        </div>

        <div className="p-6 border-t border-border/50">
          <div className="glass-card p-4 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative flex h-3 w-3">
                {isConnected && (
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                )}
                <span className={`relative inline-flex rounded-full h-3 w-3 ${isConnected ? "bg-green-500" : "bg-red-500"}`}></span>
              </div>
              <span className="text-sm font-medium text-muted-foreground">
                {isConnected ? "En ligne" : "Hors ligne"}
              </span>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Topbar */}
      <header className="md:hidden flex items-center justify-between p-4 border-b border-border/50 bg-card/80 backdrop-blur-xl z-30 sticky top-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg">
            <Activity className="text-primary-foreground w-5 h-5" />
          </div>
          <span className="font-bold text-lg tracking-wider text-gradient">VARNOX</span>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="relative flex h-2 w-2">
            <span className={`relative inline-flex rounded-full h-2 w-2 ${isConnected ? "bg-green-500" : "bg-red-500"}`}></span>
          </div>
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg bg-muted text-foreground"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="md:hidden fixed inset-0 top-[73px] z-20 bg-background/95 backdrop-blur-xl p-4 flex flex-col gap-2"
        >
          {navItems.map((item) => {
            const isActive = location === item.href;
            return (
              <Link 
                key={item.href} 
                href={item.href}
                className={`flex items-center gap-4 px-4 py-4 rounded-xl transition-all ${
                  isActive 
                    ? "bg-primary/10 text-primary border border-primary/20" 
                    : "bg-card text-muted-foreground"
                }`}
              >
                <item.icon className="w-6 h-6" />
                <span className="font-medium text-lg">{item.label}</span>
              </Link>
            );
          })}
        </motion.div>
      )}

      {/* Main Content */}
      <main className="flex-1 relative z-10 overflow-y-auto">
        <div className="p-4 md:p-8 max-w-7xl mx-auto h-full">
          {children}
        </div>
      </main>
    </div>
  );
}
