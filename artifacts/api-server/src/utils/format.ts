/**
 * VARNOX-MD-V2 — Message Formatting Utilities
 */

/**
 * Format uptime seconds into human-readable string
 */
export function formatUptime(seconds: number): string {
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  const parts = [];
  if (d > 0) parts.push(`${d}j`);
  if (h > 0) parts.push(`${h}h`);
  if (m > 0) parts.push(`${m}m`);
  parts.push(`${s}s`);
  return parts.join(" ");
}

/**
 * Format bytes into human-readable string
 */
export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
  return `${(bytes / 1024 / 1024 / 1024).toFixed(2)} GB`;
}

/**
 * Parse a phone number to JID format
 */
export function phoneToJid(phone: string): string {
  const cleaned = phone.replace(/[^0-9]/g, "");
  return `${cleaned}@s.whatsapp.net`;
}

/**
 * Extract phone number from JID
 */
export function jidToPhone(jid: string): string {
  return jid.split("@")[0] ?? jid;
}

/**
 * Get random item from array
 */
export function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)] as T;
}

/**
 * Sleep for given milliseconds
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Clean phone number (remove +, spaces, dashes)
 */
export function cleanPhone(phone: string): string {
  return phone.replace(/[\s\-\(\)\+]/g, "");
}

/**
 * Truncate string to max length
 */
export function truncate(str: string, max = 50): string {
  if (str.length <= max) return str;
  return str.slice(0, max - 3) + "...";
}

/**
 * Get memory usage percentage
 */
export function getMemoryUsage(): number {
  const used = process.memoryUsage().heapUsed;
  const total = process.memoryUsage().heapTotal;
  return Math.round((used / total) * 100);
}

/**
 * Get CPU usage (approximate)
 */
export function getCpuUsage(): number {
  // Basic approximation — real CPU usage requires OS-level monitoring
  const startUsage = process.cpuUsage();
  const start = Date.now();
  // Synchronous delay to measure CPU time
  let count = 0;
  while (Date.now() - start < 10) count++;
  const usage = process.cpuUsage(startUsage);
  const totalMicros = (Date.now() - start) * 1000;
  const cpuMicros = usage.user + usage.system;
  return Math.min(100, Math.round((cpuMicros / totalMicros) * 100));
}

/**
 * Format a number with thousands separator
 */
export function formatNumber(n: number): string {
  return n.toLocaleString("fr-FR");
}

/**
 * Check if string is a valid phone number
 */
export function isValidPhone(phone: string): boolean {
  const cleaned = cleanPhone(phone);
  return /^\d{7,15}$/.test(cleaned);
}
