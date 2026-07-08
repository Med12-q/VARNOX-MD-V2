/**
 * VARNOX-MD-V2 — WhatsApp Bot Connection Manager
 * Singleton class managing the Baileys WebSocket connection.
 */

import makeWASocket, {
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion,
  makeCacheableSignalKeyStore,
  proto,
  WAMessage,
  WASocket,
  BaileysEventMap,
} from "@whiskeysockets/baileys";
import { Boom } from "@hapi/boom";
import { join } from "node:path";
import { existsSync, mkdirSync } from "node:fs";
import { logger } from "../lib/logger.js";
import { db } from "../database/db.js";
import { handleMessage } from "./handler.js";

const SESSIONS_DIR = join(process.cwd(), "sessions", "auth_info_baileys");

export type BotState =
  | "disconnected"
  | "connecting"
  | "connected"
  | "pair_code_ready"
  | "qr_ready";

export interface BotStatusData {
  state: BotState;
  phone: string | null;
  name: string | null;
  uptime: number | null;
  connectedAt: string | null;
}

class BotManager {
  private static instance: BotManager;
  private sock: WASocket | null = null;
  private state: BotState = "disconnected";
  private phone: string | null = null;
  private botName: string | null = null;
  private connectedAt: Date | null = null;
  private pendingPairCode: string | null = null;
  private retryCount = 0;
  private maxRetries = 5;
  private reconnectTimer: NodeJS.Timeout | null = null;

  static getInstance(): BotManager {
    if (!BotManager.instance) {
      BotManager.instance = new BotManager();
    }
    return BotManager.instance;
  }

  private constructor() {
    if (!existsSync(SESSIONS_DIR)) {
      mkdirSync(SESSIONS_DIR, { recursive: true });
    }
  }

  getStatus(): BotStatusData {
    return {
      state: this.state,
      phone: this.phone,
      name: this.botName,
      uptime: this.connectedAt
        ? Math.floor((Date.now() - this.connectedAt.getTime()) / 1000)
        : null,
      connectedAt: this.connectedAt?.toISOString() ?? null,
    };
  }

  getSocket(): WASocket | null {
    return this.sock;
  }

  isConnected(): boolean {
    return this.state === "connected";
  }

  /**
   * Connect using a pair code (no QR scan needed).
   * Returns the 8-character pair code.
   */
  async connectWithPairCode(phone: string): Promise<string> {
    if (this.state === "connected") {
      throw new Error("Bot already connected");
    }

    // Clean up any existing connection
    if (this.sock) {
      await this.destroy();
    }

    this.state = "connecting";
    this.phone = phone;

    const { state, saveCreds } = await useMultiFileAuthState(SESSIONS_DIR);
    const { version } = await fetchLatestBaileysVersion();

    this.sock = makeWASocket({
      version,
      logger: logger.child({ module: "baileys" }) as any,
      auth: {
        creds: state.creds,
        keys: makeCacheableSignalKeyStore(state.keys, logger as any),
      },
      browser: ["VARNOX-MD-V2", "Chrome", "3.0.0"],
      printQRInTerminal: false,
      markOnlineOnConnect: db.getSettings().autoPresence,
      syncFullHistory: false,
      fireInitQueries: true,
      generateHighQualityLinkPreview: true,
    });

    // Request pair code after socket is ready
    if (!state.creds.registered) {
      await new Promise<void>((res) => setTimeout(res, 3000));
      try {
        const cleanPhone = phone.replace(/[^0-9]/g, "");
        const code = await this.sock!.requestPairingCode(cleanPhone);
        this.pendingPairCode = code;
        this.state = "pair_code_ready";
        logger.info({ code }, "Pair code generated");
        db.addActivity({
          type: "message",
          description: `Code de liaison généré pour ${phone}`,
          user: phone,
          group: null,
        });
      } catch (err) {
        logger.error({ err }, "Failed to get pair code");
        this.state = "disconnected";
        throw new Error("Impossible de générer le code de liaison");
      }
    }

    this.setupEventHandlers(saveCreds);

    return this.pendingPairCode ?? "";
  }

  private setupEventHandlers(saveCreds: () => Promise<void>): void {
    if (!this.sock) return;

    this.sock.ev.on("creds.update", saveCreds);

    this.sock.ev.on("connection.update", async (update) => {
      const { connection, lastDisconnect, qr } = update;

      if (qr) {
        this.state = "qr_ready";
        logger.info("QR code ready");
      }

      if (connection === "open") {
        this.state = "connected";
        this.retryCount = 0;
        this.connectedAt = new Date();
        const botJid = this.sock?.user?.id ?? null;
        this.phone = botJid ? botJid.split(":")[0] ?? botJid.split("@")[0] : this.phone;
        this.botName = this.sock?.user?.name ?? "VARNOX-MD-V2";
        logger.info({ phone: this.phone, name: this.botName }, "Bot connected to WhatsApp");
        db.addActivity({
          type: "join",
          description: `Bot connecté: ${this.botName} (${this.phone})`,
          user: this.phone,
          group: null,
        });
        // Update bot user in DB as owner
        if (this.phone) {
          db.updateUser(`${this.phone}@s.whatsapp.net`, {
            role: "owner",
            name: this.botName ?? undefined,
          });
        }
      }

      if (connection === "close") {
        const boom = lastDisconnect?.error as Boom | undefined;
        const reason = boom?.output?.statusCode;
        logger.warn({ reason }, "WhatsApp connection closed");

        this.state = "disconnected";
        this.connectedAt = null;

        const shouldReconnect =
          reason !== DisconnectReason.loggedOut &&
          reason !== DisconnectReason.badSession &&
          this.retryCount < this.maxRetries;

        if (shouldReconnect) {
          this.retryCount++;
          const delay = Math.min(5000 * this.retryCount, 30000);
          logger.info({ attempt: this.retryCount, delay }, "Reconnecting...");
          db.addActivity({
            type: "error",
            description: `Reconnexion en cours (tentative ${this.retryCount})`,
            user: null,
            group: null,
          });
          this.reconnectTimer = setTimeout(async () => {
            if (this.phone) {
              try {
                await this.connectWithPairCode(this.phone);
              } catch (err) {
                logger.error({ err }, "Reconnection failed");
              }
            }
          }, delay);
        } else if (reason === DisconnectReason.loggedOut) {
          logger.warn("Bot was logged out. Session cleared.");
          db.addActivity({
            type: "error",
            description: "Bot déconnecté — session expirée",
            user: null,
            group: null,
          });
          await this.clearSession();
        }
      }
    });

    this.sock.ev.on("messages.upsert", async ({ messages, type }) => {
      if (type !== "notify") return;
      for (const msg of messages) {
        try {
          db.incrementMessages();
          await handleMessage(this.sock!, msg);
        } catch (err) {
          logger.error({ err }, "Error handling message");
        }
      }
    });

    this.sock.ev.on("group-participants.update", async ({ id, participants, action }) => {
      const group = db.getGroup(id);
      const settings = db.getSettings();

      if (action === "add" && group.welcome) {
        for (const participant of participants) {
          const jid = typeof participant === "string" ? participant : participant.id;
          const user = db.getUser(jid);
          const name = user.name ?? jid.split("@")[0];
          const welcomeMsg =
            group.welcomeMsg ??
            `@${jid.split("@")[0]} bienvenue dans le groupe ! Soyez respectueux.`;
          await this.sock?.sendMessage(id, {
            text: welcomeMsg,
            mentions: [jid],
          });
        }
      }

      if (action === "remove" && group.goodbye) {
        for (const participant of participants) {
          const jid = typeof participant === "string" ? participant : participant.id;
          const name = jid.split("@")[0];
          const goodbyeMsg =
            group.goodbyeMsg ?? `Au revoir @${name}, bon courage !`;
          await this.sock?.sendMessage(id, {
            text: goodbyeMsg,
            mentions: [jid],
          });
        }
      }
    });

    this.sock.ev.on("groups.update", async (updates) => {
      for (const update of updates) {
        if (update.id) {
          db.updateGroup(update.id, {
            name: update.subject ?? undefined,
          });
        }
      }
    });
  }

  async disconnect(): Promise<void> {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.sock) {
      await this.sock.logout();
      await this.destroy();
    }
    this.state = "disconnected";
    this.connectedAt = null;
    db.addActivity({
      type: "message",
      description: "Bot déconnecté manuellement",
      user: null,
      group: null,
    });
    logger.info("Bot disconnected by user");
  }

  async restart(): Promise<void> {
    logger.info("Restarting bot...");
    db.addActivity({
      type: "message",
      description: "Redémarrage du bot...",
      user: null,
      group: null,
    });
    const savedPhone = this.phone;
    await this.destroy();
    this.state = "disconnected";
    this.retryCount = 0;
    if (savedPhone) {
      setTimeout(async () => {
        try {
          await this.connectWithPairCode(savedPhone);
        } catch (err) {
          logger.error({ err }, "Restart failed");
        }
      }, 2000);
    }
  }

  private async destroy(): Promise<void> {
    if (this.sock) {
      try {
        this.sock.end(new Error("Bot destroyed"));
      } catch (_) {}
      this.sock = null;
    }
  }

  private async clearSession(): Promise<void> {
    const { rm } = await import("node:fs/promises");
    try {
      await rm(SESSIONS_DIR, { recursive: true, force: true });
      mkdirSync(SESSIONS_DIR, { recursive: true });
    } catch (err) {
      logger.error({ err }, "Failed to clear session");
    }
  }

  /**
   * Try to restore a saved session on startup.
   */
  async tryRestoreSession(): Promise<void> {
    if (!existsSync(join(SESSIONS_DIR, "creds.json"))) return;
    logger.info("Restoring saved WhatsApp session...");
    try {
      const { state, saveCreds } = await useMultiFileAuthState(SESSIONS_DIR);
      const { version } = await fetchLatestBaileysVersion();

      this.state = "connecting";
      this.sock = makeWASocket({
        version,
        logger: logger.child({ module: "baileys" }) as any,
        auth: {
          creds: state.creds,
          keys: makeCacheableSignalKeyStore(state.keys, logger as any),
        },
        browser: ["VARNOX-MD-V2", "Chrome", "3.0.0"],
        printQRInTerminal: false,
        markOnlineOnConnect: db.getSettings().autoPresence,
        syncFullHistory: false,
      });

      this.setupEventHandlers(saveCreds);
    } catch (err) {
      logger.error({ err }, "Failed to restore session");
      this.state = "disconnected";
    }
  }
}

export const botManager = BotManager.getInstance();
