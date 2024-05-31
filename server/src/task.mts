import { sql, type DatabasePoolConnection, type ValueExpression } from "slonik";
import { z } from "zod";

export const taskSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
});

function TaskQueryBuilder() {
  function all(username: string) {
    return sql.type(
      taskSchema,
    )`SELECT * FROM "task" WHERE "ownerUsername" = ${username}`;
  }

  function insert(payload: { title: ValueExpression; username: string }) {
    return sql.unsafe`INSERT INTO "task" ("title", "ownerUsername") VALUES (${payload.title}, ${payload.username})`;
  }

  function remove(payload: { id: string; username: string }) {
    return sql.unsafe`DELETE FROM "task" WHERE "id" = ${payload.id} AND "ownerUsername" = ${payload.username}`;
  }

  return {
    all,
    insert,
    remove,
  };
}

export function TaskService(db: DatabasePoolConnection, username: string) {
  const query = TaskQueryBuilder();

  async function fetchAll() {
    const data = await db.query(query.all(username));

    return data.rows;
  }

  async function create(title: string) {
    await db.query(query.insert({ title, username }));
  }

  async function remove(id: string) {
    await db.query(query.remove({ id, username }));
  }

  return { fetchAll, create, remove };
}
