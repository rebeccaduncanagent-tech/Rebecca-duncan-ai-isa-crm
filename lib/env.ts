import { z } from "zod";

export class EnvError extends Error {
  constructor(message: string) {
    super(`Environment configuration error: ${message}`);
    this.name = "EnvError";
  }
}

const emptyToUndefined = (v: unknown) => (v === "" ? undefined : v);

const serverEnvSchema = z.object({
  BOLDTRAIL_WEBHOOK_URL: z.preprocess(emptyToUndefined, z.url().optional()),
  BOLDTRAIL_API_KEY: z.preprocess(emptyToUndefined, z.string().optional()),
  AI_PROVIDER: z.enum(["rules", "openai"]).default("rules"),
  OPENAI_API_KEY: z.preprocess(emptyToUndefined, z.string().optional()),
  OPENAI_MODEL: z.preprocess(
    emptyToUndefined,
    z.string().default("gpt-4o-mini"),
  ),
  OPENAI_BASE_URL: z.preprocess(
    emptyToUndefined,
    z.url().default("https://api.openai.com/v1"),
  ),
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;

/** Parses server env vars and throws a readable EnvError when invalid. */
export function getServerEnv(): ServerEnv {
  const parsed = serverEnvSchema.safeParse(process.env);
  if (!parsed.success) {
    const details = parsed.error.issues
      .map((i) => `${i.path.join(".")}: ${i.message}`)
      .join("; ");
    throw new EnvError(`invalid values (${details}). See .env.example.`);
  }
  const env = parsed.data;
  if (env.AI_PROVIDER === "openai" && !env.OPENAI_API_KEY) {
    throw new EnvError(
      "AI_PROVIDER=openai requires OPENAI_API_KEY. Set it or use AI_PROVIDER=rules.",
    );
  }
  return env;
}
