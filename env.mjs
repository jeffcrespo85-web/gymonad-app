// @ts-check
/**
 * This file is included in `/next.config.js` which ensures the app isn't built with invalid env vars.
 * It has to be a `.mjs` file to be imported there.
 */

import { z } from "zod"

const server = z.object({
  // Add server-side environment variables here
})

const client = z.object({
  NEXT_PUBLIC_GOOGLE_CLIENT_ID: z.string().optional(),
  NEXT_PUBLIC_GOOGLE_MAPS_API_KEY: z.string().optional(),
  NEXT_PUBLIC_SUPABASE_URL: z.string().optional(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().optional(),
})

/**
 * You can't destruct `process.env` as a regular object in the Next.js
 * middleware, so you have to do it manually here.
 * @type {{ [k in keyof z.input<typeof server>]: string | undefined }}
 */
const processEnv = {
  // Add server env vars here if needed
}

const merged = server.merge(client)
const parsed = merged.safeParse({
  ...processEnv,
  NEXT_PUBLIC_GOOGLE_CLIENT_ID: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
  NEXT_PUBLIC_GOOGLE_MAPS_API_KEY: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
})

if (parsed.success === false) {
  console.error(
    "❌ Invalid environment variables:",
    parsed.error.flatten().fieldErrors,
  )
  throw new Error("Invalid environment variables")
}

/** @typedef {z.infer<typeof merged>} MergedInput */
/** @typedef {z.infer<typeof server>} ServerInput */
/** @typedef {z.infer<typeof client>} ClientInput */

/**
 * @type {MergedInput}
 */
export const env = parsed.data
