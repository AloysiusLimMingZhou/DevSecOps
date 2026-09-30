import z from "zod";

export const configSchema = z.object({
   NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
   
   PORT: z.coerce.number().int().min(1).max(65535).default(3000),

   DB_HOST: z.string().min(1),

   DB_PORT: z.coerce.number().int().min(1).max(65535).default(5432),

   DB_USERNAME: z.string().min(1),

   DB_PASSWORD: z.string().min(1),

   DB_NAME: z.string().min(1)
});