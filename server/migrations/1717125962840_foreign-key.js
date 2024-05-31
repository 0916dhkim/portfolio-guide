exports.up = (
  /** @type {import("node-pg-migrate").MigrationBuilder} */
  pgm,
) => {
  pgm.addColumn("task", {
    ownerUsername: {
      type: "varchar(64)",
      notNull: true,
      references: "user",
    },
  });
};
