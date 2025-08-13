import { Gateway } from "encore.dev/api";
import { auth } from "./auth";

export const gw = new Gateway({ authHandler: auth });
