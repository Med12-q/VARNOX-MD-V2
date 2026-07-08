/**
 * VARNOX-MD-V2 — JSON File Database
 * Manages persistent storage for users, groups, settings, and activity logs.
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { logger } from "../lib/logger.js";

const DB_DIR = join(process.cwd(), "database");
const USERS_FILE = join(DB_DIR, "users.json");
const GROUPS_FILE = join(DB_DIR, "groups.json");
const SETTINGS_FILE = join(DB_DIR, "settings.json");
const STATS_FILE = join(DB_DIR, "stats.json");

export interface BotUser {
  jid: string;
  name: string | null;
  role: "owner" | "superadmin" | "admin" | "premium" | "user";
  commandCount: number;
  warns: number;
  isPremium: boolean;
  joinedAt: string;
  level: number;
  exp: number;
  coins: number;
  banned?: boolean;
  lastDaily?: string;
  lastWeekly?: string;
  afk?: string | null;
  register?: boolean;
  regname?: string;
  regage?: number;
}

export interface BotGroup {
  jid: string;
  name: string;
  memberCount: number;
  isAdmin: boolean;
  antilink: boolean;
  welcome: boolean;
  goodbye: boolean;
  muted: boolean;
  antibot: boolean;
  antibadword: boolean;
  antispam: boolean;
  nsfw: boolean;
  welcomeMsg?: string;
  goodbyeMsg?: string;
  rules?: string;
  joinedAt: string;
}

export interface BotSettings {
  prefix: string;
  ownerNumber: string;
  botName: string;
  botVersion: string;
  mode: "public" | "private";
  language: string;
  timezone: string;
  autoRead: boolean;
  autoPresence: boolean;
}

export interface BotStats {
  commandsUsed: number;
  messagesHandled: number;
  startTime: string;
  restarts: number;
}

export interface ActivityItem {
  id: string;
  type: "command" | "join" | "leave" | "error" | "message";
  description: string;
  timestamp: string;
  user: string | null;
  group: string | null;
}

const DEFAULT_SETTINGS: BotSettings = {
  prefix: ".",
  ownerNumber: process.env["OWNER_NUMBER"] ?? "0",
  botName: "VARNOX-MD-V2",
  botVersion: "2.0.0",
  mode: "public",
  language: "fr",
  timezone: "Africa/Casablanca",
  autoRead: false,
  autoPresence: true,
};

const DEFAULT_STATS: BotStats = {
  commandsUsed: 0,
  messagesHandled: 0,
  startTime: new Date().toISOString(),
  restarts: 0,
};

// In-memory activity log (circular buffer)
const activityLog: ActivityItem[] = [];
const MAX_ACTIVITY = 100;

class Database {
  private users: Map<string, BotUser> = new Map();
  private groups: Map<string, BotGroup> = new Map();
  private settings: BotSettings = DEFAULT_SETTINGS;
  private stats: BotStats = DEFAULT_STATS;

  constructor() {
    this.ensureDir();
    this.load();
  }

  private ensureDir(): void {
    if (!existsSync(DB_DIR)) {
      mkdirSync(DB_DIR, { recursive: true });
    }
  }

  private load(): void {
    try {
      if (existsSync(USERS_FILE)) {
        const raw = readFileSync(USERS_FILE, "utf-8");
        const arr: BotUser[] = JSON.parse(raw);
        arr.forEach((u) => this.users.set(u.jid, u));
      }
      if (existsSync(GROUPS_FILE)) {
        const raw = readFileSync(GROUPS_FILE, "utf-8");
        const arr: BotGroup[] = JSON.parse(raw);
        arr.forEach((g) => this.groups.set(g.jid, g));
      }
      if (existsSync(SETTINGS_FILE)) {
        const raw = readFileSync(SETTINGS_FILE, "utf-8");
        this.settings = { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
      }
      if (existsSync(STATS_FILE)) {
        const raw = readFileSync(STATS_FILE, "utf-8");
        const saved = JSON.parse(raw) as Partial<BotStats>;
        this.stats = { ...DEFAULT_STATS, ...saved, startTime: new Date().toISOString() };
        this.stats.restarts = (saved.restarts ?? 0) + 1;
      }
      this.saveStats();
    } catch (err) {
      logger.error({ err }, "DB load error");
    }
  }

  private saveUsers(): void {
    writeFileSync(USERS_FILE, JSON.stringify([...this.users.values()], null, 2));
  }

  private saveGroups(): void {
    writeFileSync(GROUPS_FILE, JSON.stringify([...this.groups.values()], null, 2));
  }

  saveSettings(): void {
    writeFileSync(SETTINGS_FILE, JSON.stringify(this.settings, null, 2));
  }

  saveStats(): void {
    writeFileSync(STATS_FILE, JSON.stringify(this.stats, null, 2));
  }

  // --- USERS ---

  getUser(jid: string): BotUser {
    if (!this.users.has(jid)) {
      const user: BotUser = {
        jid,
        name: null,
        role: "user",
        commandCount: 0,
        warns: 0,
        isPremium: false,
        joinedAt: new Date().toISOString(),
        level: 1,
        exp: 0,
        coins: 0,
        banned: false,
        afk: null,
      };
      this.users.set(jid, user);
      this.saveUsers();
    }
    return this.users.get(jid)!;
  }

  updateUser(jid: string, update: Partial<BotUser>): BotUser {
    const user = this.getUser(jid);
    const updated = { ...user, ...update };
    this.users.set(jid, updated);
    this.saveUsers();
    return updated;
  }

  getAllUsers(): BotUser[] {
    return [...this.users.values()];
  }

  isOwner(jid: string): boolean {
    const user = this.users.get(jid);
    return user?.role === "owner" || this.settings.ownerNumber === jid.split("@")[0];
  }

  isAdmin(jid: string): boolean {
    const user = this.users.get(jid);
    return ["owner", "superadmin", "admin"].includes(user?.role ?? "user");
  }

  isPremium(jid: string): boolean {
    const user = this.users.get(jid);
    return user?.isPremium === true || ["owner", "superadmin"].includes(user?.role ?? "user");
  }

  // --- GROUPS ---

  getGroup(jid: string): BotGroup {
    if (!this.groups.has(jid)) {
      const group: BotGroup = {
        jid,
        name: "Unknown Group",
        memberCount: 0,
        isAdmin: false,
        antilink: false,
        welcome: false,
        goodbye: false,
        muted: false,
        antibot: false,
        antibadword: false,
        antispam: false,
        nsfw: false,
        joinedAt: new Date().toISOString(),
      };
      this.groups.set(jid, group);
      this.saveGroups();
    }
    return this.groups.get(jid)!;
  }

  updateGroup(jid: string, update: Partial<BotGroup>): BotGroup {
    const group = this.getGroup(jid);
    const updated = { ...group, ...update };
    this.groups.set(jid, updated);
    this.saveGroups();
    return updated;
  }

  getAllGroups(): BotGroup[] {
    return [...this.groups.values()];
  }

  // --- SETTINGS ---

  getSettings(): BotSettings {
    return this.settings;
  }

  updateSettings(update: Partial<BotSettings>): void {
    this.settings = { ...this.settings, ...update };
    this.saveSettings();
  }

  getPrefix(): string {
    return this.settings.prefix;
  }

  // --- STATS ---

  getStats(): BotStats {
    return this.stats;
  }

  incrementCommands(amount = 1): void {
    this.stats.commandsUsed += amount;
    this.saveStats();
  }

  incrementMessages(amount = 1): void {
    this.stats.messagesHandled += amount;
    this.saveStats();
  }

  getUptime(): number {
    return Math.floor((Date.now() - new Date(this.stats.startTime).getTime()) / 1000);
  }

  // --- ACTIVITY ---

  addActivity(item: Omit<ActivityItem, "id" | "timestamp">): void {
    const activity: ActivityItem = {
      ...item,
      id: Math.random().toString(36).slice(2),
      timestamp: new Date().toISOString(),
    };
    activityLog.unshift(activity);
    if (activityLog.length > MAX_ACTIVITY) {
      activityLog.pop();
    }
  }

  getActivity(limit = 20): ActivityItem[] {
    return activityLog.slice(0, limit);
  }
}

export const db = new Database();
