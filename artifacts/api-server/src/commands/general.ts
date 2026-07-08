/**
 * VARNOX-MD-V2 — General Commands
 */

import { Command } from "./index.js";
import { db } from "../database/db.js";
import { formatUptime, formatBytes, getMemoryUsage } from "../utils/format.js";

const prefix = () => db.getPrefix();

export const commands: Omit<Command, "usageCount">[] = [
  {
    name: "menu",
    description: "Affiche le menu principal avec toutes les commandes",
    category: "Général",
    usage: ".menu",
    aliases: ["help", "aide", "commandes"],
    isOwnerOnly: false,
    isGroupOnly: false,
    isPremium: false,
    handler: async ({ sock, from, isGroup }) => {
      const p = prefix();
      const settings = db.getSettings();
      const stats = db.getStats();
      const uptime = formatUptime(db.getUptime());
      const categories: Record<string, string[]> = {};
      const { commandRegistry } = await import("./index.js");
      for (const [, cmd] of commandRegistry) {
        if (!categories[cmd.category]) categories[cmd.category] = [];
        categories[cmd.category]!.push(`${p}${cmd.name}`);
      }

      let text = `╔══════════════════════╗\n`;
      text += `║  *VARNOX-MD-V2*  ║\n`;
      text += `╚══════════════════════╝\n\n`;
      text += `📊 *Stats:* ${stats.commandsUsed} cmds utilisées\n`;
      text += `⏱️ *Uptime:* ${uptime}\n`;
      text += `🌐 *Mode:* ${settings.mode === "public" ? "Public" : "Privé"}\n\n`;

      for (const [cat, cmds] of Object.entries(categories)) {
        text += `━━━━ *${cat}* ━━━━\n`;
        text += cmds.join("  |  ") + "\n\n";
      }
      text += `\nPréfixe: *${p}* | Version: *${settings.botVersion}*`;

      await sock.sendMessage(from, { text });
    },
  },
  {
    name: "ping",
    description: "Vérifie la latence du bot",
    category: "Général",
    usage: ".ping",
    aliases: ["pong", "latency"],
    isOwnerOnly: false,
    isGroupOnly: false,
    isPremium: false,
    handler: async ({ sock, from }) => {
      const start = Date.now();
      await sock.sendMessage(from, { text: "🏓 Pong!" });
      const latency = Date.now() - start;
      await sock.sendMessage(from, { text: `🏓 *Pong!*\n⚡ Latence: *${latency}ms*` });
    },
  },
  {
    name: "runtime",
    description: "Affiche le temps de fonctionnement du bot",
    category: "Général",
    usage: ".runtime",
    aliases: ["uptime", "temps"],
    isOwnerOnly: false,
    isGroupOnly: false,
    isPremium: false,
    handler: async ({ sock, from }) => {
      const uptime = formatUptime(db.getUptime());
      const mem = getMemoryUsage();
      await sock.sendMessage(from, {
        text: `⏱️ *VARNOX Runtime*\n\n🕐 Uptime: *${uptime}*\n💾 RAM: *${mem}%*`,
      });
    },
  },
  {
    name: "alive",
    description: "Vérifie si le bot est actif",
    category: "Général",
    usage: ".alive",
    aliases: ["actif", "status"],
    isOwnerOnly: false,
    isGroupOnly: false,
    isPremium: false,
    handler: async ({ sock, from }) => {
      const uptime = formatUptime(db.getUptime());
      await sock.sendMessage(from, {
        text: `✅ *VARNOX-MD-V2 est actif!*\n\n⏱️ Uptime: ${uptime}\n🚀 Prêt à recevoir vos commandes!`,
      });
    },
  },
  {
    name: "owner",
    description: "Affiche les informations du propriétaire",
    category: "Général",
    usage: ".owner",
    aliases: ["proprio", "creator"],
    isOwnerOnly: false,
    isGroupOnly: false,
    isPremium: false,
    handler: async ({ sock, from }) => {
      const settings = db.getSettings();
      await sock.sendMessage(from, {
        text: `👑 *Propriétaire du Bot*\n\n📱 Numéro: +${settings.ownerNumber}\n🤖 Bot: ${settings.botName} v${settings.botVersion}`,
      });
    },
  },
  {
    name: "botinfo",
    description: "Informations complètes sur le bot",
    category: "Général",
    usage: ".botinfo",
    aliases: ["info", "about"],
    isOwnerOnly: false,
    isGroupOnly: false,
    isPremium: false,
    handler: async ({ sock, from }) => {
      const settings = db.getSettings();
      const stats = db.getStats();
      const uptime = formatUptime(db.getUptime());
      const users = db.getAllUsers().length;
      const groups = db.getAllGroups().length;
      const mem = process.memoryUsage();
      await sock.sendMessage(from, {
        text:
          `🤖 *${settings.botName}*\n` +
          `Version: ${settings.botVersion}\n\n` +
          `📊 *Statistiques:*\n` +
          `👥 Utilisateurs: ${users}\n` +
          `👥 Groupes: ${groups}\n` +
          `⚡ Commandes utilisées: ${stats.commandsUsed}\n\n` +
          `💻 *Système:*\n` +
          `⏱️ Uptime: ${uptime}\n` +
          `💾 RAM: ${formatBytes(mem.heapUsed)} / ${formatBytes(mem.heapTotal)}\n` +
          `🟢 Node.js: ${process.version}`,
      });
    },
  },
  {
    name: "profile",
    description: "Affiche votre profil utilisateur",
    category: "Général",
    usage: ".profile [@mention]",
    aliases: ["profil", "me"],
    isOwnerOnly: false,
    isGroupOnly: false,
    isPremium: false,
    handler: async ({ sock, from, senderJid, msg, args }) => {
      const targetJid =
        msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0] ?? senderJid;
      const user = db.getUser(targetJid);
      const phone = targetJid.split("@")[0];
      const roleEmoji: Record<string, string> = {
        owner: "👑",
        superadmin: "🌟",
        admin: "⚡",
        premium: "💎",
        user: "👤",
      };
      await sock.sendMessage(from, {
        text:
          `${roleEmoji[user.role] ?? "👤"} *Profil Utilisateur*\n\n` +
          `📱 Numéro: +${phone}\n` +
          `🏷️ Nom: ${user.name ?? "Non défini"}\n` +
          `🎭 Rôle: ${user.role}\n` +
          `💎 Premium: ${user.isPremium ? "Oui" : "Non"}\n` +
          `⚡ Commandes: ${user.commandCount}\n` +
          `⚠️ Avertissements: ${user.warns}\n` +
          `🌟 Niveau: ${user.level}\n` +
          `📊 EXP: ${user.exp}\n` +
          `💰 Coins: ${user.coins}`,
        mentions: [targetJid],
      });
    },
  },
  {
    name: "speed",
    description: "Teste la vitesse de réponse du bot",
    category: "Général",
    usage: ".speed",
    aliases: ["vitesse", "test"],
    isOwnerOnly: false,
    isGroupOnly: false,
    isPremium: false,
    handler: async ({ sock, from }) => {
      const t1 = Date.now();
      await sock.sendMessage(from, { text: "⏳ Test en cours..." });
      const t2 = Date.now();
      const mem = process.memoryUsage();
      await sock.sendMessage(from, {
        text:
          `🚀 *Test de Vitesse*\n\n` +
          `⚡ Réponse: ${t2 - t1}ms\n` +
          `💾 RAM: ${formatBytes(mem.heapUsed)}\n` +
          `🔄 Uptime: ${formatUptime(db.getUptime())}`,
      });
    },
  },
  {
    name: "sc",
    description: "Affiche le code source du bot",
    category: "Général",
    usage: ".sc",
    aliases: ["source", "github"],
    isOwnerOnly: false,
    isGroupOnly: false,
    isPremium: false,
    handler: async ({ sock, from }) => {
      await sock.sendMessage(from, {
        text: "📁 *Source Code VARNOX-MD-V2*\n\n🔗 GitHub: https://github.com/Med12-q/VARNOX-MD-V2\n\n⭐ N'oubliez pas de mettre une étoile!",
      });
    },
  },
  {
    name: "privacy",
    description: "Politique de confidentialité du bot",
    category: "Général",
    usage: ".privacy",
    aliases: ["confidentialite"],
    isOwnerOnly: false,
    isGroupOnly: false,
    isPremium: false,
    handler: async ({ sock, from }) => {
      await sock.sendMessage(from, {
        text:
          `🔒 *Politique de Confidentialité*\n\n` +
          `VARNOX-MD-V2 respecte votre vie privée.\n\n` +
          `• Nous ne stockons pas vos messages\n` +
          `• Vos données sont utilisées uniquement pour le fonctionnement du bot\n` +
          `• Vous pouvez demander la suppression de vos données à tout moment\n` +
          `• Le bot ne partage pas vos informations avec des tiers`,
      });
    },
  },
  {
    name: "tagme",
    description: "Vous mentionne dans le groupe",
    category: "Général",
    usage: ".tagme",
    aliases: [],
    isOwnerOnly: false,
    isGroupOnly: true,
    isPremium: false,
    handler: async ({ sock, from, senderJid }) => {
      await sock.sendMessage(from, {
        text: `@${senderJid.split("@")[0]}`,
        mentions: [senderJid],
      });
    },
  },
  {
    name: "setprefix",
    description: "Changer le préfixe du bot",
    category: "Général",
    usage: ".setprefix [nouveau_préfixe]",
    aliases: ["changeprefix"],
    isOwnerOnly: true,
    isGroupOnly: false,
    isPremium: false,
    handler: async ({ sock, from, args }) => {
      if (!args[0]) {
        await sock.sendMessage(from, { text: "❌ Veuillez spécifier un nouveau préfixe." });
        return;
      }
      const newPrefix = args[0];
      db.updateSettings({ prefix: newPrefix });
      await sock.sendMessage(from, {
        text: `✅ Préfixe changé en: *${newPrefix}*`,
      });
    },
  },
  {
    name: "donate",
    description: "Soutenir le développeur du bot",
    category: "Général",
    usage: ".donate",
    aliases: ["support", "soutien"],
    isOwnerOnly: false,
    isGroupOnly: false,
    isPremium: false,
    handler: async ({ sock, from }) => {
      await sock.sendMessage(from, {
        text: `💖 *Soutenir VARNOX-MD-V2*\n\nMerci pour votre soutien!\nCela aide à maintenir et améliorer le bot.\n\n🔗 GitHub: https://github.com/Med12-q/VARNOX-MD-V2`,
      });
    },
  },
  {
    name: "language",
    description: "Changer la langue du bot",
    category: "Général",
    usage: ".language [fr/en/ar]",
    aliases: ["langue", "lang"],
    isOwnerOnly: true,
    isGroupOnly: false,
    isPremium: false,
    handler: async ({ sock, from, args }) => {
      const lang = args[0];
      if (!lang || !["fr", "en", "ar"].includes(lang)) {
        await sock.sendMessage(from, { text: "❌ Langue invalide. Utilisez: fr, en, ar" });
        return;
      }
      db.updateSettings({ language: lang });
      await sock.sendMessage(from, { text: `✅ Langue changée en: *${lang}*` });
    },
  },
  {
    name: "afk",
    description: "Activer le mode absent",
    category: "Général",
    usage: ".afk [raison]",
    aliases: ["absent"],
    isOwnerOnly: false,
    isGroupOnly: false,
    isPremium: false,
    handler: async ({ sock, from, senderJid, args }) => {
      const reason = args.join(" ") || "Pas de raison";
      db.updateUser(senderJid, { afk: reason });
      await sock.sendMessage(from, {
        text: `😴 *Mode AFK activé*\nRaison: ${reason}`,
      });
    },
  },
  {
    name: "unafk",
    description: "Désactiver le mode absent",
    category: "Général",
    usage: ".unafk",
    aliases: ["retour"],
    isOwnerOnly: false,
    isGroupOnly: false,
    isPremium: false,
    handler: async ({ sock, from, senderJid }) => {
      db.updateUser(senderJid, { afk: null });
      await sock.sendMessage(from, { text: `✅ *Mode AFK désactivé. Bienvenue de retour!*` });
    },
  },
  {
    name: "register",
    description: "S'enregistrer auprès du bot",
    category: "Général",
    usage: ".register [nom] [age]",
    aliases: ["enregistrer", "reg"],
    isOwnerOnly: false,
    isGroupOnly: false,
    isPremium: false,
    handler: async ({ sock, from, senderJid, args }) => {
      const user = db.getUser(senderJid);
      if (user.register) {
        await sock.sendMessage(from, { text: "✅ Vous êtes déjà enregistré!" });
        return;
      }
      const name = args[0];
      const age = parseInt(args[1] ?? "0");
      if (!name || !age) {
        await sock.sendMessage(from, {
          text: "❌ Usage: .register [nom] [age]\nExemple: .register Ahmed 25",
        });
        return;
      }
      db.updateUser(senderJid, { register: true, regname: name, regage: age });
      await sock.sendMessage(from, {
        text: `✅ *Enregistrement réussi!*\n\n👤 Nom: ${name}\n🎂 Age: ${age} ans`,
      });
    },
  },
  {
    name: "report",
    description: "Signaler un problème au propriétaire",
    category: "Général",
    usage: ".report [message]",
    aliases: ["signaler"],
    isOwnerOnly: false,
    isGroupOnly: false,
    isPremium: false,
    handler: async ({ sock, from, senderJid, args }) => {
      if (!args.length) {
        await sock.sendMessage(from, { text: "❌ Veuillez écrire votre rapport." });
        return;
      }
      const settings = db.getSettings();
      const report = args.join(" ");
      const ownerJid = `${settings.ownerNumber}@s.whatsapp.net`;
      await sock.sendMessage(ownerJid, {
        text: `📋 *Nouveau Rapport*\nDe: ${senderJid.split("@")[0]}\n\n${report}`,
      });
      await sock.sendMessage(from, {
        text: "✅ Rapport envoyé au propriétaire. Merci!",
      });
    },
  },
  {
    name: "feedback",
    description: "Envoyer un retour au propriétaire",
    category: "Général",
    usage: ".feedback [message]",
    aliases: ["avis"],
    isOwnerOnly: false,
    isGroupOnly: false,
    isPremium: false,
    handler: async ({ sock, from, senderJid, args }) => {
      if (!args.length) {
        await sock.sendMessage(from, { text: "❌ Veuillez écrire votre retour." });
        return;
      }
      const settings = db.getSettings();
      const feedback = args.join(" ");
      const ownerJid = `${settings.ownerNumber}@s.whatsapp.net`;
      await sock.sendMessage(ownerJid, {
        text: `💬 *Feedback*\nDe: ${senderJid.split("@")[0]}\n\n${feedback}`,
      });
      await sock.sendMessage(from, { text: "✅ Feedback envoyé! Merci pour votre retour." });
    },
  },
  {
    name: "terms",
    description: "Conditions d'utilisation du bot",
    category: "Général",
    usage: ".terms",
    aliases: ["cgu", "conditions"],
    isOwnerOnly: false,
    isGroupOnly: false,
    isPremium: false,
    handler: async ({ sock, from }) => {
      await sock.sendMessage(from, {
        text:
          `📜 *Conditions d'Utilisation*\n\n` +
          `En utilisant VARNOX-MD-V2, vous acceptez:\n\n` +
          `1. Ne pas utiliser le bot à des fins illégales\n` +
          `2. Respecter les autres utilisateurs\n` +
          `3. Ne pas tenter de pirater ou d'abuser du bot\n` +
          `4. Le propriétaire peut bannir sans avertissement\n` +
          `5. Le bot peut être arrêté à tout moment`,
      });
    },
  },
];
