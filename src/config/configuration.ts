import z from "zod";

export const configSchema = z.object({
   NODE_ENV: z.enum(['development', 'production', 'test']).default('development'), // Create an enumeration of 3 options [dev, prod, test], dev by default
   
   PORT: z.coerce.number().int().min(1).max(65535).default(3000), // coerce.number(...) means Number(...)

   DB_HOST: z.string().min(1), // Minimum require 1 value, must be string

   DB_PORT: z.coerce.number().int().min(1).max(65535).default(5432), // Minimum require 1 value, must be integer, max port num 65535, default port 5432

   DB_USERNAME: z.string().min(1),

   DB_PASSWORD: z.string().min(1),

   DB_NAME: z.string().min(1)
});