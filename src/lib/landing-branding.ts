import { prisma } from "@/lib/prisma"
import type { PlatformBranding } from "@/types/landing"

export const DEFAULT_BRANDING: PlatformBranding = {
  name: "Cur10usX",
  description: null,
  logo: null,
  contactEmail: "suporte@cur10usx.com",
  contactPhone: null,
}

export async function getLandingBranding(): Promise<PlatformBranding> {
  try {
    const config = await prisma.platformConfig.findUnique({
      where: { id: "singleton" },
    })
    return {
      name: config?.name || DEFAULT_BRANDING.name,
      description: config?.description || null,
      logo: config?.logo || null,
      contactEmail: config?.contactEmail || DEFAULT_BRANDING.contactEmail,
      contactPhone: config?.contactPhone || null,
    }
  } catch {
    return DEFAULT_BRANDING
  }
}
