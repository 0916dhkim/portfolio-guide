import cookieSession from "cookie-session";
import { type Request } from "express";
import { z } from "zod";

const sessionSchema = z.object({
  username: z.string(),
});

export type Session = z.infer<typeof sessionSchema>;

declare global {
  namespace CookieSessionInterfaces {
    interface CookieSessionObject extends Session {}
  }
}

export function sessionMiddleware() {
  return cookieSession({
    name: "session",
    keys: [process.env.SESSION_SECRET ?? "default"],
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
  });
}

export function createSession(req: Request, username: string) {
  if (req.session == null) {
    throw new Error("Cannot create session.");
  }
  req.session.username = username;
}

export function destroySession(req: Request) {
  req.session = null;
}
