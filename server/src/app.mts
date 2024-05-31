import cors from "cors";
import express, {
  type Request,
  type RequestHandler,
  type Response,
} from "express";
import morgan from "morgan";
import { z } from "zod";
import { TaskService } from "./task.mjs";
import { pool } from "./database.mjs";
import { UserService } from "./user.mjs";
import {
  createSession,
  destroySession,
  sessionMiddleware,
} from "./session.mjs";

const asyncHandler =
  (wrapped: (req: Request, res: Response) => Promise<void>): RequestHandler =>
  async (req, res, next) => {
    try {
      await wrapped(req, res);
    } catch (e) {
      next(e);
    }
  };

export const app = express();
app.use(morgan("short"));
app.use(cors());
app.use(sessionMiddleware());
app.use(express.json());

app.post(
  "/api/user/register",
  asyncHandler(async (req, res) => {
    const bodySchema = z.object({
      username: z.string(),
      password: z.string(),
    });
    const body = bodySchema.parse(req.body);

    await pool.connect(async (db) => {
      const userService = UserService(db);
      await userService.create(body);
    });

    createSession(req, body.username);

    res.send("OK");
  }),
);

app.post(
  "/api/user/login",
  asyncHandler(async (req, res) => {
    const bodySchema = z.object({
      username: z.string(),
      password: z.string(),
    });
    const body = bodySchema.parse(req.body);

    await pool.connect(async (db) => {
      const userService = UserService(db);
      if (await userService.checkLogin(body)) {
        createSession(req, body.username);
        res.send("OK");
      } else {
        res.status(403).send("FAIL");
      }
    });
  }),
);

app.post(
  "/api/user/logout",
  asyncHandler(async (req, res) => {
    destroySession(req);
    res.send("OK");
  }),
);

app.get(
  "/api/tasks",
  asyncHandler(async (req, res) => {
    const username = req.session?.username;
    if (username == null) {
      res.sendStatus(401);
      return;
    }

    await pool.connect(async (db) => {
      const taskService = TaskService(db, username);
      res.json(await taskService.fetchAll());
    });
  }),
);

app.post(
  "/api/tasks/create",
  asyncHandler(async (req, res) => {
    const username = req.session?.username;
    if (username == null) {
      res.sendStatus(401);
      return;
    }

    const bodySchema = z.object({
      title: z.string(),
    });
    const body = bodySchema.parse(req.body);

    await pool.connect(async (db) => {
      const taskService = TaskService(db, username);
      await taskService.create(body.title);
    });

    res.send("OK");
  }),
);

app.post(
  "/api/tasks/delete",
  asyncHandler(async (req, res) => {
    const username = req.session?.username;
    if (username == null) {
      res.sendStatus(401);
      return;
    }

    const bodySchema = z.object({
      id: z.string(),
    });
    const body = bodySchema.parse(req.body);

    await pool.connect(async (db) => {
      const taskService = TaskService(db, username);
      await taskService.remove(body.id);
    });

    res.send("OK");
  }),
);
