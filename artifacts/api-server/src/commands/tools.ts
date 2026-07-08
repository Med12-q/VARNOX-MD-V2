/**
 * VARNOX-MD-V2 — Tools Commands
 */

import { Command } from "./index.js";
import { db } from "../database/db.js";

export const commands: Omit<Command, "usageCount">[] = [
  {
    name: "qr",
    description: "Générer un QR code",
    category: "Outils",
    usage: ".qr [texte/url]",
    aliases: ["qrcode"],
    isOwnerOnly: false,
    isGroupOnly: false,
    isPremium: false,
    handler: async ({ sock, from, args }) => {
      const text = args.join(" ");
      if (!text) {
        await sock.sendMessage(from, { text: "❌ Veuillez fournir un texte ou URL." });
        return;
      }
      try {
        const QRCode = await import("qrcode");
        const qrBuffer = await QRCode.default.toBuffer(text, {
          errorCorrectionLevel: "H",
          width: 512,
        });
        await sock.sendMessage(from, {
          image: qrBuffer,
          caption: `📱 *QR Code généré pour:*\n${text}`,
        });
      } catch (err) {
        await sock.sendMessage(from, { text: "❌ Erreur lors de la génération du QR code." });
      }
    },
  },
  {
    name: "sticker",
    description: "Convertir une image en sticker",
    category: "Outils",
    usage: ".sticker [image jointe]",
    aliases: ["stk", "autocollant"],
    isOwnerOnly: false,
    isGroupOnly: false,
    isPremium: false,
    handler: async ({ sock, from, msg }) => {
      const image =
        msg.message?.imageMessage ||
        msg.message?.extendedTextMessage?.contextInfo?.quotedMessage?.imageMessage;
      if (!image) {
        await sock.sendMessage(from, { text: "❌ Envoyez ou citez une image avec cette commande." });
        return;
      }
      await sock.sendMessage(from, { text: "⚙️ Conversion en sticker... (nécessite ffmpeg/sharp)" });
    },
  },
  {
    name: "toimg",
    description: "Convertir un sticker en image",
    category: "Outils",
    usage: ".toimg [sticker joint]",
    aliases: ["stickertoimg", "toimage"],
    isOwnerOnly: false,
    isGroupOnly: false,
    isPremium: false,
    handler: async ({ sock, from }) => {
      await sock.sendMessage(from, { text: "⚙️ Fonctionnalité en cours de développement." });
    },
  },
  {
    name: "base64",
    description: "Encoder du texte en Base64",
    category: "Outils",
    usage: ".base64 [texte]",
    aliases: ["b64encode", "encode64"],
    isOwnerOnly: false,
    isGroupOnly: false,
    isPremium: false,
    handler: async ({ sock, from, args }) => {
      const text = args.join(" ");
      if (!text) {
        await sock.sendMessage(from, { text: "❌ Veuillez fournir un texte." });
        return;
      }
      const encoded = Buffer.from(text).toString("base64");
      await sock.sendMessage(from, { text: `🔒 *Texte encodé en Base64:*\n\n${encoded}` });
    },
  },
  {
    name: "debase64",
    description: "Décoder du Base64",
    category: "Outils",
    usage: ".debase64 [code]",
    aliases: ["b64decode", "decode64"],
    isOwnerOnly: false,
    isGroupOnly: false,
    isPremium: false,
    handler: async ({ sock, from, args }) => {
      const code = args.join(" ");
      if (!code) {
        await sock.sendMessage(from, { text: "❌ Veuillez fournir un code Base64." });
        return;
      }
      try {
        const decoded = Buffer.from(code, "base64").toString("utf-8");
        await sock.sendMessage(from, { text: `🔓 *Texte décodé:*\n\n${decoded}` });
      } catch {
        await sock.sendMessage(from, { text: "❌ Code Base64 invalide." });
      }
    },
  },
  {
    name: "weather",
    description: "Obtenir la météo d'une ville",
    category: "Outils",
    usage: ".weather [ville]",
    aliases: ["meteo"],
    isOwnerOnly: false,
    isGroupOnly: false,
    isPremium: false,
    handler: async ({ sock, from, args }) => {
      const city = args.join(" ");
      if (!city) {
        await sock.sendMessage(from, { text: "❌ Veuillez spécifier une ville." });
        return;
      }
      if (!process.env["WEATHER_API_KEY"]) {
        await sock.sendMessage(from, {
          text: "⚙️ Météo: configurez WEATHER_API_KEY (OpenWeatherMap) pour activer cette fonctionnalité.",
        });
        return;
      }
      await sock.sendMessage(from, { text: `⏳ Récupération de la météo pour ${city}...` });
    },
  },
  {
    name: "ipinfo",
    description: "Obtenir des informations sur une adresse IP",
    category: "Outils",
    usage: ".ipinfo [ip]",
    aliases: ["ip"],
    isOwnerOnly: false,
    isGroupOnly: false,
    isPremium: false,
    handler: async ({ sock, from, args }) => {
      const ip = args[0];
      if (!ip) {
        await sock.sendMessage(from, { text: "❌ Veuillez fournir une adresse IP." });
        return;
      }
      try {
        const { default: axios } = await import("axios");
        const res = await axios.get(`http://ip-api.com/json/${ip}`);
        const d = res.data as Record<string, string>;
        await sock.sendMessage(from, {
          text:
            `🌍 *Info IP: ${ip}*\n\n` +
            `📍 Pays: ${d["country"] ?? "N/A"}\n` +
            `🏙️ Ville: ${d["city"] ?? "N/A"}\n` +
            `📡 FAI: ${d["isp"] ?? "N/A"}\n` +
            `🗺️ Région: ${d["regionName"] ?? "N/A"}`,
        });
      } catch {
        await sock.sendMessage(from, { text: "❌ Impossible de récupérer les informations." });
      }
    },
  },
  {
    name: "calculator",
    description: "Calculatrice avancée",
    category: "Outils",
    usage: ".calculator [expression]",
    aliases: ["calc", "calcul"],
    isOwnerOnly: false,
    isGroupOnly: false,
    isPremium: false,
    handler: async ({ sock, from, args }) => {
      const expr = args.join(" ").replace(/[^0-9+\-*/().\s^%]/g, "");
      if (!expr) {
        await sock.sendMessage(from, { text: "❌ Veuillez fournir une expression mathématique." });
        return;
      }
      try {
        // Safe evaluation of math expressions
        const result = Function(`"use strict"; return (${expr})`)();
        await sock.sendMessage(from, {
          text: `🧮 *Calculatrice*\n\n${expr} = *${result}*`,
        });
      } catch {
        await sock.sendMessage(from, { text: "❌ Expression invalide." });
      }
    },
  },
  {
    name: "password",
    description: "Générer un mot de passe sécurisé",
    category: "Outils",
    usage: ".password [longueur]",
    aliases: ["mdp", "passgen"],
    isOwnerOnly: false,
    isGroupOnly: false,
    isPremium: false,
    handler: async ({ sock, from, args }) => {
      const length = Math.min(parseInt(args[0] ?? "16") || 16, 64);
      const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()";
      let password = "";
      for (let i = 0; i < length; i++) {
        password += chars[Math.floor(Math.random() * chars.length)];
      }
      await sock.sendMessage(from, {
        text: `🔐 *Mot de passe généré (${length} caractères):*\n\n\`${password}\`\n\n⚠️ Ne partagez jamais ce message!`,
      });
    },
  },
  {
    name: "hash",
    description: "Générer le hash d'un texte",
    category: "Outils",
    usage: ".hash [texte]",
    aliases: ["md5", "sha256"],
    isOwnerOnly: false,
    isGroupOnly: false,
    isPremium: false,
    handler: async ({ sock, from, args }) => {
      const text = args.join(" ");
      if (!text) {
        await sock.sendMessage(from, { text: "❌ Veuillez fournir un texte." });
        return;
      }
      const { createHash } = await import("node:crypto");
      const md5 = createHash("md5").update(text).digest("hex");
      const sha256 = createHash("sha256").update(text).digest("hex");
      await sock.sendMessage(from, {
        text: `🔑 *Hash du texte*\n\n🔸 MD5:\n${md5}\n\n🔹 SHA256:\n${sha256}`,
      });
    },
  },
  {
    name: "color",
    description: "Obtenir des infos sur une couleur",
    category: "Outils",
    usage: ".color [#hex ou nom]",
    aliases: ["couleur"],
    isOwnerOnly: false,
    isGroupOnly: false,
    isPremium: false,
    handler: async ({ sock, from, args }) => {
      const input = args[0] ?? "";
      if (!input) {
        await sock.sendMessage(from, { text: "❌ Veuillez fournir une couleur (ex: #FF5733 ou red)." });
        return;
      }
      const colors: Record<string, string> = {
        red: "#FF0000", green: "#00FF00", blue: "#0000FF",
        white: "#FFFFFF", black: "#000000", yellow: "#FFFF00",
        orange: "#FFA500", purple: "#800080", pink: "#FFC0CB",
      };
      const hex = input.startsWith("#") ? input : colors[input.toLowerCase()];
      if (!hex) {
        await sock.sendMessage(from, { text: `❌ Couleur "${input}" non trouvée.` });
        return;
      }
      const rgb = parseInt(hex.slice(1), 16);
      const r = (rgb >> 16) & 0xff;
      const g = (rgb >> 8) & 0xff;
      const b = rgb & 0xff;
      await sock.sendMessage(from, {
        text: `🎨 *Couleur: ${hex}*\n\nRGB: rgb(${r}, ${g}, ${b})\nHEX: ${hex.toUpperCase()}`,
      });
    },
  },
  {
    name: "tts",
    description: "Convertir du texte en voix",
    category: "Outils",
    usage: ".tts [texte]",
    aliases: ["speak", "voice"],
    isOwnerOnly: false,
    isGroupOnly: false,
    isPremium: false,
    handler: async ({ sock, from, args }) => {
      if (!args.length) {
        await sock.sendMessage(from, { text: "❌ Veuillez fournir du texte." });
        return;
      }
      await sock.sendMessage(from, {
        text: "⚙️ TTS: configurez TTS_API_KEY pour activer cette fonctionnalité.",
      });
    },
  },
  {
    name: "ocr",
    description: "Extraire le texte d'une image",
    category: "Outils",
    usage: ".ocr [image jointe]",
    aliases: ["textimage", "extracttext"],
    isOwnerOnly: false,
    isGroupOnly: false,
    isPremium: false,
    handler: async ({ sock, from }) => {
      await sock.sendMessage(from, {
        text: "⚙️ OCR: configurez OCR_API_KEY pour activer cette fonctionnalité.",
      });
    },
  },
  {
    name: "shorturl",
    description: "Raccourcir un lien",
    category: "Outils",
    usage: ".shorturl [url]",
    aliases: ["shorten", "short"],
    isOwnerOnly: false,
    isGroupOnly: false,
    isPremium: false,
    handler: async ({ sock, from, args }) => {
      const url = args[0];
      if (!url) {
        await sock.sendMessage(from, { text: "❌ Veuillez fournir une URL." });
        return;
      }
      try {
        const { default: axios } = await import("axios");
        const res = await axios.get(`https://tinyurl.com/api-create.php?url=${encodeURIComponent(url)}`);
        await sock.sendMessage(from, {
          text: `🔗 *URL raccourcie:*\n\nOriginal: ${url}\nCourt: ${res.data}`,
        });
      } catch {
        await sock.sendMessage(from, { text: "❌ Impossible de raccourcir ce lien." });
      }
    },
  },
  {
    name: "tourl",
    description: "Uploader une image et obtenir son URL",
    category: "Outils",
    usage: ".tourl [image jointe]",
    aliases: ["imgurl", "upload"],
    isOwnerOnly: false,
    isGroupOnly: false,
    isPremium: false,
    handler: async ({ sock, from }) => {
      await sock.sendMessage(from, { text: "⚙️ Fonctionnalité en cours de développement." });
    },
  },
  {
    name: "fakeinfo",
    description: "Générer de fausses informations (pour tests)",
    category: "Outils",
    usage: ".fakeinfo",
    aliases: ["fake", "fakedata"],
    isOwnerOnly: false,
    isGroupOnly: false,
    isPremium: false,
    handler: async ({ sock, from }) => {
      const firstNames = ["Ahmed", "Mohamed", "Sara", "Fatima", "Youssef", "Amine", "Nour"];
      const lastNames = ["Benali", "Alaoui", "El Fassi", "Tahiri", "Mansouri"];
      const cities = ["Casablanca", "Rabat", "Fès", "Marrakech", "Agadir", "Tanger"];
      const fn = firstNames[Math.floor(Math.random() * firstNames.length)]!;
      const ln = lastNames[Math.floor(Math.random() * lastNames.length)]!;
      const city = cities[Math.floor(Math.random() * cities.length)]!;
      const age = Math.floor(Math.random() * 40) + 18;
      const phone = `+212 6${Math.floor(Math.random() * 90000000) + 10000000}`;
      await sock.sendMessage(from, {
        text:
          `🎭 *Informations Fictives (test uniquement)*\n\n` +
          `👤 Nom: ${fn} ${ln}\n` +
          `🎂 Âge: ${age} ans\n` +
          `📍 Ville: ${city}\n` +
          `📱 Téléphone: ${phone}\n` +
          `📧 Email: ${fn.toLowerCase()}.${ln.toLowerCase().replace(" ", "")}@email.com`,
      });
    },
  },
  {
    name: "convert",
    description: "Convertir des unités",
    category: "Outils",
    usage: ".convert [valeur] [unité_de] [unité_vers]",
    aliases: ["convertion", "units"],
    isOwnerOnly: false,
    isGroupOnly: false,
    isPremium: false,
    handler: async ({ sock, from, args }) => {
      if (args.length < 3) {
        await sock.sendMessage(from, {
          text: "❌ Usage: .convert [valeur] [de] [vers]\nEx: .convert 100 km miles\nEx: .convert 20 celsius fahrenheit",
        });
        return;
      }
      const value = parseFloat(args[0] ?? "0");
      const from_unit = args[1]?.toLowerCase();
      const to_unit = args[2]?.toLowerCase();
      const conversions: Record<string, Record<string, number>> = {
        km: { miles: 0.621371, m: 1000 },
        miles: { km: 1.60934, m: 1609.34 },
        kg: { lbs: 2.20462, g: 1000 },
        lbs: { kg: 0.453592 },
        celsius: { fahrenheit: 9 / 5, kelvin: 1 },
        m: { ft: 3.28084, cm: 100, km: 0.001 },
        ft: { m: 0.3048, cm: 30.48 },
      };
      if (!from_unit || !to_unit || !conversions[from_unit]?.[to_unit]) {
        await sock.sendMessage(from, { text: "❌ Conversion non supportée. Essayez: km, miles, kg, lbs, celsius, fahrenheit, m, ft" });
        return;
      }
      let result = value * (conversions[from_unit]![to_unit] ?? 1);
      if (from_unit === "celsius" && to_unit === "fahrenheit") result = value * 9 / 5 + 32;
      if (from_unit === "celsius" && to_unit === "kelvin") result = value + 273.15;
      await sock.sendMessage(from, {
        text: `🔄 *Conversion*\n\n${value} ${from_unit} = *${result.toFixed(2)} ${to_unit}*`,
      });
    },
  },
  {
    name: "timer",
    description: "Démarrer un minuteur",
    category: "Outils",
    usage: ".timer [secondes]",
    aliases: ["minuteur", "countdown"],
    isOwnerOnly: false,
    isGroupOnly: false,
    isPremium: false,
    handler: async ({ sock, from, args }) => {
      const seconds = parseInt(args[0] ?? "60");
      if (!seconds || seconds <= 0 || seconds > 3600) {
        await sock.sendMessage(from, { text: "❌ Durée invalide (max 3600 secondes)." });
        return;
      }
      await sock.sendMessage(from, { text: `⏱️ Minuteur de ${seconds} secondes démarré!` });
      setTimeout(async () => {
        await sock.sendMessage(from, {
          text: `⏰ *Minuteur terminé!*\n${seconds} secondes écoulées.`,
        });
      }, seconds * 1000);
    },
  },
];
