import { env } from "node:process";

export interface IEnvironment {
  ENABLE_HTTP: boolean;
  ALLOWED_HOSTS: string[];
  PORT: number;
}

export const Environment: IEnvironment = {
  PORT: Number(process.env.PORT) || 3000,

  ENABLE_HTTP: (env.ENABLE_HTTP ?? "false").toLowerCase() === "true",

  ALLOWED_HOSTS: (env.ALLOWED_HOSTS ?? "")
    .split(",")
    .map((d) => d.trim().toLowerCase())
    .filter(Boolean),
};
