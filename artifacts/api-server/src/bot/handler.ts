/**
 * VARNOX-MD-V2 — Message Handler
 * Processes incoming WhatsApp messages and dispatches to command handlers.
 */

import { WASocket, WAMessage, proto } from "@whiskeysockets/baileys";
import { logger } from "../lib/logger.js";
import { db } from "../database/db.js";
import { commandRegistry } from "../commands/index.js";
import { jidToPhone } from "../utils/format.js";

// Anti-spam: track last command time per user
const spamMap = new Map<string, number>();
const SPAM_COOLDOWN = 2000; // 2 seconds between commands

/**
 * Extract text content from a WAMessage
 */
function getMessageText(msg: WAMessage): string | null {
  const m = msg.message;
  if (!m) return null;
  return (
    m.conversation ||
    m.extendedTextMessage?.text ||
    m.imageMessage?.caption ||
    m.videoMessage?.caption ||
    m.documentMessage?.caption ||
    null
  );
}

/**
 * Check if message is from a group
 */
function isGroup(jid: string): boolean {
  return jid.endsWith("@g.us");
}

/**
 * Main message handler
 */
export async function handleMessage(sock: WASocket, msg: WAMessage): Promise<void> {
  // Ignore messages from self
  if (msg.key.fromMe) return;
  // Ignore status updates
  if (msg.key.remoteJid === "status@broadcast") return;

  const text = getMessageText(msg);
  if (!text) return;

  const from = msg.key.remoteJid!;
  const senderJid = isGroup(from)
    ? (msg.key.participant ?? msg.key.remoteJid!)
    : from;

  const settings = db.getSettings();
  const prefix = settings.prefix;

  // Only process commands that start with the prefix
  if (!text.startsWith(prefix)) return;

  const args = text.slice(prefix.length).trim().split(/\s+/);
  const commandName = args.shift()?.toLowerCase() ?? "";
  if (!commandName) return;

  // Anti-spam check
  const now = Date.now();
  const lastCmd = spamMap.get(senderJid) ?? 0;
  if (now - lastCmd < SPAM_COOLDOWN) {
    return; // silently ignore spam
  }
  spamMap.set(senderJid, now);

  // Get or create user
  const user = db.getUser(senderJid);
  if (user.banned) return; // Banned users are silently ignored

  // Find the command
  const command =
    commandRegistry.get(commandName) ??
    commandRegistry.get(
      [...commandRegistry.entries()].find(([, cmd]) =>
        cmd.aliases.includes(commandName)
      )?.[0] ?? ""
    );

  if (!command) return;

  // Check mode (public/private)
  if (settings.mode === "private" && !db.isOwner(senderJid)) {
    return;
  }

  // Check owner-only commands
  if (command.isOwnerOnly && !db.isOwner(senderJid)) {
    await sock.sendMessage(from, {
      text: "❌ Cette commande est réservée au propriétaire du bot.",
    });
    return;
  }

  // Check group-only commands
  if (command.isGroupOnly && !isGroup(from)) {
    await sock.sendMessage(from, {
      text: "❌ Cette commande ne peut être utilisée que dans un groupe.",
    });
    return;
  }

  // Check premium commands
  if (command.isPremium && !db.isPremium(senderJid)) {
    await sock.sendMessage(from, {
      text: "⭐ Cette commande est réservée aux utilisateurs Premium.\nContactez le propriétaire pour upgrader.",
    });
    return;
  }

  // Execute command
  try {
    logger.info({ cmd: commandName, from, sender: senderJid }, "Command executed");
    db.incrementCommands();
    db.updateUser(senderJid, { commandCount: (user.commandCount ?? 0) + 1 });
    db.addActivity({
      type: "command",
      description: `${prefix}${commandName} exécuté`,
      user: jidToPhone(senderJid),
      group: isGroup(from) ? from : null,
    });
    // Add EXP for using commands
    const expGain = 10 + Math.floor(Math.random() * 5);
    const newExp = (user.exp ?? 0) + expGain;
    const newLevel = Math.floor(Math.sqrt(newExp / 100)) + 1;
    db.updateUser(senderJid, { exp: newExp, level: newLevel });

    await command.handler({ sock, msg, from, senderJid, args, isGroup: isGroup(from) });
  } catch (err) {
    logger.error({ err, cmd: commandName }, "Command handler error");
    db.addActivity({
      type: "error",
      description: `Erreur lors de ${prefix}${commandName}: ${String(err)}`,
      user: jidToPhone(senderJid),
      group: isGroup(from) ? from : null,
    });
    await sock.sendMessage(from, {
      text: `❌ Une erreur s'est produite lors de l'exécution de la commande.\n${String(err)}`,
    });
  }
}
