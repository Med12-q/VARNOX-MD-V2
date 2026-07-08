import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { 
  Search, 
  TerminalSquare, 
  ShieldAlert, 
  Star,
  Users,
  Code
} from "lucide-react";
import { useGetCommands } from "@workspace/api-client-react";

export default function Commands() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const { data: commands, isLoading } = useGetCommands();

  // Extract unique categories
  const categories = useMemo(() => {
    if (!commands) return [];
    const cats = new Set(commands.map(c => c.category));
    return Array.from(cats).sort();
  }, [commands]);

  // Filter commands
  const filteredCommands = useMemo(() => {
    if (!commands) return [];
    return commands.filter(c => {
      const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            c.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory ? c.category === selectedCategory : true;
      return matchesSearch && matchesCategory;
    });
  }, [commands, searchTerm, selectedCategory]);

  return (
    <div className="space-y-8 pb-12">
      <div>
        <h1 className="text-3xl font-bold text-gradient">Registre des Commandes</h1>
        <p className="text-muted-foreground mt-1">
          Explorez l'arsenal complet des fonctionnalités de VARNOX.
        </p>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between glass-card p-4 rounded-xl">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input 
            type="text" 
            placeholder="Rechercher une commande..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-input/50 border border-border rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-primary/50 font-mono"
          />
        </div>
        
        <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 hide-scrollbar">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              selectedCategory === null 
                ? "bg-primary text-primary-foreground" 
                : "bg-card border border-border hover:bg-card-border"
            }`}
          >
            Tout afficher
          </button>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                selectedCategory === cat 
                  ? "bg-primary text-primary-foreground" 
                  : "bg-card border border-border hover:bg-card-border"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Commands Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className="glass-card h-40 rounded-xl animate-pulse bg-card-border/50"></div>
          ))}
        </div>
      ) : filteredCommands.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground glass-card rounded-xl">
          <TerminalSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>Aucune commande ne correspond à votre recherche.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCommands.map((cmd, i) => (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              key={cmd.name}
              className="glass-card rounded-xl p-5 hover:border-primary/40 transition-colors flex flex-col group"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-lg text-foreground group-hover:text-primary transition-colors">
                    .{cmd.name}
                  </span>
                </div>
                <div className="flex gap-1">
                  {cmd.isOwnerOnly && (
                    <div className="bg-destructive/10 text-destructive p-1 rounded-md" title="Propriétaire uniquement">
                      <ShieldAlert className="w-3.5 h-3.5" />
                    </div>
                  )}
                  {cmd.isPremium && (
                    <div className="bg-yellow-500/10 text-yellow-500 p-1 rounded-md" title="Premium">
                      <Star className="w-3.5 h-3.5" />
                    </div>
                  )}
                  {cmd.isGroupOnly && (
                    <div className="bg-blue-500/10 text-blue-400 p-1 rounded-md" title="Groupe uniquement">
                      <Users className="w-3.5 h-3.5" />
                    </div>
                  )}
                </div>
              </div>
              
              <p className="text-muted-foreground text-sm flex-1 mb-4">
                {cmd.description}
              </p>
              
              <div className="bg-background rounded-lg p-3 border border-border mt-auto">
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                  <Code className="w-3 h-3" /> Exemple d'utilisation
                </div>
                <code className="text-xs text-primary/90 font-mono">
                  {cmd.usage || `.${cmd.name}`}
                </code>
              </div>
              
              <div className="mt-3 flex justify-between items-center text-xs text-muted-foreground">
                <span className="bg-card-border px-2 py-0.5 rounded text-[10px] uppercase tracking-wider">
                  {cmd.category}
                </span>
                <span>Utilisée {cmd.usageCount} fois</span>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
