/**
 * VARNOX-MD-V2 — Commands Routes
 */

import { Router } from "express";
import { getCommandList } from "../commands/index.js";
import { GetCommandsQueryParams } from "@workspace/api-zod";

const router = Router();

// GET /api/commands
router.get("/commands", (req, res) => {
  const parsed = GetCommandsQueryParams.safeParse(req.query);
  const category = parsed.success ? parsed.data.category : undefined;
  const commands = getCommandList(category);
  res.json(
    commands.map((c) => ({
      name: c.name,
      description: c.description,
      category: c.category,
      usage: c.usage,
      aliases: c.aliases,
      isOwnerOnly: c.isOwnerOnly,
      isGroupOnly: c.isGroupOnly,
      isPremium: c.isPremium,
      usageCount: c.usageCount,
    }))
  );
});

export default router;
