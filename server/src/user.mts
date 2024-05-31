import { z } from "zod";
import { sql, type DatabasePoolConnection } from "slonik";
import bcrypt from "bcrypt";

export const userSchema = z.object({
  username: z.string(),
  passwordHash: z.string(),
});

function UserQueryBuilder() {
  function byUsername(username: string) {
    return sql.type(
      userSchema,
    )`SELECT * FROM "user" WHERE "username" = ${username} ORDER BY "username" DESC FETCH FIRST ROW ONLY`;
  }

  function insert(payload: { username: string; passwordHash: string }) {
    return sql.unsafe`INSERT INTO "user" ("username", "passwordHash") VALUES (${payload.username}, ${payload.passwordHash})`;
  }

  return { byUsername, insert };
}

export function UserService(db: DatabasePoolConnection) {
  const query = UserQueryBuilder();

  async function getByUsername(username: string) {
    const data = await db.maybeOne(query.byUsername(username));
    return data;
  }

  async function create(payload: { username: string; password: string }) {
    const passwordHash = await bcrypt.hash(payload.password, 10);
    await db.query(query.insert({ username: payload.username, passwordHash }));
  }

  async function checkLogin(payload: {
    username: string;
    password: string;
  }): Promise<boolean> {
    const user = await getByUsername(payload.username);
    if (user == null) {
      return false;
    }
    return bcrypt.compare(payload.password, user.passwordHash);
  }

  return { getByUsername, create, checkLogin };
}
