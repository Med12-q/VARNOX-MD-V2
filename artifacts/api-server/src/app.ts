import express, { type Express } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import router from "./routes/index.js";
import { logger } from "./lib/logger.js";
import { botManager } from "./bot/connection.js";
import { loadCommands } from "./commands/index.js";

const app: Express = express();

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", router);

// Initialize bot on startup (load commands, restore session)
(async () => {
  try {
    logger.info("Loading commands...");
    await loadCommands();
    logger.info("Trying to restore WhatsApp session...");
    await botManager.tryRestoreSession();
  } catch (err) {
    logger.error({ err }, "Startup initialization error");
  }
})();

export default app;
