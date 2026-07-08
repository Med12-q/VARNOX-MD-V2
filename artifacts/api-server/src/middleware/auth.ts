/**
 * VARNOX-MD-V2 — API Authentication Middleware
 *
 * Protects sensitive bot-control and admin routes with a shared secret.
 * Set API_SECRET in your environment. If unset, all requests are allowed
 * (development-only fallback — always set it in production).
 */

import { Request, Response, NextFunction } from "express";
import { logger } from "../lib/logger.js";

const API_SECRET = process.env.API_SECRET;

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  // If no secret is configured, allow all (dev fallback)
  if (!API_SECRET) {
    if (process.env.NODE_ENV === "production") {
      logger.error("API_SECRET not set in production — blocking request");
      res.status(503).json({ error: "Service misconfigured" });
      return;
    }
    next();
    return;
  }

  const provided =
    req.headers["x-api-secret"] ??
    req.headers["authorization"]?.replace(/^Bearer\s+/i, "");

  if (provided !== API_SECRET) {
    logger.warn({ ip: req.ip, url: req.url }, "Unauthorized API access attempt");
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  next();
}
