import { SQLDatabase } from "encore.dev/storage/sqldb";

export const employeeDB = new SQLDatabase("employee", {
  migrations: "./migrations",
});
