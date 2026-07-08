/**
 * VARNOX-MD-V2 — Download Commands
 * These commands require external API configuration.
 */

import { Command } from "./index.js";

function notImplemented(name: string) {
  return async ({ sock, from }: { sock: any; from: string }) => {
    await sock.sendMessage(from, {
      text:
        `⚙️ *Commande ${name}*\n\n` +
        `Cette fonctionnalité nécessite une clé API.\n` +
        `Configurez \`${name.toUpperCase()}_API_KEY\` dans votre fichier .env`,
    });
  };
}

export const commands: Omit<Command, "usageCount">[] = [
  {
    name: "tiktok",
    description: "Télécharger une vidéo TikTok sans filigrane",
    category: "Téléchargement",
    usage: ".tiktok [url]",
    aliases: ["tt", "tik"],
    isOwnerOnly: false,
    isGroupOnly: false,
    isPremium: false,
    handler: async ({ sock, from, args }) => {
      const url = args[0];
      if (!url) {
        await sock.sendMessage(from, { text: "❌ Veuillez fournir un lien TikTok." });
        return;
      }
      if (!process.env["DOWNLOAD_API_KEY"]) {
        await sock.sendMessage(from, {
          text: "⚙️ Clé API de téléchargement non configurée. Contactez l'administrateur.",
        });
        return;
      }
      await sock.sendMessage(from, { text: "⏳ Téléchargement en cours..." });
      // Implementation requires DOWNLOAD_API_KEY
      await sock.sendMessage(from, { text: "❌ Service temporairement indisponible." });
    },
  },
  {
    name: "igdl",
    description: "Télécharger une vidéo Instagram",
    category: "Téléchargement",
    usage: ".igdl [url]",
    aliases: ["instagram", "ig"],
    isOwnerOnly: false,
    isGroupOnly: false,
    isPremium: false,
    handler: notImplemented("igdl"),
  },
  {
    name: "fbdl",
    description: "Télécharger une vidéo Facebook",
    category: "Téléchargement",
    usage: ".fbdl [url]",
    aliases: ["facebook", "fb"],
    isOwnerOnly: false,
    isGroupOnly: false,
    isPremium: false,
    handler: notImplemented("fbdl"),
  },
  {
    name: "ytmp3",
    description: "Télécharger l'audio d'une vidéo YouTube",
    category: "Téléchargement",
    usage: ".ytmp3 [url/recherche]",
    aliases: ["yt", "youtube", "mp3"],
    isOwnerOnly: false,
    isGroupOnly: false,
    isPremium: false,
    handler: notImplemented("ytmp3"),
  },
  {
    name: "ytmp4",
    description: "Télécharger une vidéo YouTube",
    category: "Téléchargement",
    usage: ".ytmp4 [url/recherche]",
    aliases: ["ytvideo", "mp4"],
    isOwnerOnly: false,
    isGroupOnly: false,
    isPremium: false,
    handler: notImplemented("ytmp4"),
  },
  {
    name: "spotify",
    description: "Télécharger une chanson Spotify",
    category: "Téléchargement",
    usage: ".spotify [url/nom]",
    aliases: ["spot", "spdl"],
    isOwnerOnly: false,
    isGroupOnly: false,
    isPremium: false,
    handler: notImplemented("spotify"),
  },
  {
    name: "twitter",
    description: "Télécharger une vidéo Twitter/X",
    category: "Téléchargement",
    usage: ".twitter [url]",
    aliases: ["x", "xdl", "tweet"],
    isOwnerOnly: false,
    isGroupOnly: false,
    isPremium: false,
    handler: notImplemented("twitter"),
  },
  {
    name: "pinterest",
    description: "Télécharger une image Pinterest",
    category: "Téléchargement",
    usage: ".pinterest [url]",
    aliases: ["pin", "pintdl"],
    isOwnerOnly: false,
    isGroupOnly: false,
    isPremium: false,
    handler: notImplemented("pinterest"),
  },
  {
    name: "mediafire",
    description: "Télécharger un fichier MediaFire",
    category: "Téléchargement",
    usage: ".mediafire [url]",
    aliases: ["mf"],
    isOwnerOnly: false,
    isGroupOnly: false,
    isPremium: false,
    handler: notImplemented("mediafire"),
  },
  {
    name: "capcut",
    description: "Télécharger une vidéo CapCut",
    category: "Téléchargement",
    usage: ".capcut [url]",
    aliases: ["cap"],
    isOwnerOnly: false,
    isGroupOnly: false,
    isPremium: false,
    handler: notImplemented("capcut"),
  },
  {
    name: "gdrive",
    description: "Télécharger depuis Google Drive",
    category: "Téléchargement",
    usage: ".gdrive [url]",
    aliases: ["drive"],
    isOwnerOnly: false,
    isGroupOnly: false,
    isPremium: false,
    handler: notImplemented("gdrive"),
  },
  {
    name: "search",
    description: "Rechercher sur le web",
    category: "Téléchargement",
    usage: ".search [requête]",
    aliases: ["google", "recherche"],
    isOwnerOnly: false,
    isGroupOnly: false,
    isPremium: false,
    handler: notImplemented("search"),
  },
  {
    name: "image",
    description: "Rechercher des images",
    category: "Téléchargement",
    usage: ".image [requête]",
    aliases: ["img", "photo"],
    isOwnerOnly: false,
    isGroupOnly: false,
    isPremium: false,
    handler: notImplemented("image"),
  },
  {
    name: "music",
    description: "Rechercher et télécharger de la musique",
    category: "Téléchargement",
    usage: ".music [nom]",
    aliases: ["musique", "song"],
    isOwnerOnly: false,
    isGroupOnly: false,
    isPremium: false,
    handler: notImplemented("music"),
  },
  {
    name: "anime",
    description: "Télécharger du contenu anime",
    category: "Téléchargement",
    usage: ".anime [url]",
    aliases: [],
    isOwnerOnly: false,
    isGroupOnly: false,
    isPremium: false,
    handler: notImplemented("anime"),
  },
];
