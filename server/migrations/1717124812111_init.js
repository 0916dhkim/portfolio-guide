exports.up = (
  /** @type {import("node-pg-migrate").MigrationBuilder} */
  pgm,
) => {
  pgm.createExtension("uuid-ossp", { ifNotExists: true });

  pgm.createTable("user", {
    username: {
      type: "varchar(64)",
      primaryKey: true,
    },
    passwordHash: {
      type: "varchar(64)",
      notNull: true,
    },
  });

  pgm.createTable("task", {
    id: {
      type: "uuid",
      primaryKey: true,
      default: pgm.func("uuid_generate_v4()"),
    },
    title: {
      type: "text",
      notNull: true,
    },
  });
};
