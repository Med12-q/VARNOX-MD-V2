/**
 * VARNOX-MD-V2 — Admin Commands
 */

import { Command } from "./index.js";
import { db } from "../database/db.js";
import { botManager } from "../bot/connection.js";
import { formatUptime, formatBytes } from "../utils/format.js";

export const commands: Omit<Command, "usageCount">[] = [
  {
    name: "ban",
    description: "Bannir un utilisateur du bot",
    category: "Administration",
    usage: ".ban [@mention] [raison]",
    aliases: ["bannir"],
    isOwnerOnly: true,
    isGroupOnly: false,
    isPremium: false,
    handler: async ({ sock, from, msg, args, senderJid }) => {
      const target = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0];
      if (!target) {
        await sock.sendMessage(from, { text: "❌ Mentionnez un utilisateur." });
        return;
      }
      if (db.isOwner(target)) {
        await sock.sendMessage(from, { text: "❌ Impossible de bannir le propriétaire." });
        return;
      }
      const reason = args.slice(1).join(" ") || "Non spécifié";
      db.updateUser(target, { banned: true });
      await sock.sendMessage(from, {
        text: `🚫 @${target.split("@")[0]} a été banni.\nRaison: ${reason}`,
        mentions: [target],
      });
    },
  },
  {
    name: "unban",
    description: "Débannir un utilisateur",
    category: "Administration",
    usage: ".unban [@mention]",
    aliases: ["debannir"],
    isOwnerOnly: true,
    isGroupOnly: false,
    isPremium: false,
    handler: async ({ sock, from, msg }) => {
      const target = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0];
      if (!target) {
        await sock.sendMessage(from, { text: "❌ Mentionnez un utilisateur." });
        return;
      }
      db.updateUser(target, { banned: false });
      await sock.sendMessage(from, {
        text: `✅ @${target.split("@")[0]} a été débanni.`,
        mentions: [target],
      });
    },
  },
  {
    name: "broadcast",
    description: "Envoyer un message à tous les chats connus",
    category: "Administration",
    usage: ".broadcast [message]",
    aliases: ["bcast", "announce"],
    isOwnerOnly: true,
    isGroupOnly: false,
    isPremium: false,
    handler: async ({ sock, from, args }) => {
      if (!args.length) {
        await sock.sendMessage(from, { text: "❌ Veuillez écrire un message à diffuser." });
        return;
      }
      const message = args.join(" ");
      const users = db.getAllUsers().filter((u) => !u.banned);
      const groups = db.getAllGroups();
      let sent = 0;
      for (const user of users) {
        try {
          await sock.sendMessage(user.jid, {
            text: `📢 *Annonce VARNOX-MD-V2*\n\n${message}`,
          });
          sent++;
        } catch (_) {}
      }
      await sock.sendMessage(from, {
        text: `✅ Message diffusé à *${sent}* utilisateurs.`,
      });
    },
  },
  {
    name: "addprem",
    description: "Ajouter un utilisateur premium",
    category: "Administration",
    usage: ".addprem [@mention]",
    aliases: ["addpremium", "giveprem"],
    isOwnerOnly: true,
    isGroupOnly: false,
    isPremium: false,
    handler: async ({ sock, from, msg }) => {
      const target = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0];
      if (!target) {
        await sock.sendMessage(from, { text: "❌ Mentionnez un utilisateur." });
        return;
      }
      db.updateUser(target, { isPremium: true });
      await sock.sendMessage(from, {
        text: `💎 @${target.split("@")[0]} a maintenant accès Premium!`,
        mentions: [target],
      });
      // Notify the user
      try {
        await sock.sendMessage(target, {
          text: "💎 *Félicitations!* Vous avez reçu l'accès Premium à VARNOX-MD-V2!",
        });
      } catch (_) {}
    },
  },
  {
    name: "delprem",
    description: "Retirer le statut premium d'un utilisateur",
    category: "Administration",
    usage: ".delprem [@mention]",
    aliases: ["removeprem"],
    isOwnerOnly: true,
    isGroupOnly: false,
    isPremium: false,
    handler: async ({ sock, from, msg }) => {
      const target = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0];
      if (!target) {
        await sock.sendMessage(from, { text: "❌ Mentionnez un utilisateur." });
        return;
      }
      db.updateUser(target, { isPremium: false });
      await sock.sendMessage(from, {
        text: `✅ Statut premium retiré de @${target.split("@")[0]}.`,
        mentions: [target],
      });
    },
  },
  {
    name: "listprem",
    description: "Lister tous les utilisateurs premium",
    category: "Administration",
    usage: ".listprem",
    aliases: ["premlist"],
    isOwnerOnly: true,
    isGroupOnly: false,
    isPremium: false,
    handler: async ({ sock, from }) => {
      const prems = db.getAllUsers().filter((u) => u.isPremium || u.role === "owner");
      if (prems.length === 0) {
        await sock.sendMessage(from, { text: "❌ Aucun utilisateur premium." });
        return;
      }
      const list = prems.map((u) => `• +${u.jid.split("@")[0]} (${u.role})`).join("\n");
      await sock.sendMessage(from, { text: `💎 *Utilisateurs Premium (${prems.length}):*\n\n${list}` });
    },
  },
  {
    name: "setmode",
    description: "Changer le mode du bot (public/privé)",
    category: "Administration",
    usage: ".setmode [public/prive]",
    aliases: ["mode"],
    isOwnerOnly: true,
    isGroupOnly: false,
    isPremium: false,
    handler: async ({ sock, from, args }) => {
      const mode = args[0] === "prive" || args[0] === "private" ? "private" : "public";
      db.updateSettings({ mode });
      await sock.sendMessage(from, {
        text: `✅ Mode bot: *${mode === "public" ? "Public" : "Privé"}*`,
      });
    },
  },
  {
    name: "clearcache",
    description: "Vider le cache du bot",
    category: "Administration",
    usage: ".clearcache",
    aliases: ["cache"],
    isOwnerOnly: true,
    isGroupOnly: false,
    isPremium: false,
    handler: async ({ sock, from }) => {
      if (global.gc) global.gc();
      const mem = process.memoryUsage();
      await sock.sendMessage(from, {
        text: `✅ Cache vidé!\nRAM: ${formatBytes(mem.heapUsed)}`,
      });
    },
  },
  {
    name: "sysinfo",
    description: "Informations système détaillées",
    category: "Administration",
    usage: ".sysinfo",
    aliases: ["system", "sys"],
    isOwnerOnly: true,
    isGroupOnly: false,
    isPremium: false,
    handler: async ({ sock, from }) => {
      const mem = process.memoryUsage();
      const uptime = formatUptime(db.getUptime());
      const os = await import("node:os");
      await sock.sendMessage(from, {
        text:
          `💻 *Informations Système*\n\n` +
          `🖥️ Platform: ${process.platform}\n` +
          `⚙️ Node.js: ${process.version}\n` +
          `💾 RAM utilisée: ${formatBytes(mem.heapUsed)}\n` +
          `💾 RAM totale: ${formatBytes(mem.heapTotal)}\n` +
          `⏱️ Uptime Bot: ${uptime}\n` +
          `⏱️ Uptime OS: ${formatUptime(Math.floor(os.default.uptime()))}\n` +
          `🔄 CPUs: ${os.default.cpus().length}`,
      });
    },
  },
  {
    name: "setowner",
    description: "Définir le numéro du propriétaire",
    category: "Administration",
    usage: ".setowner [numéro]",
    aliases: [],
    isOwnerOnly: true,
    isGroupOnly: false,
    isPremium: false,
    handler: async ({ sock, from, args }) => {
      const number = args[0]?.replace(/[^0-9]/g, "");
      if (!number) {
        await sock.sendMessage(from, { text: "❌ Veuillez spécifier un numéro." });
        return;
      }
      db.updateSettings({ ownerNumber: number });
      await sock.sendMessage(from, { text: `✅ Numéro propriétaire mis à jour: +${number}` });
    },
  },
  {
    name: "addadmin",
    description: "Ajouter un administrateur du bot",
    category: "Administration",
    usage: ".addadmin [@mention]",
    aliases: ["setadmin"],
    isOwnerOnly: true,
    isGroupOnly: false,
    isPremium: false,
    handler: async ({ sock, from, msg }) => {
      const target = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0];
      if (!target) {
        await sock.sendMessage(from, { text: "❌ Mentionnez un utilisateur." });
        return;
      }
      db.updateUser(target, { role: "admin" });
      await sock.sendMessage(from, {
        text: `✅ @${target.split("@")[0]} est maintenant administrateur du bot!`,
        mentions: [target],
      });
    },
  },
  {
    name: "deladmin",
    description: "Retirer le statut administrateur",
    category: "Administration",
    usage: ".deladmin [@mention]",
    aliases: ["removeadmin"],
    isOwnerOnly: true,
    isGroupOnly: false,
    isPremium: false,
    handler: async ({ sock, from, msg }) => {
      const target = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0];
      if (!target) {
        await sock.sendMessage(from, { text: "❌ Mentionnez un utilisateur." });
        return;
      }
      db.updateUser(target, { role: "user" });
      await sock.sendMessage(from, {
        text: `✅ Statut admin retiré de @${target.split("@")[0]}.`,
        mentions: [target],
      });
    },
  },
  {
    name: "getgc",
    description: "Rejoindre un groupe via un lien",
    category: "Administration",
    usage: ".getgc [lien]",
    aliases: ["join"],
    isOwnerOnly: true,
    isGroupOnly: false,
    isPremium: false,
    handler: async ({ sock, from, args }) => {
      const link = args[0];
      if (!link) {
        await sock.sendMessage(from, { text: "❌ Veuillez fournir un lien de groupe." });
        return;
      }
      try {
        const code = link.split("https://chat.whatsapp.com/")[1];
        if (!code) throw new Error("Lien invalide");
        await sock.groupAcceptInvite(code);
        await sock.sendMessage(from, { text: "✅ Groupe rejoint avec succès!" });
      } catch (err) {
        await sock.sendMessage(from, { text: `❌ Impossible de rejoindre: ${String(err)}` });
      }
    },
  },
  {
    name: "leave",
    description: "Quitter un groupe",
    category: "Administration",
    usage: ".leave",
    aliases: ["quitter"],
    isOwnerOnly: true,
    isGroupOnly: true,
    isPremium: false,
    handler: async ({ sock, from }) => {
      await sock.sendMessage(from, { text: "👋 Au revoir! Je quitte ce groupe..." });
      await new Promise((r) => setTimeout(r, 1000));
      await sock.groupLeave(from);
    },
  },
  {
    name: "restart",
    description: "Redémarrer le bot",
    category: "Administration",
    usage: ".restart",
    aliases: ["reboot"],
    isOwnerOnly: true,
    isGroupOnly: false,
    isPremium: false,
    handler: async ({ sock, from }) => {
      await sock.sendMessage(from, { text: "🔄 Redémarrage du bot en cours..." });
      await botManager.restart();
    },
  },
  {
    name: "eval",
    description: "Exécuter du code JavaScript (DANGER)",
    category: "Administration",
    usage: ".eval [code]",
    aliases: ["exec", "run"],
    isOwnerOnly: true,
    isGroupOnly: false,
    isPremium: false,
    handler: async ({ sock, from, args }) => {
      const code = args.join(" ");
      if (!code) {
        await sock.sendMessage(from, { text: "❌ Veuillez fournir du code à exécuter." });
        return;
      }
      if (process.env.NODE_ENV === "production") {
        await sock.sendMessage(from, { text: "⛔ La commande eval est désactivée en production." });
        return;
      }
      try {
        // eslint-disable-next-line no-eval
        const result = eval(code);
        const output = typeof result === "object" ? JSON.stringify(result, null, 2) : String(result);
        await sock.sendMessage(from, { text: `✅ *Résultat:*\n\`\`\`\n${output}\n\`\`\`` });
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Erreur inconnue";
        await sock.sendMessage(from, { text: `❌ Erreur:\n${msg}` });
      }
    },
  },
  {
    name: "listbanned",
    description: "Lister les utilisateurs bannis",
    category: "Administration",
    usage: ".listbanned",
    aliases: ["banned"],
    isOwnerOnly: true,
    isGroupOnly: false,
    isPremium: false,
    handler: async ({ sock, from }) => {
      const banned = db.getAllUsers().filter((u) => u.banned);
      if (banned.length === 0) {
        await sock.sendMessage(from, { text: "✅ Aucun utilisateur banni." });
        return;
      }
      const list = banned.map((u) => `• +${u.jid.split("@")[0]}`).join("\n");
      await sock.sendMessage(from, { text: `🚫 *Utilisateurs Bannis (${banned.length}):*\n\n${list}` });
    },
  },
  {
    name: "antilink2",
    description: "Activer la protection anti-liens avancée",
    category: "Administration",
    usage: ".antilink2 [on/off]",
    aliases: [],
    isOwnerOnly: true,
    isGroupOnly: false,
    isPremium: false,
    handler: async ({ sock, from, args }) => {
      const state = args[0] === "on";
      db.updateSettings({ mode: state ? "private" : "public" });
      await sock.sendMessage(from, {
        text: `✅ Anti-liens avancé: *${state ? "Activé" : "Désactivé"}*`,
      });
    },
  },
  {
    name: "setbotname",
    description: "Changer le nom du bot",
    category: "Administration",
    usage: ".setbotname [nom]",
    aliases: ["botname"],
    isOwnerOnly: true,
    isGroupOnly: false,
    isPremium: false,
    handler: async ({ sock, from, args }) => {
      const name = args.join(" ");
      if (!name) {
        await sock.sendMessage(from, { text: "❌ Veuillez spécifier un nom." });
        return;
      }
      db.updateSettings({ botName: name });
      await sock.sendMessage(from, { text: `✅ Nom du bot changé en: *${name}*` });
    },
  },
];
