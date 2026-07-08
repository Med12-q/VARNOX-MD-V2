/**
 * VARNOX-MD-V2 — Bot Routes
 */

import { Router } from "express";
import { botManager } from "../bot/connection.js";
import { db } from "../database/db.js";
import { cleanPhone, isValidPhone } from "../utils/format.js";
import { RequestPairCodeBody } from "@workspace/api-zod";

const router = Router();

// GET /api/bot/status
router.get("/bot/status", (_req, res) => {
  const status = botManager.getStatus();
  res.json(status);
});

// POST /api/bot/pair-code
router.post("/bot/pair-code", async (req, res) => {
  const parsed = RequestPairCodeBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Numéro de téléphone invalide" });
    return;
  }

  const { phone } = parsed.data;
  const cleaned = cleanPhone(phone);

  if (!isValidPhone(cleaned)) {
    res.status(400).json({ error: "Format de numéro invalide. Utilisez le format international (ex: +33612345678)" });
    return;
  }

  const status = botManager.getStatus();
  if (status.state === "connected") {
    res.status(409).json({ error: "Le bot est déjà connecté" });
    return;
  }

  try {
    const code = await botManager.connectWithPairCode(cleaned);
    res.json({
      code: code.length === 8 ? `${code.slice(0, 4)}-${code.slice(4)}` : code,
      expiresIn: 60,
    });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

// POST /api/bot/disconnect
router.post("/bot/disconnect", async (_req, res) => {
  try {
    await botManager.disconnect();
    res.json({ success: true, message: "Bot déconnecté avec succès" });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

// POST /api/bot/restart
router.post("/bot/restart", async (_req, res) => {
  try {
    await botManager.restart();
    res.json({ success: true, message: "Bot en cours de redémarrage..." });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

// GET /api/bot/info
router.get("/bot/info", (_req, res) => {
  const status = botManager.getStatus();
  const settings = db.getSettings();
  res.json({
    jid: status.phone ? `${status.phone}@s.whatsapp.net` : null,
    name: status.name,
    phone: status.phone,
    platform: "WhatsApp Multi Device",
    version: settings.botVersion,
    uptime: db.getUptime(),
  });
});

export default router;
