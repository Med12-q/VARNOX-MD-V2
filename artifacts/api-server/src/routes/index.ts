import { Router, type IRouter } from "express";
import healthRouter from "./health.js";
import botRouter from "./bot.js";
import dashboardRouter from "./dashboard.js";
import commandsRouter from "./commands.js";
import groupsRouter from "./groups.js";
import usersRouter from "./users.js";

const router: IRouter = Router();

router.use(healthRouter);
router.use(botRouter);
router.use(dashboardRouter);
router.use(commandsRouter);
router.use(groupsRouter);
router.use(usersRouter);

export default router;
