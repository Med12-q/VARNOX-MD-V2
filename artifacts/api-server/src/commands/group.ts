/**
 * VARNOX-MD-V2 — Group Commands
 */

import { Command } from "./index.js";
import { db } from "../database/db.js";

export const commands: Omit<Command, "usageCount">[] = [
  {
    name: "kick",
    description: "Expulser un membre du groupe",
    category: "Groupe",
    usage: ".kick [@mention]",
    aliases: ["virer", "expulser"],
    isOwnerOnly: false,
    isGroupOnly: true,
    isPremium: false,
    handler: async ({ sock, from, msg, args, senderJid }) => {
      if (!db.isAdmin(senderJid)) {
        await sock.sendMessage(from, { text: "❌ Vous devez être admin pour utiliser cette commande." });
        return;
      }
      const target = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0];
      if (!target) {
        await sock.sendMessage(from, { text: "❌ Mentionnez le membre à expulser." });
        return;
      }
      await sock.groupParticipantsUpdate(from, [target], "remove");
      await sock.sendMessage(from, {
        text: `✅ @${target.split("@")[0]} a été expulsé.`,
        mentions: [target],
      });
    },
  },
  {
    name: "add",
    description: "Ajouter un membre au groupe",
    category: "Groupe",
    usage: ".add [numéro]",
    aliases: ["ajouter"],
    isOwnerOnly: false,
    isGroupOnly: true,
    isPremium: false,
    handler: async ({ sock, from, args, senderJid }) => {
      if (!db.isAdmin(senderJid)) {
        await sock.sendMessage(from, { text: "❌ Vous devez être admin pour utiliser cette commande." });
        return;
      }
      const phone = args[0]?.replace(/[^0-9]/g, "");
      if (!phone) {
        await sock.sendMessage(from, { text: "❌ Veuillez spécifier un numéro." });
        return;
      }
      const jid = `${phone}@s.whatsapp.net`;
      await sock.groupParticipantsUpdate(from, [jid], "add");
      await sock.sendMessage(from, { text: `✅ @${phone} a été ajouté au groupe.`, mentions: [jid] });
    },
  },
  {
    name: "promote",
    description: "Promouvoir un membre comme admin",
    category: "Groupe",
    usage: ".promote [@mention]",
    aliases: ["promouvoir", "admin"],
    isOwnerOnly: false,
    isGroupOnly: true,
    isPremium: false,
    handler: async ({ sock, from, msg, senderJid }) => {
      if (!db.isAdmin(senderJid)) {
        await sock.sendMessage(from, { text: "❌ Vous devez être admin pour utiliser cette commande." });
        return;
      }
      const target = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0];
      if (!target) {
        await sock.sendMessage(from, { text: "❌ Mentionnez le membre à promouvoir." });
        return;
      }
      await sock.groupParticipantsUpdate(from, [target], "promote");
      await sock.sendMessage(from, {
        text: `✅ @${target.split("@")[0]} est maintenant admin!`,
        mentions: [target],
      });
    },
  },
  {
    name: "demote",
    description: "Rétrograder un admin",
    category: "Groupe",
    usage: ".demote [@mention]",
    aliases: ["retrograder"],
    isOwnerOnly: false,
    isGroupOnly: true,
    isPremium: false,
    handler: async ({ sock, from, msg, senderJid }) => {
      if (!db.isAdmin(senderJid)) {
        await sock.sendMessage(from, { text: "❌ Vous devez être admin pour utiliser cette commande." });
        return;
      }
      const target = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0];
      if (!target) {
        await sock.sendMessage(from, { text: "❌ Mentionnez le membre à rétrograder." });
        return;
      }
      await sock.groupParticipantsUpdate(from, [target], "demote");
      await sock.sendMessage(from, {
        text: `✅ @${target.split("@")[0]} a été rétrogradé.`,
        mentions: [target],
      });
    },
  },
  {
    name: "tagall",
    description: "Mentionner tous les membres du groupe",
    category: "Groupe",
    usage: ".tagall [message]",
    aliases: ["mentionner", "everyone"],
    isOwnerOnly: false,
    isGroupOnly: true,
    isPremium: false,
    handler: async ({ sock, from, args, senderJid }) => {
      if (!db.isAdmin(senderJid)) {
        await sock.sendMessage(from, { text: "❌ Commande réservée aux admins." });
        return;
      }
      const meta = await sock.groupMetadata(from);
      const participants = meta.participants.map((p) => p.id);
      const text = args.join(" ") || "Attention tout le monde!";
      const mentions = participants.map((p) => `@${p.split("@")[0]}`).join(" ");
      await sock.sendMessage(from, {
        text: `📢 *${text}*\n\n${mentions}`,
        mentions: participants,
      });
    },
  },
  {
    name: "hidetag",
    description: "Mentionner tous sans afficher les @",
    category: "Groupe",
    usage: ".hidetag [message]",
    aliases: ["htag", "silent"],
    isOwnerOnly: false,
    isGroupOnly: true,
    isPremium: false,
    handler: async ({ sock, from, args, senderJid }) => {
      if (!db.isAdmin(senderJid)) {
        await sock.sendMessage(from, { text: "❌ Commande réservée aux admins." });
        return;
      }
      const meta = await sock.groupMetadata(from);
      const participants = meta.participants.map((p) => p.id);
      const text = args.join(" ") || "Message pour tous.";
      await sock.sendMessage(from, { text, mentions: participants });
    },
  },
  {
    name: "welcome",
    description: "Activer/désactiver les messages de bienvenue",
    category: "Groupe",
    usage: ".welcome [on/off]",
    aliases: ["bienvenue"],
    isOwnerOnly: false,
    isGroupOnly: true,
    isPremium: false,
    handler: async ({ sock, from, args, senderJid }) => {
      if (!db.isAdmin(senderJid)) {
        await sock.sendMessage(from, { text: "❌ Commande réservée aux admins." });
        return;
      }
      const state = args[0] === "on";
      db.updateGroup(from, { welcome: state });
      await sock.sendMessage(from, {
        text: `✅ Messages de bienvenue: *${state ? "Activés" : "Désactivés"}*`,
      });
    },
  },
  {
    name: "goodbye",
    description: "Activer/désactiver les messages d'au revoir",
    category: "Groupe",
    usage: ".goodbye [on/off]",
    aliases: ["aurevoir", "bye"],
    isOwnerOnly: false,
    isGroupOnly: true,
    isPremium: false,
    handler: async ({ sock, from, args, senderJid }) => {
      if (!db.isAdmin(senderJid)) {
        await sock.sendMessage(from, { text: "❌ Commande réservée aux admins." });
        return;
      }
      const state = args[0] === "on";
      db.updateGroup(from, { goodbye: state });
      await sock.sendMessage(from, {
        text: `✅ Messages d'au revoir: *${state ? "Activés" : "Désactivés"}*`,
      });
    },
  },
  {
    name: "antilink",
    description: "Activer/désactiver la protection anti-liens",
    category: "Groupe",
    usage: ".antilink [on/off]",
    aliases: ["antiliens"],
    isOwnerOnly: false,
    isGroupOnly: true,
    isPremium: false,
    handler: async ({ sock, from, args, senderJid }) => {
      if (!db.isAdmin(senderJid)) {
        await sock.sendMessage(from, { text: "❌ Commande réservée aux admins." });
        return;
      }
      const state = args[0] === "on";
      db.updateGroup(from, { antilink: state });
      await sock.sendMessage(from, {
        text: `✅ Anti-liens: *${state ? "Activé" : "Désactivé"}*`,
      });
    },
  },
  {
    name: "antibot",
    description: "Activer/désactiver la protection anti-bots",
    category: "Groupe",
    usage: ".antibot [on/off]",
    aliases: [],
    isOwnerOnly: false,
    isGroupOnly: true,
    isPremium: false,
    handler: async ({ sock, from, args, senderJid }) => {
      if (!db.isAdmin(senderJid)) {
        await sock.sendMessage(from, { text: "❌ Commande réservée aux admins." });
        return;
      }
      const state = args[0] === "on";
      db.updateGroup(from, { antibot: state });
      await sock.sendMessage(from, {
        text: `✅ Anti-bots: *${state ? "Activé" : "Désactivé"}*`,
      });
    },
  },
  {
    name: "mute",
    description: "Rendre le groupe en lecture seule",
    category: "Groupe",
    usage: ".mute",
    aliases: ["muet"],
    isOwnerOnly: false,
    isGroupOnly: true,
    isPremium: false,
    handler: async ({ sock, from, senderJid }) => {
      if (!db.isAdmin(senderJid)) {
        await sock.sendMessage(from, { text: "❌ Commande réservée aux admins." });
        return;
      }
      await sock.groupSettingUpdate(from, "announcement");
      db.updateGroup(from, { muted: true });
      await sock.sendMessage(from, { text: "🔇 *Groupe en lecture seule.* Seuls les admins peuvent envoyer des messages." });
    },
  },
  {
    name: "unmute",
    description: "Ouvrir le groupe à tous",
    category: "Groupe",
    usage: ".unmute",
    aliases: ["demuet"],
    isOwnerOnly: false,
    isGroupOnly: true,
    isPremium: false,
    handler: async ({ sock, from, senderJid }) => {
      if (!db.isAdmin(senderJid)) {
        await sock.sendMessage(from, { text: "❌ Commande réservée aux admins." });
        return;
      }
      await sock.groupSettingUpdate(from, "not_announcement");
      db.updateGroup(from, { muted: false });
      await sock.sendMessage(from, { text: "🔊 *Groupe ouvert.* Tout le monde peut envoyer des messages." });
    },
  },
  {
    name: "warn",
    description: "Avertir un membre",
    category: "Groupe",
    usage: ".warn [@mention] [raison]",
    aliases: ["avertir"],
    isOwnerOnly: false,
    isGroupOnly: true,
    isPremium: false,
    handler: async ({ sock, from, msg, args, senderJid }) => {
      if (!db.isAdmin(senderJid)) {
        await sock.sendMessage(from, { text: "❌ Commande réservée aux admins." });
        return;
      }
      const target = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0];
      if (!target) {
        await sock.sendMessage(from, { text: "❌ Mentionnez le membre à avertir." });
        return;
      }
      const reason = args.slice(1).join(" ") || "Comportement inapproprié";
      const user = db.getUser(target);
      const warns = (user.warns ?? 0) + 1;
      db.updateUser(target, { warns });
      await sock.sendMessage(from, {
        text: `⚠️ *Avertissement*\n@${target.split("@")[0]} a reçu un avertissement.\nRaison: ${reason}\nTotal: ${warns}/3`,
        mentions: [target],
      });
      if (warns >= 3) {
        await sock.groupParticipantsUpdate(from, [target], "remove");
        await sock.sendMessage(from, {
          text: `🚫 @${target.split("@")[0]} a été expulsé après 3 avertissements.`,
          mentions: [target],
        });
        db.updateUser(target, { warns: 0 });
      }
    },
  },
  {
    name: "resetwarn",
    description: "Réinitialiser les avertissements d'un membre",
    category: "Groupe",
    usage: ".resetwarn [@mention]",
    aliases: ["resetavert"],
    isOwnerOnly: false,
    isGroupOnly: true,
    isPremium: false,
    handler: async ({ sock, from, msg, senderJid }) => {
      if (!db.isAdmin(senderJid)) {
        await sock.sendMessage(from, { text: "❌ Commande réservée aux admins." });
        return;
      }
      const target = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0];
      if (!target) {
        await sock.sendMessage(from, { text: "❌ Mentionnez le membre." });
        return;
      }
      db.updateUser(target, { warns: 0 });
      await sock.sendMessage(from, {
        text: `✅ Avertissements de @${target.split("@")[0]} réinitialisés.`,
        mentions: [target],
      });
    },
  },
  {
    name: "warnings",
    description: "Voir les avertissements d'un membre",
    category: "Groupe",
    usage: ".warnings [@mention]",
    aliases: ["avertissements"],
    isOwnerOnly: false,
    isGroupOnly: true,
    isPremium: false,
    handler: async ({ sock, from, msg, senderJid }) => {
      const target = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0] ?? senderJid;
      const user = db.getUser(target);
      await sock.sendMessage(from, {
        text: `⚠️ @${target.split("@")[0]} a *${user.warns ?? 0}/3* avertissements.`,
        mentions: [target],
      });
    },
  },
  {
    name: "lock",
    description: "Verrouiller les paramètres du groupe",
    category: "Groupe",
    usage: ".lock",
    aliases: ["verrouiller"],
    isOwnerOnly: false,
    isGroupOnly: true,
    isPremium: false,
    handler: async ({ sock, from, senderJid }) => {
      if (!db.isAdmin(senderJid)) {
        await sock.sendMessage(from, { text: "❌ Commande réservée aux admins." });
        return;
      }
      await sock.groupSettingUpdate(from, "locked");
      await sock.sendMessage(from, { text: "🔒 Groupe verrouillé. Seuls les admins peuvent modifier les paramètres." });
    },
  },
  {
    name: "unlock",
    description: "Déverrouiller les paramètres du groupe",
    category: "Groupe",
    usage: ".unlock",
    aliases: ["deverrouiller"],
    isOwnerOnly: false,
    isGroupOnly: true,
    isPremium: false,
    handler: async ({ sock, from, senderJid }) => {
      if (!db.isAdmin(senderJid)) {
        await sock.sendMessage(from, { text: "❌ Commande réservée aux admins." });
        return;
      }
      await sock.groupSettingUpdate(from, "unlocked");
      await sock.sendMessage(from, { text: "🔓 Groupe déverrouillé. Tous les membres peuvent modifier les paramètres." });
    },
  },
  {
    name: "groupinfo",
    description: "Informations sur le groupe",
    category: "Groupe",
    usage: ".groupinfo",
    aliases: ["gcinfo", "infogroupe"],
    isOwnerOnly: false,
    isGroupOnly: true,
    isPremium: false,
    handler: async ({ sock, from }) => {
      const meta = await sock.groupMetadata(from);
      const groupData = db.getGroup(from);
      await sock.sendMessage(from, {
        text:
          `👥 *Informations du Groupe*\n\n` +
          `📌 Nom: ${meta.subject}\n` +
          `📋 Description: ${meta.desc ?? "Aucune"}\n` +
          `👤 Membres: ${meta.participants.length}\n` +
          `👑 Admins: ${meta.participants.filter((p) => p.admin).length}\n` +
          `🔗 Anti-liens: ${groupData.antilink ? "Activé" : "Désactivé"}\n` +
          `👋 Bienvenue: ${groupData.welcome ? "Activé" : "Désactivé"}\n` +
          `🔇 Muet: ${groupData.muted ? "Oui" : "Non"}`,
      });
    },
  },
  {
    name: "setwelcome",
    description: "Définir le message de bienvenue",
    category: "Groupe",
    usage: ".setwelcome [message]",
    aliases: ["msgwelcome"],
    isOwnerOnly: false,
    isGroupOnly: true,
    isPremium: false,
    handler: async ({ sock, from, args, senderJid }) => {
      if (!db.isAdmin(senderJid)) {
        await sock.sendMessage(from, { text: "❌ Commande réservée aux admins." });
        return;
      }
      const msg = args.join(" ");
      if (!msg) {
        await sock.sendMessage(from, { text: "❌ Veuillez écrire un message." });
        return;
      }
      db.updateGroup(from, { welcomeMsg: msg, welcome: true });
      await sock.sendMessage(from, { text: `✅ Message de bienvenue défini!\n\nAperçu:\n${msg}` });
    },
  },
  {
    name: "setdesc",
    description: "Changer la description du groupe",
    category: "Groupe",
    usage: ".setdesc [description]",
    aliases: ["description"],
    isOwnerOnly: false,
    isGroupOnly: true,
    isPremium: false,
    handler: async ({ sock, from, args, senderJid }) => {
      if (!db.isAdmin(senderJid)) {
        await sock.sendMessage(from, { text: "❌ Commande réservée aux admins." });
        return;
      }
      const desc = args.join(" ");
      if (!desc) {
        await sock.sendMessage(from, { text: "❌ Veuillez écrire une description." });
        return;
      }
      await sock.groupUpdateDescription(from, desc);
      await sock.sendMessage(from, { text: "✅ Description du groupe mise à jour!" });
    },
  },
  {
    name: "linkgroup",
    description: "Obtenir le lien d'invitation du groupe",
    category: "Groupe",
    usage: ".linkgroup",
    aliases: ["liengroupe", "invite"],
    isOwnerOnly: false,
    isGroupOnly: true,
    isPremium: false,
    handler: async ({ sock, from, senderJid }) => {
      if (!db.isAdmin(senderJid)) {
        await sock.sendMessage(from, { text: "❌ Commande réservée aux admins." });
        return;
      }
      const code = await sock.groupInviteCode(from);
      await sock.sendMessage(from, {
        text: `🔗 *Lien du Groupe*\nhttps://chat.whatsapp.com/${code}`,
      });
    },
  },
  {
    name: "resetlink",
    description: "Réinitialiser le lien d'invitation",
    category: "Groupe",
    usage: ".resetlink",
    aliases: ["resetinvite"],
    isOwnerOnly: false,
    isGroupOnly: true,
    isPremium: false,
    handler: async ({ sock, from, senderJid }) => {
      if (!db.isAdmin(senderJid)) {
        await sock.sendMessage(from, { text: "❌ Commande réservée aux admins." });
        return;
      }
      await sock.groupRevokeInvite(from);
      await sock.sendMessage(from, { text: "✅ Lien d'invitation réinitialisé!" });
    },
  },
  {
    name: "rules",
    description: "Afficher ou définir les règles du groupe",
    category: "Groupe",
    usage: ".rules [set règles]",
    aliases: ["regles"],
    isOwnerOnly: false,
    isGroupOnly: true,
    isPremium: false,
    handler: async ({ sock, from, args, senderJid }) => {
      const groupData = db.getGroup(from);
      if (args[0] === "set") {
        if (!db.isAdmin(senderJid)) {
          await sock.sendMessage(from, { text: "❌ Commande réservée aux admins." });
          return;
        }
        const rules = args.slice(1).join(" ");
        db.updateGroup(from, { rules });
        await sock.sendMessage(from, { text: "✅ Règles mises à jour!" });
      } else {
        await sock.sendMessage(from, {
          text: groupData.rules ? `📋 *Règles du Groupe*\n\n${groupData.rules}` : "❌ Aucune règle définie.",
        });
      }
    },
  },
];
