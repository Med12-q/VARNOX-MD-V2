/**
 * VARNOX-MD-V2 — Users Routes
 */

import { Router } from "express";
import { db } from "../database/db.js";
import { GetUsersQueryParams, GetUserParams, UpdateUserBody } from "@workspace/api-zod";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

// GET /api/users
router.get("/users", (req, res) => {
  const parsed = GetUsersQueryParams.safeParse(req.query);
  const role = parsed.success ? parsed.data.role : undefined;
  let users = db.getAllUsers();
  if (role) {
    users = users.filter((u) => u.role === role);
  }
  res.json(users);
});

// GET /api/users/:jid
router.get("/users/:jid", (req, res) => {
  const paramsParsed = GetUserParams.safeParse(req.params);
  if (!paramsParsed.success) {
    res.status(400).json({ error: "JID invalide" });
    return;
  }
  const jid = decodeURIComponent(paramsParsed.data.jid);
  const user = db.getAllUsers().find((u) => u.jid === jid);
  if (!user) {
    res.status(404).json({ error: "Utilisateur non trouvé" });
    return;
  }
  res.json(user);
});

// PATCH /api/users/:jid
router.patch("/users/:jid", requireAuth, (req, res) => {
  const paramsParsed = GetUserParams.safeParse(req.params);
  if (!paramsParsed.success) {
    res.status(400).json({ error: "JID invalide" });
    return;
  }
  const jid = decodeURIComponent(paramsParsed.data.jid);
  const bodyParsed = UpdateUserBody.safeParse(req.body);
  if (!bodyParsed.success) {
    res.status(400).json({ error: "Données invalides" });
    return;
  }
  const updated = db.updateUser(jid, bodyParsed.data as any);
  res.json(updated);
});

export default router;
