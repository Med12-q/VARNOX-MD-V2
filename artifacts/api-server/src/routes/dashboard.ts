/**
 * VARNOX-MD-V2 — Dashboard Routes
 */

import { Router } from "express";
import { db } from "../database/db.js";
import { getMemoryUsage, getCpuUsage } from "../utils/format.js";

const router = Router();

// GET /api/dashboard/stats
router.get("/dashboard/stats", (_req, res) => {
  const stats = db.getStats();
  const users = db.getAllUsers();
  const groups = db.getAllGroups();
  const premiumUsers = users.filter((u) => u.isPremium || u.role === "owner").length;

  res.json({
    totalGroups: groups.length,
    totalUsers: users.length,
    commandsUsed: stats.commandsUsed,
    messagesHandled: stats.messagesHandled,
    uptime: db.getUptime(),
    memoryUsage: getMemoryUsage(),
    cpuUsage: getCpuUsage(),
    premiumUsers,
  });
});

// GET /api/dashboard/activity
router.get("/dashboard/activity", (_req, res) => {
  const activity = db.getActivity(20);
  res.json(activity);
});

export default router;
