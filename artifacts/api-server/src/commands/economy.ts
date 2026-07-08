/**
 * VARNOX-MD-V2 — Economy Commands
 */

import { Command } from "./index.js";
import { db } from "../database/db.js";

const DAILY_COINS = 500;
const WEEKLY_COINS = 3000;
const WORK_MIN = 100;
const WORK_MAX = 500;

function isNewDay(date: string | undefined): boolean {
  if (!date) return true;
  const last = new Date(date);
  const now = new Date();
  return last.toDateString() !== now.toDateString();
}

function isNewWeek(date: string | undefined): boolean {
  if (!date) return true;
  const last = new Date(date);
  const now = new Date();
  const daysDiff = Math.floor((now.getTime() - last.getTime()) / (1000 * 60 * 60 * 24));
  return daysDiff >= 7;
}

export const commands: Omit<Command, "usageCount">[] = [
  {
    name: "daily",
    description: "Réclamer votre récompense quotidienne",
    category: "Économie",
    usage: ".daily",
    aliases: ["quotidien"],
    isOwnerOnly: false,
    isGroupOnly: false,
    isPremium: false,
    handler: async ({ sock, from, senderJid }) => {
      const user = db.getUser(senderJid);
      if (!isNewDay(user.lastDaily)) {
        await sock.sendMessage(from, {
          text: `⏰ Vous avez déjà réclamé votre récompense aujourd'hui!\nRevenez demain pour ${DAILY_COINS} coins.`,
        });
        return;
      }
      db.updateUser(senderJid, {
        coins: (user.coins ?? 0) + DAILY_COINS,
        lastDaily: new Date().toISOString(),
      });
      await sock.sendMessage(from, {
        text: `💰 *Récompense Quotidienne!*\n\n+${DAILY_COINS} coins!\nSolde: ${(user.coins ?? 0) + DAILY_COINS} coins`,
      });
    },
  },
  {
    name: "weekly",
    description: "Réclamer votre récompense hebdomadaire",
    category: "Économie",
    usage: ".weekly",
    aliases: ["hebdomadaire"],
    isOwnerOnly: false,
    isGroupOnly: false,
    isPremium: false,
    handler: async ({ sock, from, senderJid }) => {
      const user = db.getUser(senderJid);
      if (!isNewWeek(user.lastWeekly)) {
        await sock.sendMessage(from, {
          text: `⏰ Vous avez déjà réclamé votre récompense cette semaine!\nRevenez dans 7 jours.`,
        });
        return;
      }
      db.updateUser(senderJid, {
        coins: (user.coins ?? 0) + WEEKLY_COINS,
        lastWeekly: new Date().toISOString(),
      });
      await sock.sendMessage(from, {
        text: `💰 *Récompense Hebdomadaire!*\n\n+${WEEKLY_COINS} coins!\nSolde: ${(user.coins ?? 0) + WEEKLY_COINS} coins`,
      });
    },
  },
  {
    name: "balance",
    description: "Voir votre solde de coins",
    category: "Économie",
    usage: ".balance [@mention]",
    aliases: ["solde", "coins", "wallet"],
    isOwnerOnly: false,
    isGroupOnly: false,
    isPremium: false,
    handler: async ({ sock, from, msg, senderJid }) => {
      const target =
        msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0] ?? senderJid;
      const user = db.getUser(target);
      await sock.sendMessage(from, {
        text: `💰 *Solde de @${target.split("@")[0]}*\n\n${user.coins ?? 0} coins`,
        mentions: [target],
      });
    },
  },
  {
    name: "give",
    description: "Donner des coins à quelqu'un",
    category: "Économie",
    usage: ".give [@mention] [montant]",
    aliases: ["transfert", "envoyer"],
    isOwnerOnly: false,
    isGroupOnly: false,
    isPremium: false,
    handler: async ({ sock, from, msg, args, senderJid }) => {
      const target = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0];
      const amount = parseInt(args[1] ?? args[0] ?? "0");
      if (!target || !amount || amount <= 0) {
        await sock.sendMessage(from, { text: "❌ Usage: .give [@mention] [montant]" });
        return;
      }
      const sender = db.getUser(senderJid);
      if ((sender.coins ?? 0) < amount) {
        await sock.sendMessage(from, { text: "❌ Vous n'avez pas assez de coins." });
        return;
      }
      db.updateUser(senderJid, { coins: (sender.coins ?? 0) - amount });
      const recipient = db.getUser(target);
      db.updateUser(target, { coins: (recipient.coins ?? 0) + amount });
      await sock.sendMessage(from, {
        text: `✅ Vous avez envoyé *${amount} coins* à @${target.split("@")[0]}!`,
        mentions: [target],
      });
    },
  },
  {
    name: "work",
    description: "Travailler pour gagner des coins",
    category: "Économie",
    usage: ".work",
    aliases: ["travailler", "travail"],
    isOwnerOnly: false,
    isGroupOnly: false,
    isPremium: false,
    handler: async ({ sock, from, senderJid }) => {
      const jobs = [
        "programmiez pour une startup",
        "avez livré des pizzas",
        "avez fait du baby-sitting",
        "avez réparé des téléphones",
        "avez donné des cours particuliers",
        "avez fait du streaming",
        "avez vendu des photos en ligne",
      ];
      const earned = Math.floor(Math.random() * (WORK_MAX - WORK_MIN)) + WORK_MIN;
      const job = jobs[Math.floor(Math.random() * jobs.length)]!;
      const user = db.getUser(senderJid);
      db.updateUser(senderJid, { coins: (user.coins ?? 0) + earned });
      await sock.sendMessage(from, {
        text: `💼 *Travail*\n\nVous avez ${job} et gagné *+${earned} coins!*\nSolde: ${(user.coins ?? 0) + earned} coins`,
      });
    },
  },
  {
    name: "gamble",
    description: "Parier vos coins",
    category: "Économie",
    usage: ".gamble [montant]",
    aliases: ["pari", "bet"],
    isOwnerOnly: false,
    isGroupOnly: false,
    isPremium: false,
    handler: async ({ sock, from, args, senderJid }) => {
      const amount = parseInt(args[0] ?? "0");
      if (!amount || amount <= 0) {
        await sock.sendMessage(from, { text: "❌ Spécifiez un montant à parier." });
        return;
      }
      const user = db.getUser(senderJid);
      if ((user.coins ?? 0) < amount) {
        await sock.sendMessage(from, { text: "❌ Solde insuffisant." });
        return;
      }
      const win = Math.random() > 0.5;
      const newBalance = win
        ? (user.coins ?? 0) + amount
        : (user.coins ?? 0) - amount;
      db.updateUser(senderJid, { coins: newBalance });
      await sock.sendMessage(from, {
        text: win
          ? `🎰 *Vous avez gagné!*\n+${amount} coins!\nSolde: ${newBalance} coins`
          : `🎰 *Vous avez perdu!*\n-${amount} coins\nSolde: ${newBalance} coins`,
      });
    },
  },
  {
    name: "steal",
    description: "Tenter de voler des coins à quelqu'un",
    category: "Économie",
    usage: ".steal [@mention]",
    aliases: ["voler"],
    isOwnerOnly: false,
    isGroupOnly: false,
    isPremium: false,
    handler: async ({ sock, from, msg, senderJid }) => {
      const target = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0];
      if (!target) {
        await sock.sendMessage(from, { text: "❌ Mentionnez quelqu'un à voler." });
        return;
      }
      if (target === senderJid) {
        await sock.sendMessage(from, { text: "❌ Vous ne pouvez pas vous voler vous-même!" });
        return;
      }
      const success = Math.random() > 0.4;
      const victim = db.getUser(target);
      const thief = db.getUser(senderJid);
      if (success && (victim.coins ?? 0) > 0) {
        const stolen = Math.floor((victim.coins ?? 0) * 0.1) || 10;
        db.updateUser(target, { coins: (victim.coins ?? 0) - stolen });
        db.updateUser(senderJid, { coins: (thief.coins ?? 0) + stolen });
        await sock.sendMessage(from, {
          text: `🥷 Succès! Vous avez volé *${stolen} coins* à @${target.split("@")[0]}!`,
          mentions: [target],
        });
      } else {
        const penalty = 50;
        db.updateUser(senderJid, { coins: Math.max(0, (thief.coins ?? 0) - penalty) });
        await sock.sendMessage(from, {
          text: `🚔 Échec! Vous avez été pris et payé *${penalty} coins* d'amende!`,
          mentions: [target],
        });
      }
    },
  },
  {
    name: "leaderboard",
    description: "Classement des meilleurs joueurs",
    category: "Économie",
    usage: ".leaderboard",
    aliases: ["top", "classement", "lb"],
    isOwnerOnly: false,
    isGroupOnly: false,
    isPremium: false,
    handler: async ({ sock, from }) => {
      const users = db.getAllUsers()
        .filter((u) => (u.coins ?? 0) > 0)
        .sort((a, b) => (b.coins ?? 0) - (a.coins ?? 0))
        .slice(0, 10);

      if (users.length === 0) {
        await sock.sendMessage(from, { text: "❌ Aucun utilisateur avec des coins." });
        return;
      }

      const medals = ["🥇", "🥈", "🥉"];
      let text = "🏆 *Classement Économie*\n\n";
      users.forEach((u, i) => {
        const medal = medals[i] ?? `${i + 1}.`;
        const phone = u.jid.split("@")[0];
        text += `${medal} +${phone}: *${u.coins ?? 0} coins*\n`;
      });
      await sock.sendMessage(from, { text });
    },
  },
  {
    name: "shop",
    description: "Boutique du bot",
    category: "Économie",
    usage: ".shop",
    aliases: ["boutique", "store"],
    isOwnerOnly: false,
    isGroupOnly: false,
    isPremium: false,
    handler: async ({ sock, from }) => {
      await sock.sendMessage(from, {
        text:
          `🛒 *Boutique VARNOX*\n\n` +
          `💎 Premium (1 mois): 5000 coins → .buy premium\n` +
          `⭐ Boost EXP x2 (24h): 1000 coins → .buy boost\n` +
          `🎭 Titre Personnalisé: 2000 coins → .buy title\n\n` +
          `Pour acheter: .buy [item]`,
      });
    },
  },
  {
    name: "buy",
    description: "Acheter un article dans la boutique",
    category: "Économie",
    usage: ".buy [article]",
    aliases: ["acheter"],
    isOwnerOnly: false,
    isGroupOnly: false,
    isPremium: false,
    handler: async ({ sock, from, args, senderJid }) => {
      const items: Record<string, { cost: number; label: string }> = {
        premium: { cost: 5000, label: "Accès Premium 1 mois" },
        boost: { cost: 1000, label: "Boost EXP x2 24h" },
        title: { cost: 2000, label: "Titre Personnalisé" },
      };
      const item = args[0]?.toLowerCase();
      if (!item || !items[item]) {
        await sock.sendMessage(from, { text: "❌ Article invalide. Utilisez .shop pour voir la liste." });
        return;
      }
      const { cost, label } = items[item]!;
      const user = db.getUser(senderJid);
      if ((user.coins ?? 0) < cost) {
        await sock.sendMessage(from, { text: `❌ Solde insuffisant. Vous avez ${user.coins ?? 0}/${cost} coins.` });
        return;
      }
      db.updateUser(senderJid, {
        coins: (user.coins ?? 0) - cost,
        isPremium: item === "premium" ? true : user.isPremium,
      });
      await sock.sendMessage(from, {
        text: `✅ Achat réussi!\n\n📦 ${label}\n💰 -${cost} coins`,
      });
    },
  },
  {
    name: "inventory",
    description: "Voir votre inventaire",
    category: "Économie",
    usage: ".inventory",
    aliases: ["inventaire", "inv"],
    isOwnerOnly: false,
    isGroupOnly: false,
    isPremium: false,
    handler: async ({ sock, from, senderJid }) => {
      const user = db.getUser(senderJid);
      await sock.sendMessage(from, {
        text:
          `🎒 *Votre Inventaire*\n\n` +
          `💰 Coins: ${user.coins ?? 0}\n` +
          `🌟 Niveau: ${user.level ?? 1}\n` +
          `📊 EXP: ${user.exp ?? 0}\n` +
          `💎 Premium: ${user.isPremium ? "Oui ✅" : "Non"}`,
      });
    },
  },
  {
    name: "levelrank",
    description: "Voir votre rang de niveau",
    category: "Économie",
    usage: ".levelrank",
    aliases: ["rang", "level"],
    isOwnerOnly: false,
    isGroupOnly: false,
    isPremium: false,
    handler: async ({ sock, from, senderJid }) => {
      const user = db.getUser(senderJid);
      const expNeeded = (user.level ?? 1) * 100 * (user.level ?? 1);
      const progress = Math.min(100, Math.floor(((user.exp ?? 0) / expNeeded) * 100));
      const bar = "█".repeat(Math.floor(progress / 10)) + "░".repeat(10 - Math.floor(progress / 10));
      await sock.sendMessage(from, {
        text:
          `⭐ *Votre Rang*\n\n` +
          `🌟 Niveau: ${user.level ?? 1}\n` +
          `📊 EXP: ${user.exp ?? 0}/${expNeeded}\n` +
          `${bar} ${progress}%`,
      });
    },
  },
];
