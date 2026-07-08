/**
 * VARNOX-MD-V2 — Command Registry
 * Central registry for all 200+ bot commands organized by category.
 */

import { WASocket, WAMessage } from "@whiskeysockets/baileys";
import { logger } from "../lib/logger.js";

export interface CommandContext {
  sock: WASocket;
  msg: WAMessage;
  from: string;
  senderJid: string;
  args: string[];
  isGroup: boolean;
}

export interface Command {
  name: string;
  description: string;
  category: string;
  usage: string;
  aliases: string[];
  isOwnerOnly: boolean;
  isGroupOnly: boolean;
  isPremium: boolean;
  usageCount: number;
  handler: (ctx: CommandContext) => Promise<void>;
}

export const commandRegistry = new Map<string, Command>();

function register(cmd: Omit<Command, "usageCount">): void {
  commandRegistry.set(cmd.name, { ...cmd, usageCount: 0 });
}

// ─── Lazy-load all command modules ─────────────────────────────────────────
// This is done asynchronously at startup
export async function loadCommands(): Promise<void> {
  const [generalCmds, groupCmds, downloadCmds, aiCmds, toolsCmds, funCmds, adminCmds, economyCmds] =
    await Promise.all([
      import("./general.js"),
      import("./group.js"),
      import("./download.js"),
      import("./ai.js"),
      import("./tools.js"),
      import("./fun.js"),
      import("./admin.js"),
      import("./economy.js"),
    ]);

  // Register all commands
  [
    ...generalCmds.commands,
    ...groupCmds.commands,
    ...downloadCmds.commands,
    ...aiCmds.commands,
    ...toolsCmds.commands,
    ...funCmds.commands,
    ...adminCmds.commands,
    ...economyCmds.commands,
  ].forEach((cmd) => {
    commandRegistry.set(cmd.name, { ...cmd, usageCount: 0 });
  });

  logger.info({ count: commandRegistry.size }, "Commands loaded");
}

/**
 * Get all commands as an array, optionally filtered by category.
 */
export function getCommandList(category?: string): Command[] {
  const cmds = [...commandRegistry.values()];
  if (category) {
    return cmds.filter((c) => c.category.toLowerCase() === category.toLowerCase());
  }
  return cmds;
}
