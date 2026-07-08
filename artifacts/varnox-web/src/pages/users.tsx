import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Search, 
  Award,
  Crown,
  Star,
  User,
  Zap,
  Coins,
  AlertTriangle,
  MoreVertical,
  ShieldAlert
} from "lucide-react";
import { useGetUsers, useUpdateUser } from "@workspace/api-client-react";

// Simple dialog for editing user
function EditUserDialog({ user, onClose, onSave }: { user: any, onClose: () => void, onSave: (jid: string, data: any) => void }) {
  const [role, setRole] = useState(user.role);
  const [isPremium, setIsPremium] = useState(user.isPremium);
  
  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-card w-full max-w-md rounded-2xl p-6 border border-primary/20"
      >
        <h3 className="text-xl font-bold mb-4">Modifier Utilisateur</h3>
        <p className="text-sm font-mono text-muted-foreground mb-6 break-all">{user.jid}</p>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Rôle</label>
            <select 
              value={role} 
              onChange={(e) => setRole(e.target.value)}
              className="w-full bg-input border border-border rounded-lg p-2.5 text-sm focus:outline-none focus:border-primary"
            >
              <option value="user">Utilisateur (user)</option>
              <option value="premium">Premium</option>
              <option value="admin">Administrateur (admin)</option>
              <option value="superadmin">Super Admin (superadmin)</option>
            </select>
          </div>
          
          <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-background/50">
            <div>
              <span className="text-sm font-medium block">Statut Premium</span>
              <span className="text-xs text-muted-foreground">Accès aux commandes exclusives</span>
            </div>
            <button 
              type="button"
              onClick={() => setIsPremium(!isPremium)}
              className={`w-12 h-6 rounded-full relative transition-colors ${isPremium ? 'bg-primary' : 'bg-muted'}`}
            >
              <span className={`absolute top-1 bottom-1 w-4 bg-white rounded-full transition-all ${isPremium ? 'left-7' : 'left-1'}`}></span>
            </button>
          </div>
        </div>
        
        <div className="flex justify-end gap-3 mt-8">
          <button 
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm font-medium hover:bg-card-border transition-colors"
          >
            Annuler
          </button>
          <button 
            onClick={() => onSave(user.jid, { role, isPremium })}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Enregistrer
          </button>
        </div>
      </motion.div>
    </div>
  );
}

export default function UsersPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [editingUser, setEditingUser] = useState<any | null>(null);
  
  const { data: users, isLoading, refetch } = useGetUsers();
  const updateMutation = useUpdateUser();

  const filteredUsers = users?.filter(u => 
    (u.name && u.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    u.jid.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const handleSaveUser = async (jid: string, data: any) => {
    await updateMutation.mutateAsync({ jid, data });
    setEditingUser(null);
    refetch(); // Reload data
  };

  const getRoleBadge = (role: string) => {
    switch(role) {
      case 'owner': return <span className="flex items-center gap-1 bg-red-500/10 text-red-500 border border-red-500/20 px-2 py-0.5 rounded text-xs font-bold"><Crown className="w-3 h-3"/> Owner</span>;
      case 'superadmin': return <span className="flex items-center gap-1 bg-orange-500/10 text-orange-500 border border-orange-500/20 px-2 py-0.5 rounded text-xs font-bold"><ShieldAlert className="w-3 h-3"/> S.Admin</span>;
      case 'admin': return <span className="flex items-center gap-1 bg-blue-500/10 text-blue-500 border border-blue-500/20 px-2 py-0.5 rounded text-xs font-bold"><Award className="w-3 h-3"/> Admin</span>;
      case 'premium': return <span className="flex items-center gap-1 bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 px-2 py-0.5 rounded text-xs font-bold"><Star className="w-3 h-3"/> Premium</span>;
      default: return <span className="flex items-center gap-1 bg-muted text-muted-foreground border border-border px-2 py-0.5 rounded text-xs"><User className="w-3 h-3"/> User</span>;
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {editingUser && (
        <EditUserDialog 
          user={editingUser} 
          onClose={() => setEditingUser(null)} 
          onSave={handleSaveUser} 
        />
      )}

      <div>
        <h1 className="text-3xl font-bold text-gradient">Base de Données Utilisateurs</h1>
        <p className="text-muted-foreground mt-1">
          Gérez les permissions, niveaux et économie des utilisateurs.
        </p>
      </div>

      <div className="glass-card p-4 rounded-xl max-w-md">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input 
            type="text" 
            placeholder="Rechercher par nom ou JID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-input/50 border border-border rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-primary/50"
          />
        </div>
      </div>

      <div className="glass-card rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground bg-card-border/30 uppercase">
              <tr>
                <th className="px-6 py-4 font-medium">Utilisateur</th>
                <th className="px-6 py-4 font-medium">Rôle</th>
                <th className="px-6 py-4 font-medium">Progression</th>
                <th className="px-6 py-4 font-medium">Statistiques</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">
                    Chargement des données tactiques...
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">
                    Aucun utilisateur trouvé.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user, i) => (
                  <motion.tr 
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(i * 0.05, 0.5) }}
                    key={user.jid} 
                    className="border-b border-border/50 hover:bg-card-border/20 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center border border-primary/20">
                          <User className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                          <div className="font-bold text-foreground">{user.name || "Inconnu"}</div>
                          <div className="text-xs text-muted-foreground font-mono">{user.jid.split('@')[0]}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col items-start gap-1">
                        {getRoleBadge(user.role)}
                        {user.isPremium && user.role !== 'premium' && (
                           <span className="text-[10px] text-yellow-500 flex items-center gap-1 font-bold">
                             <Star className="w-2.5 h-2.5" /> Premium
                           </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="w-32">
                        <div className="flex justify-between text-xs mb-1">
                          <span className="font-bold text-secondary">Niv. {user.level}</span>
                          <span className="text-muted-foreground font-mono">{user.exp} XP</span>
                        </div>
                        <div className="w-full bg-background rounded-full h-1.5 border border-border">
                          <div 
                            className="bg-secondary h-1.5 rounded-full" 
                            style={{ width: `${Math.min((user.exp % 1000) / 10, 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-4">
                        <div className="flex flex-col" title="Commandes exécutées">
                          <span className="text-xs text-muted-foreground">Cmds</span>
                          <span className="font-mono flex items-center gap-1"><Zap className="w-3 h-3 text-primary"/>{user.commandCount}</span>
                        </div>
                        <div className="flex flex-col" title="Pièces">
                          <span className="text-xs text-muted-foreground">Coins</span>
                          <span className="font-mono flex items-center gap-1"><Coins className="w-3 h-3 text-yellow-500"/>{user.coins}</span>
                        </div>
                        {user.warns > 0 && (
                          <div className="flex flex-col" title="Avertissements">
                            <span className="text-xs text-muted-foreground">Warns</span>
                            <span className="font-mono text-destructive flex items-center gap-1"><AlertTriangle className="w-3 h-3"/>{user.warns}/3</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {user.role !== 'owner' && (
                        <button 
                          onClick={() => setEditingUser(user)}
                          className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
