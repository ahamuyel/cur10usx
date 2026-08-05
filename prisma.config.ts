import path from "node:path"
import { defineConfig } from "prisma/config"

try {
  process.loadEnvFile()
} catch {
  // Environment variables might already be set in system environment
}

export default defineConfig({
  schema: path.join(__dirname, "prisma", "schema.prisma"),
  migrations: {
    seed: "tsx prisma/seed.ts",
  },
})
