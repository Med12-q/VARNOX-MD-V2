import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useLocation } from "wouter";
import { ShieldAlert, Zap, Smartphone, TerminalSquare } from "lucide-react";
import { useRequestPairCode, useGetBotStatus, getGetBotStatusQueryKey } from "@workspace/api-client-react";

export default function Home() {
  const [phone, setPhone] = useState("");
  const [pairCode, setPairCode] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [, setLocation] = useLocation();

  const { data: botStatus } = useGetBotStatus({ query: { refetchInterval: 3000, queryKey: getGetBotStatusQueryKey() } });
  const requestCodeMutation = useRequestPairCode();

  // Redirect to dashboard if already connected
  useEffect(() => {
    if (botStatus?.state === "connected") {
      setLocation("/dashboard");
    }
  }, [botStatus?.state, setLocation]);

  // Handle countdown
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setInterval(() => setCountdown(c => c - 1), 1000);
    } else if (countdown === 0 && pairCode) {
      setPairCode(null);
    }
    return () => clearInterval(timer);
  }, [countdown, pairCode]);

  const handleRequestCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    // Basic validation
    const phoneRegex = /^\+[1-9]\d{1,14}$/;
    if (!phoneRegex.test(phone)) {
      setError("Format invalide. Utilisez le format international (ex: +33612345678)");
      return;
    }

    try {
      const res = await requestCodeMutation.mutateAsync({ data: { phone } });
      setPairCode(res.code);
      setCountdown(res.expiresIn || 60);
    } catch (err: any) {
      setError(err?.message || "Erreur lors de la demande du code.");
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: "spring" as const, damping: 15 } }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center relative overflow-hidden p-4">
      {/* Deep Space Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-grid bg-grid-animated opacity-20"></div>
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[150px] mix-blend-screen"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/20 rounded-full blur-[150px] mix-blend-screen"></div>
      </div>

      <motion.div 
        className="z-10 w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-12 items-center"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Left Col - Hero Branding */}
        <div className="flex flex-col gap-8 text-center lg:text-left">
          <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/30 bg-primary/10 text-primary w-fit mx-auto lg:mx-0">
            <ShieldAlert className="w-4 h-4" />
            <span className="text-xs font-semibold tracking-widest uppercase">Military Grade Automation</span>
          </motion.div>
          
          <motion.h1 variants={itemVariants} className="text-5xl lg:text-7xl font-bold tracking-tight">
            <span className="text-gradient">VARNOX</span>
            <br />
            <span className="text-foreground">MD-V2</span>
          </motion.h1>
          
          <motion.p variants={itemVariants} className="text-muted-foreground text-lg lg:text-xl max-w-md mx-auto lg:mx-0 font-light">
            Système de contrôle avancé pour l'automatisation WhatsApp. Performances maximales, interface tactique, domination numérique.
          </motion.p>
          
          <motion.div variants={itemVariants} className="flex flex-wrap justify-center lg:justify-start gap-4 mt-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground bg-card/50 px-4 py-2 rounded-lg border border-border">
              <Zap className="w-4 h-4 text-primary" /> Rapide
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground bg-card/50 px-4 py-2 rounded-lg border border-border">
              <TerminalSquare className="w-4 h-4 text-secondary" /> Plus de 200 commandes
            </div>
          </motion.div>
        </div>

        {/* Right Col - Pair Code Panel */}
        <motion.div variants={itemVariants} className="w-full max-w-md mx-auto relative">
          {/* Glowing background behind card */}
          <div className="absolute -inset-1 bg-gradient-to-r from-primary to-secondary rounded-2xl blur opacity-20 animate-pulse"></div>
          
          <div className="glass-card rounded-2xl p-8 relative flex flex-col items-center">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 border border-primary/30 flex items-center justify-center mb-6">
              <Smartphone className="w-8 h-8 text-primary" />
            </div>
            
            <h2 className="text-2xl font-bold mb-2">Initialisation</h2>
            <p className="text-muted-foreground text-center mb-8 text-sm">
              Connectez votre instance WhatsApp via le code d'association (Pair Code).
            </p>

            {!pairCode ? (
              <form onSubmit={handleRequestCode} className="w-full flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-foreground/80">Numéro de téléphone</label>
                  <input 
                    type="text" 
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+33 6 12 34 56 78"
                    className="w-full bg-input/50 border border-border rounded-xl px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all font-mono"
                    disabled={requestCodeMutation.isPending}
                  />
                  {error && <span className="text-xs text-destructive mt-1">{error}</span>}
                </div>
                
                <button 
                  type="submit" 
                  disabled={requestCodeMutation.isPending || !phone}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl px-4 py-3 mt-4 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {requestCodeMutation.isPending ? (
                    <span className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin"></span>
                  ) : "Obtenir le code"}
                </button>
              </form>
            ) : (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }} 
                animate={{ opacity: 1, scale: 1 }} 
                className="w-full flex flex-col items-center gap-6"
              >
                <div className="w-full bg-background border border-primary/30 rounded-xl p-6 text-center neon-glow">
                  <span className="text-4xl font-mono font-bold tracking-[0.25em] text-foreground block">
                    {pairCode}
                  </span>
                </div>
                
                <div className="w-full space-y-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Expiration:</span>
                    <span className="font-mono text-primary">{countdown}s</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                    <motion.div 
                      className="h-full bg-primary"
                      initial={{ width: "100%" }}
                      animate={{ width: "0%" }}
                      transition={{ duration: countdown, ease: "linear" }}
                    />
                  </div>
                </div>

                <div className="bg-card-border p-4 rounded-xl text-sm text-muted-foreground w-full">
                  <ol className="list-decimal list-inside space-y-2 marker:text-primary font-medium">
                    <li>Ouvrez WhatsApp sur votre téléphone</li>
                    <li>Allez dans <strong>Appareils liés</strong></li>
                    <li>Sélectionnez <strong>Lier avec un numéro</strong></li>
                    <li>Entrez le code ci-dessus</li>
                  </ol>
                </div>
                
                <button 
                  onClick={() => setPairCode(null)}
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors underline underline-offset-4"
                >
                  Annuler et réessayer
                </button>
              </motion.div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
