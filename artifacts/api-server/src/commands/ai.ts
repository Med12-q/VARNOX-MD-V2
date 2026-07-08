/**
 * VARNOX-MD-V2 — AI Commands
 * Requires AI API configuration.
 */

import { Command } from "./index.js";

function requireAiKey(name: string, description: string) {
  return async ({ sock, from, args }: { sock: any; from: string; args: string[] }) => {
    if (!args.length) {
      await sock.sendMessage(from, { text: `❌ Usage: .${name} [${description}]` });
      return;
    }
    if (!process.env["OPENAI_API_KEY"] && !process.env["AI_API_KEY"]) {
      await sock.sendMessage(from, {
        text:
          `🤖 *IA - ${name}*\n\n` +
          `Pour activer cette commande, configurez:\n` +
          `\`OPENAI_API_KEY\` ou \`AI_API_KEY\` dans .env`,
      });
      return;
    }
    await sock.sendMessage(from, { text: "⏳ Traitement en cours..." });
    // Integration code would go here
    await sock.sendMessage(from, { text: "❌ Service IA non disponible pour le moment." });
  };
}

export const commands: Omit<Command, "usageCount">[] = [
  {
    name: "gpt",
    description: "Discuter avec l'IA ChatGPT",
    category: "IA",
    usage: ".gpt [message]",
    aliases: ["ai", "chatgpt", "chat"],
    isOwnerOnly: false,
    isGroupOnly: false,
    isPremium: false,
    handler: requireAiKey("gpt", "message"),
  },
  {
    name: "imagine",
    description: "Générer une image avec l'IA",
    category: "IA",
    usage: ".imagine [description]",
    aliases: ["genimage", "dalle", "midjourney"],
    isOwnerOnly: false,
    isGroupOnly: false,
    isPremium: true,
    handler: requireAiKey("imagine", "description"),
  },
  {
    name: "translate",
    description: "Traduire un texte dans une autre langue",
    category: "IA",
    usage: ".translate [lang] [texte]",
    aliases: ["traduction", "trad", "tr"],
    isOwnerOnly: false,
    isGroupOnly: false,
    isPremium: false,
    handler: async ({ sock, from, args }) => {
      if (!args.length) {
        await sock.sendMessage(from, { text: "❌ Usage: .translate [langue] [texte]\nEx: .translate en Bonjour tout le monde" });
        return;
      }
      await sock.sendMessage(from, { text: "⚙️ Traduction: configurez AI_API_KEY pour activer cette fonctionnalité." });
    },
  },
  {
    name: "summarize",
    description: "Résumer un texte long",
    category: "IA",
    usage: ".summarize [texte]",
    aliases: ["resume", "tldr"],
    isOwnerOnly: false,
    isGroupOnly: false,
    isPremium: false,
    handler: requireAiKey("summarize", "texte à résumer"),
  },
  {
    name: "code",
    description: "Aide à la programmation avec l'IA",
    category: "IA",
    usage: ".code [question]",
    aliases: ["codeai", "debug"],
    isOwnerOnly: false,
    isGroupOnly: false,
    isPremium: false,
    handler: requireAiKey("code", "question de programmation"),
  },
  {
    name: "grammar",
    description: "Corriger la grammaire d'un texte",
    category: "IA",
    usage: ".grammar [texte]",
    aliases: ["correct", "ortho"],
    isOwnerOnly: false,
    isGroupOnly: false,
    isPremium: false,
    handler: requireAiKey("grammar", "texte à corriger"),
  },
  {
    name: "poem",
    description: "Générer un poème avec l'IA",
    category: "IA",
    usage: ".poem [sujet]",
    aliases: ["poeme", "poetry"],
    isOwnerOnly: false,
    isGroupOnly: false,
    isPremium: false,
    handler: requireAiKey("poem", "sujet"),
  },
  {
    name: "story",
    description: "Générer une histoire courte",
    category: "IA",
    usage: ".story [thème]",
    aliases: ["histoire", "conte"],
    isOwnerOnly: false,
    isGroupOnly: false,
    isPremium: false,
    handler: requireAiKey("story", "thème"),
  },
  {
    name: "recipe",
    description: "Obtenir une recette de cuisine",
    category: "IA",
    usage: ".recipe [plat]",
    aliases: ["recette", "cuisine"],
    isOwnerOnly: false,
    isGroupOnly: false,
    isPremium: false,
    handler: requireAiKey("recipe", "nom du plat"),
  },
  {
    name: "advice",
    description: "Demander un conseil à l'IA",
    category: "IA",
    usage: ".advice [problème]",
    aliases: ["conseil", "aide"],
    isOwnerOnly: false,
    isGroupOnly: false,
    isPremium: false,
    handler: requireAiKey("advice", "situation"),
  },
  {
    name: "roast",
    description: "Faire taquiner quelqu'un par l'IA (humour)",
    category: "IA",
    usage: ".roast [@mention]",
    aliases: ["taquiner"],
    isOwnerOnly: false,
    isGroupOnly: false,
    isPremium: false,
    handler: requireAiKey("roast", "@mention"),
  },
  {
    name: "compliment",
    description: "Générer un compliment",
    category: "IA",
    usage: ".compliment [@mention]",
    aliases: ["feliciter"],
    isOwnerOnly: false,
    isGroupOnly: false,
    isPremium: false,
    handler: requireAiKey("compliment", "@mention"),
  },
  {
    name: "explain",
    description: "Expliquer un concept simplement",
    category: "IA",
    usage: ".explain [concept]",
    aliases: ["expliquer", "definition"],
    isOwnerOnly: false,
    isGroupOnly: false,
    isPremium: false,
    handler: requireAiKey("explain", "concept"),
  },
  {
    name: "lyrics",
    description: "Trouver les paroles d'une chanson",
    category: "IA",
    usage: ".lyrics [chanson]",
    aliases: ["paroles"],
    isOwnerOnly: false,
    isGroupOnly: false,
    isPremium: false,
    handler: requireAiKey("lyrics", "titre de la chanson"),
  },
  {
    name: "detect",
    description: "Détecter la langue d'un texte",
    category: "IA",
    usage: ".detect [texte]",
    aliases: ["langue"],
    isOwnerOnly: false,
    isGroupOnly: false,
    isPremium: false,
    handler: requireAiKey("detect", "texte"),
  },
];
