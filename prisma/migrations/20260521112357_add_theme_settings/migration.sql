-- AlterTable
ALTER TABLE "School" ADD COLUMN IF NOT EXISTS    "borderRadius" TEXT DEFAULT 'lg',
ADD COLUMN IF NOT EXISTS    "buttonStyle" TEXT DEFAULT 'default',
ADD COLUMN IF NOT EXISTS    "cardStyle" TEXT DEFAULT 'default',
ADD COLUMN IF NOT EXISTS    "fontFamily" TEXT DEFAULT 'Inter',
ADD COLUMN IF NOT EXISTS    "fontSize" TEXT DEFAULT 'base',
ADD COLUMN IF NOT EXISTS    "fontWeight" TEXT DEFAULT 'normal',
ADD COLUMN IF NOT EXISTS    "layoutDensity" TEXT DEFAULT 'comfortable',
ADD COLUMN IF NOT EXISTS    "shadowSize" TEXT DEFAULT 'md',
ADD COLUMN IF NOT EXISTS    "spacing" TEXT DEFAULT 'normal',
ADD COLUMN IF NOT EXISTS    "themePreset" TEXT DEFAULT 'moderno';
