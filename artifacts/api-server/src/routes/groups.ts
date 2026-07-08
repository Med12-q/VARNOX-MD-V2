/**
 * VARNOX-MD-V2 — Groups Routes
 */

import { Router } from "express";
import { db } from "../database/db.js";
import { botManager } from "../bot/connection.js";

const router = Router();

// GET /api/groups
router.get("/groups", async (_req, res) => {
  const groups = db.getAllGroups();

  // If bot is connected, try to enrich with live data
  if (botManager.isConnected()) {
    const sock = botManager.getSocket();
    if (sock) {
      try {
        const liveGroups = await Promise.allSettled(
          groups.slice(0, 20).map(async (g) => {
            try {
              const meta = await sock.groupMetadata(g.jid);
              db.updateGroup(g.jid, {
                name: meta.subject,
                memberCount: meta.participants.length,
                isAdmin: meta.participants.some(
                  (p) => p.admin && (p.id === sock.user?.id)
                ),
              });
              return db.getGroup(g.jid);
            } catch {
              return g;
            }
          })
        );
        const enriched = liveGroups
          .filter((r) => r.status === "fulfilled")
          .map((r) => (r as PromiseFulfilledResult<typeof groups[0]>).value);
        res.json(enriched);
        return;
      } catch (_) {}
    }
  }

  res.json(groups);
});

export default router;
