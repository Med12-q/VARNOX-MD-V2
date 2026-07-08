/**
 * VARNOX-MD-V2 — Fun Commands
 */

import { Command } from "./index.js";
import { randomItem } from "../utils/format.js";

const JOKES_FR = [
  "Pourquoi les plongeurs plongent-ils toujours en arrière ? Parce que sinon ils tomberaient dans le bateau !",
  "Qu'est-ce qu'un crocodile qui surveille les chaussures ? Un vigile.",
  "Pourquoi les lions mangent-ils les clowns en dernier ? Pour finir sur une bonne note.",
  "Comment appelle-t-on un chien sans pattes ? Peu importe, il ne viendra pas.",
  "Qu'est-ce qu'un canif ? Un petit fien.",
];

const FACTS_FR = [
  "Les pieuvres ont trois cœurs et du sang bleu.",
  "Un groupe de chats s'appelle une clowder.",
  "Les fourmis n'ont pas de poumons.",
  "Les dauphins dorment avec un œil ouvert.",
  "Les crevettes ont le cœur dans la tête.",
  "Un escargot peut dormir pendant 3 ans.",
  "Les requins sont plus vieux que les arbres.",
  "Une journée sur Vénus est plus longue qu'une année sur Vénus.",
];

const EIGHT_BALL = [
  "🔮 Absolument!",
  "🔮 Certainement oui.",
  "🔮 Oui, sans aucun doute.",
  "🔮 C'est décidément ainsi.",
  "🔮 Tu peux compter dessus.",
  "🔮 Pour l'instant, non.",
  "🔮 Mes sources disent non.",
  "🔮 Les perspectives ne sont pas bonnes.",
  "🔮 Très douteux.",
  "🔮 Réponds plus tard.",
  "🔮 Difficile à dire.",
  "🔮 Mieux vaut ne pas te le dire maintenant.",
];

const TRUTHS = [
  "Quelle est votre plus grande peur ?",
  "Avez-vous déjà menti à un ami ?",
  "Quel est votre plus grand secret ?",
  "Avez-vous déjà eu le béguin pour quelqu'un dans ce groupe ?",
  "Quelle est la chose la plus embarrassante que vous ayez faite ?",
];

const DARES = [
  "Chantez une chanson dans la prochaine réponse.",
  "Écrivez un message d'amour à la prochaine personne dans votre liste de contacts.",
  "Faites une pompe et filmez-vous.",
  "Mangez quelque chose de bizarre et décrivez-le.",
  "Envoyez votre meilleure photo de vous.",
];

const WOULD_YOU = [
  "Préfères-tu voler ou être invisible ?",
  "Préfères-tu vivre dans le passé ou dans le futur ?",
  "Préfères-tu avoir 10 millions € maintenant ou 100€/jour à vie ?",
  "Préfères-tu ne plus jamais dormir ou ne plus jamais manger ?",
];

export const commands: Omit<Command, "usageCount">[] = [
  {
    name: "dice",
    description: "Lancer un dé",
    category: "Fun",
    usage: ".dice [faces]",
    aliases: ["de", "roll"],
    isOwnerOnly: false,
    isGroupOnly: false,
    isPremium: false,
    handler: async ({ sock, from, args }) => {
      const faces = parseInt(args[0] ?? "6") || 6;
      const result = Math.floor(Math.random() * faces) + 1;
      await sock.sendMessage(from, {
        text: `🎲 Vous avez lancé un dé à ${faces} faces!\n\n*Résultat: ${result}*`,
      });
    },
  },
  {
    name: "flip",
    description: "Lancer une pièce",
    category: "Fun",
    usage: ".flip",
    aliases: ["piece", "coin"],
    isOwnerOnly: false,
    isGroupOnly: false,
    isPremium: false,
    handler: async ({ sock, from }) => {
      const result = Math.random() < 0.5 ? "🪙 PILE" : "🪙 FACE";
      await sock.sendMessage(from, { text: `🪙 Lancer de pièce...\n\n*${result}!*` });
    },
  },
  {
    name: "8ball",
    description: "Posez une question à la boule magique",
    category: "Fun",
    usage: ".8ball [question]",
    aliases: ["boule", "oracle"],
    isOwnerOnly: false,
    isGroupOnly: false,
    isPremium: false,
    handler: async ({ sock, from, args }) => {
      if (!args.length) {
        await sock.sendMessage(from, { text: "❌ Posez une question!" });
        return;
      }
      const answer = randomItem(EIGHT_BALL);
      const question = args.join(" ");
      await sock.sendMessage(from, {
        text: `🔮 *Boule Magique*\n\nQuestion: ${question}\n\n${answer}`,
      });
    },
  },
  {
    name: "joke",
    description: "Obtenir une blague",
    category: "Fun",
    usage: ".joke",
    aliases: ["blague", "blagues"],
    isOwnerOnly: false,
    isGroupOnly: false,
    isPremium: false,
    handler: async ({ sock, from }) => {
      const joke = randomItem(JOKES_FR);
      await sock.sendMessage(from, { text: `😂 *Blague du Jour*\n\n${joke}` });
    },
  },
  {
    name: "fact",
    description: "Obtenir un fait intéressant",
    category: "Fun",
    usage: ".fact",
    aliases: ["fait", "info"],
    isOwnerOnly: false,
    isGroupOnly: false,
    isPremium: false,
    handler: async ({ sock, from }) => {
      const fact = randomItem(FACTS_FR);
      await sock.sendMessage(from, { text: `🧠 *Fait Intéressant*\n\n${fact}` });
    },
  },
  {
    name: "truth",
    description: "Obtenir une question vérité",
    category: "Fun",
    usage: ".truth",
    aliases: ["verite"],
    isOwnerOnly: false,
    isGroupOnly: false,
    isPremium: false,
    handler: async ({ sock, from }) => {
      const q = randomItem(TRUTHS);
      await sock.sendMessage(from, { text: `🎯 *Vérité*\n\n${q}` });
    },
  },
  {
    name: "dare",
    description: "Obtenir un défi",
    category: "Fun",
    usage: ".dare",
    aliases: ["defi"],
    isOwnerOnly: false,
    isGroupOnly: false,
    isPremium: false,
    handler: async ({ sock, from }) => {
      const d = randomItem(DARES);
      await sock.sendMessage(from, { text: `🔥 *Défi*\n\n${d}` });
    },
  },
  {
    name: "choose",
    description: "Choisir parmi plusieurs options",
    category: "Fun",
    usage: ".choose [option1] | [option2] | ...",
    aliases: ["choisir", "choice"],
    isOwnerOnly: false,
    isGroupOnly: false,
    isPremium: false,
    handler: async ({ sock, from, args }) => {
      const options = args.join(" ").split("|").map((o) => o.trim()).filter(Boolean);
      if (options.length < 2) {
        await sock.sendMessage(from, { text: "❌ Séparez les options avec |" });
        return;
      }
      const chosen = randomItem(options);
      await sock.sendMessage(from, { text: `🎯 *Choix aléatoire:*\n\n*${chosen}*` });
    },
  },
  {
    name: "love",
    description: "Calculer le pourcentage d'amour entre deux personnes",
    category: "Fun",
    usage: ".love [nom1] [nom2]",
    aliases: ["amour", "compatibilite"],
    isOwnerOnly: false,
    isGroupOnly: false,
    isPremium: false,
    handler: async ({ sock, from, args }) => {
      if (args.length < 2) {
        await sock.sendMessage(from, { text: "❌ Donnez deux noms. Ex: .love Ahmed Sara" });
        return;
      }
      const name1 = args[0];
      const name2 = args.slice(1).join(" ");
      const percentage = Math.floor(Math.random() * 100) + 1;
      let heart = "💔";
      if (percentage >= 80) heart = "❤️";
      else if (percentage >= 50) heart = "💕";
      else if (percentage >= 30) heart = "💙";
      await sock.sendMessage(from, {
        text: `${heart} *Amouromètre*\n\n${name1} + ${name2} = *${percentage}%*\n\n${"█".repeat(Math.floor(percentage / 10))}${"░".repeat(10 - Math.floor(percentage / 10))}`,
      });
    },
  },
  {
    name: "rate",
    description: "Évaluer quelqu'un ou quelque chose",
    category: "Fun",
    usage: ".rate [chose/personne]",
    aliases: ["noter", "evaluer"],
    isOwnerOnly: false,
    isGroupOnly: false,
    isPremium: false,
    handler: async ({ sock, from, args }) => {
      if (!args.length) {
        await sock.sendMessage(from, { text: "❌ Donnez quelque chose à évaluer." });
        return;
      }
      const thing = args.join(" ");
      const rating = Math.floor(Math.random() * 10) + 1;
      const stars = "⭐".repeat(rating);
      await sock.sendMessage(from, {
        text: `⭐ *Évaluation*\n\n"${thing}"\n\nNote: ${stars} (${rating}/10)`,
      });
    },
  },
  {
    name: "iq",
    description: "Calculer votre QI (pour rire!)",
    category: "Fun",
    usage: ".iq [@mention]",
    aliases: ["qi"],
    isOwnerOnly: false,
    isGroupOnly: false,
    isPremium: false,
    handler: async ({ sock, from, msg, senderJid }) => {
      const target =
        msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0] ?? senderJid;
      const iq = Math.floor(Math.random() * 200) + 1;
      let label = "🤔 Dans la moyenne";
      if (iq > 150) label = "🧠 Génie!";
      else if (iq > 120) label = "😎 Très intelligent";
      else if (iq < 50) label = "😅 Hmm...";
      await sock.sendMessage(from, {
        text: `🧠 *Test de QI*\n\n@${target.split("@")[0]} a un QI de *${iq}*\n${label}`,
        mentions: [target],
      });
    },
  },
  {
    name: "ship",
    description: "Calculer la compatibilité entre deux personnes",
    category: "Fun",
    usage: ".ship [@mention1] [@mention2]",
    aliases: ["compatibilite", "couple"],
    isOwnerOnly: false,
    isGroupOnly: false,
    isPremium: false,
    handler: async ({ sock, from, msg, senderJid }) => {
      const mentions = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid ?? [];
      if (mentions.length < 2) {
        await sock.sendMessage(from, { text: "❌ Mentionnez deux personnes." });
        return;
      }
      const p1 = mentions[0]!;
      const p2 = mentions[1]!;
      const score = Math.floor(Math.random() * 100) + 1;
      await sock.sendMessage(from, {
        text: `💑 *Compatibilité*\n\n@${p1.split("@")[0]} + @${p2.split("@")[0]}\n\nScore: *${score}%* ${"❤️".repeat(Math.ceil(score / 20))}`,
        mentions: [p1, p2],
      });
    },
  },
  {
    name: "wyr",
    description: "Tu préfèrerais... (Would You Rather)",
    category: "Fun",
    usage: ".wyr",
    aliases: ["prefers", "plutot"],
    isOwnerOnly: false,
    isGroupOnly: false,
    isPremium: false,
    handler: async ({ sock, from }) => {
      const q = randomItem(WOULD_YOU);
      await sock.sendMessage(from, { text: `🤔 *Tu Préférerais...*\n\n${q}` });
    },
  },
  {
    name: "rps",
    description: "Pierre, Feuille, Ciseaux",
    category: "Fun",
    usage: ".rps [pierre/feuille/ciseaux]",
    aliases: ["chifoumi"],
    isOwnerOnly: false,
    isGroupOnly: false,
    isPremium: false,
    handler: async ({ sock, from, args }) => {
      const choices: Record<string, string> = { pierre: "🪨", feuille: "📄", ciseaux: "✂️" };
      const botChoices = Object.keys(choices);
      const userChoice = args[0]?.toLowerCase();
      if (!userChoice || !choices[userChoice]) {
        await sock.sendMessage(from, { text: "❌ Choisissez: pierre, feuille ou ciseaux" });
        return;
      }
      const botChoice = randomItem(botChoices);
      let result = "🤝 Égalité!";
      if (
        (userChoice === "pierre" && botChoice === "ciseaux") ||
        (userChoice === "feuille" && botChoice === "pierre") ||
        (userChoice === "ciseaux" && botChoice === "feuille")
      ) {
        result = "🎉 Vous gagnez!";
      } else if (userChoice !== botChoice) {
        result = "😅 Vous perdez!";
      }
      await sock.sendMessage(from, {
        text: `🎮 *Pierre Feuille Ciseaux*\n\nVous: ${choices[userChoice]}\nBot: ${choices[botChoice]!}\n\n${result}`,
      });
    },
  },
  {
    name: "quote",
    description: "Citation inspirante",
    category: "Fun",
    usage: ".quote",
    aliases: ["citation"],
    isOwnerOnly: false,
    isGroupOnly: false,
    isPremium: false,
    handler: async ({ sock, from }) => {
      const quotes = [
        "La vie est belle quand on la vit pleinement. — Unknown",
        "Le succès n'est pas final, l'échec n'est pas fatal. — Winston Churchill",
        "La seule façon de faire du bon travail est d'aimer ce que vous faites. — Steve Jobs",
        "L'imagination est plus importante que le savoir. — Albert Einstein",
        "Soyez le changement que vous voulez voir dans le monde. — Gandhi",
      ];
      await sock.sendMessage(from, { text: `💬 *Citation du Jour*\n\n"${randomItem(quotes)}"` });
    },
  },
  {
    name: "hug",
    description: "Donner un câlin à quelqu'un",
    category: "Fun",
    usage: ".hug [@mention]",
    aliases: ["calin"],
    isOwnerOnly: false,
    isGroupOnly: false,
    isPremium: false,
    handler: async ({ sock, from, msg, senderJid }) => {
      const target = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0];
      if (!target) {
        await sock.sendMessage(from, { text: "❌ Mentionnez quelqu'un!" });
        return;
      }
      await sock.sendMessage(from, {
        text: `🤗 @${senderJid.split("@")[0]} donne un câlin à @${target.split("@")[0]}!`,
        mentions: [senderJid, target],
      });
    },
  },
  {
    name: "slap",
    description: "Donner une gifle (en rigolant!)",
    category: "Fun",
    usage: ".slap [@mention]",
    aliases: ["gifle"],
    isOwnerOnly: false,
    isGroupOnly: false,
    isPremium: false,
    handler: async ({ sock, from, msg, senderJid }) => {
      const target = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0];
      if (!target) {
        await sock.sendMessage(from, { text: "❌ Mentionnez quelqu'un!" });
        return;
      }
      await sock.sendMessage(from, {
        text: `👋 @${senderJid.split("@")[0]} donne une gifle à @${target.split("@")[0]}! 😂`,
        mentions: [senderJid, target],
      });
    },
  },
  {
    name: "marry",
    description: "Demander quelqu'un en mariage (pour rire!)",
    category: "Fun",
    usage: ".marry [@mention]",
    aliases: ["mariage"],
    isOwnerOnly: false,
    isGroupOnly: false,
    isPremium: false,
    handler: async ({ sock, from, msg, senderJid }) => {
      const target = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0];
      if (!target) {
        await sock.sendMessage(from, { text: "❌ Mentionnez quelqu'un!" });
        return;
      }
      const accepted = Math.random() > 0.3;
      await sock.sendMessage(from, {
        text: accepted
          ? `💍 @${target.split("@")[0]} a accepté la demande de @${senderJid.split("@")[0]}! Félicitations! 🎊`
          : `💔 @${target.split("@")[0]} a refusé... Désolé @${senderJid.split("@")[0]} 😅`,
        mentions: [senderJid, target],
      });
    },
  },
  {
    name: "trivia",
    description: "Question trivia aléatoire",
    category: "Fun",
    usage: ".trivia",
    aliases: ["quiz"],
    isOwnerOnly: false,
    isGroupOnly: false,
    isPremium: false,
    handler: async ({ sock, from }) => {
      const questions = [
        { q: "Quelle est la capitale de la France?", a: "Paris" },
        { q: "Combien de jours a une année?", a: "365" },
        { q: "Quel est le plus grand océan?", a: "Pacifique" },
        { q: "Quel est le symbole chimique de l'or?", a: "Au" },
        { q: "Qui a peint la Joconde?", a: "Léonard de Vinci" },
      ];
      const q = randomItem(questions);
      await sock.sendMessage(from, {
        text: `❓ *Trivia*\n\n${q.q}\n\nRépondez en moins de 30 secondes!\n\n_Réponse: cachée - tapez .answer_`,
      });
    },
  },
  {
    name: "zodiac",
    description: "Obtenir votre horoscope",
    category: "Fun",
    usage: ".zodiac [signe]",
    aliases: ["horoscope", "signe"],
    isOwnerOnly: false,
    isGroupOnly: false,
    isPremium: false,
    handler: async ({ sock, from, args }) => {
      const signs: Record<string, string> = {
        belier: "🐏", taureau: "🐂", gemeaux: "👯", cancer: "🦀",
        lion: "🦁", vierge: "👧", balance: "⚖️", scorpion: "🦂",
        sagittaire: "🏹", capricorne: "🐐", verseau: "🏺", poissons: "🐟",
      };
      const sign = args[0]?.toLowerCase();
      if (!sign || !signs[sign]) {
        await sock.sendMessage(from, {
          text: `❌ Signes disponibles: ${Object.keys(signs).join(", ")}`,
        });
        return;
      }
      const fortunes = ["Excellente journée devant vous!", "Soyez prudent aujourd'hui.", "La chance est de votre côté!", "Restez calme et concentré."];
      await sock.sendMessage(from, {
        text: `${signs[sign]} *Horoscope ${sign.charAt(0).toUpperCase() + sign.slice(1)}*\n\n${randomItem(fortunes)}`,
      });
    },
  },
  {
    name: "encrypt",
    description: "Encoder un message en chiffre",
    category: "Fun",
    usage: ".encrypt [message]",
    aliases: ["chiffrer", "code"],
    isOwnerOnly: false,
    isGroupOnly: false,
    isPremium: false,
    handler: async ({ sock, from, args }) => {
      const text = args.join(" ");
      if (!text) {
        await sock.sendMessage(from, { text: "❌ Entrez un message à chiffrer." });
        return;
      }
      const encoded = Buffer.from(text).toString("base64");
      await sock.sendMessage(from, { text: `🔒 *Message chiffré:*\n\n${encoded}` });
    },
  },
  {
    name: "decrypt",
    description: "Décoder un message chiffré",
    category: "Fun",
    usage: ".decrypt [code]",
    aliases: ["dechiffrer", "decode"],
    isOwnerOnly: false,
    isGroupOnly: false,
    isPremium: false,
    handler: async ({ sock, from, args }) => {
      const code = args.join(" ");
      if (!code) {
        await sock.sendMessage(from, { text: "❌ Entrez un code à déchiffrer." });
        return;
      }
      try {
        const decoded = Buffer.from(code, "base64").toString("utf-8");
        await sock.sendMessage(from, { text: `🔓 *Message déchiffré:*\n\n${decoded}` });
      } catch {
        await sock.sendMessage(from, { text: "❌ Code invalide!" });
      }
    },
  },
];
