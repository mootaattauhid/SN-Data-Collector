import { SQLDatabase } from "encore.dev/storage/sqldb";

export const snDB = new SQLDatabase("sn_data", {
  migrations: "./migrations",
});
