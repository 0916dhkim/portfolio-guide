import dotenv from "dotenv";
dotenv.config();

const PORT = process.env.PORT ?? 3000;

async function main() {
  const { app } = await import("./app.mjs");
  app.listen(PORT, () => {
    console.log(`Listening to port ${PORT}...`);
  });
}

main();
