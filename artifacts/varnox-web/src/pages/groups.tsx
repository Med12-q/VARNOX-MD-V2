import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Search, 
  Users, 
  Shield, 
  ShieldOff,
  Link,
  MessageCircle,
  VolumeX,
  UserPlus
} from "lucide-react";
import { useGetGroups } from "@workspace/api-client-react";

export default function Groups() {
  const [searchTerm, setSearchTerm] = useState("");
  const { data: groups, isLoading } = useGetGroups();

  const filteredGroups = groups?.filter(g => 
    g.name.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  return (
    <div className="space-y-8 pb-12">
      <div>
        <h1 className="text-3xl font-bold text-gradient">Gestion des Groupes</h1>
        <p className="text-muted-foreground mt-1">
          Surveillez et configurez les groupes connectés au bot.
        </p>
      </div>

      {/* Search */}
      <div className="glass-card p-4 rounded-xl max-w-md">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input 
            type="text" 
            placeholder="Rechercher un groupe..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-input/50 border border-border rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-primary/50"
          />
        </div>
      </div>

      {/* Groups List */}
      {isLoading ? (
        <div className="space-y-4">
          {[1,2,3].map(i => (
            <div key={i} className="glass-card h-24 rounded-xl animate-pulse bg-card-border/50"></div>
          ))}
        </div>
      ) : filteredGroups.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground glass-card rounded-xl">
          <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>Aucun groupe trouvé.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredGroups.map((group, i) => (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              key={group.jid}
              className="glass-card rounded-xl p-5 hover:border-secondary/40 transition-colors"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-lg text-foreground mb-1">{group.name}</h3>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground font-mono">
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3" /> {group.memberCount} membres
                    </span>
                    <span className="truncate w-32" title={group.jid}>{group.jid}</span>
                  </div>
                </div>
                
                {group.isAdmin ? (
                  <div className="flex items-center gap-1 bg-primary/10 text-primary border border-primary/20 px-2 py-1 rounded-md text-xs font-semibold">
                    <Shield className="w-3.5 h-3.5" /> Bot Admin
                  </div>
                ) : (
                  <div className="flex items-center gap-1 bg-muted text-muted-foreground px-2 py-1 rounded-md text-xs font-semibold">
                    <ShieldOff className="w-3.5 h-3.5" /> Non Admin
                  </div>
                )}
              </div>

              <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-border/50">
                <div className={`flex flex-col items-center justify-center p-2 rounded-lg border ${group.antilink ? 'bg-primary/5 border-primary/30 text-primary neon-glow' : 'bg-background border-border text-muted-foreground'}`}>
                  <Link className="w-4 h-4 mb-1" />
                  <span className="text-[10px] uppercase font-bold text-center">Anti-Lien</span>
                </div>
                
                <div className={`flex flex-col items-center justify-center p-2 rounded-lg border ${group.welcome ? 'bg-secondary/5 border-secondary/30 text-secondary neon-glow-violet' : 'bg-background border-border text-muted-foreground'}`}>
                  <UserPlus className="w-4 h-4 mb-1" />
                  <span className="text-[10px] uppercase font-bold text-center">Bienvenue</span>
                </div>
                
                <div className={`flex flex-col items-center justify-center p-2 rounded-lg border ${group.muted ? 'bg-destructive/10 border-destructive/30 text-destructive shadow-[0_0_10px_rgba(255,0,0,0.2)]' : 'bg-background border-border text-muted-foreground'}`}>
                  {group.muted ? <VolumeX className="w-4 h-4 mb-1" /> : <MessageCircle className="w-4 h-4 mb-1" />}
                  <span className="text-[10px] uppercase font-bold text-center">
                    {group.muted ? 'Muté' : 'Actif'}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
