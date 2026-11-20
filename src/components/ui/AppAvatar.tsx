"use client"

import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

function getInitials(name?: string | null): string {
  if (!name) return "?"
  return name
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase()
}

function hasValidSrc(src?: string | null): boolean {
  return !!src && src.trim() !== ""
}

interface AppAvatarProps {
  src?: string | null
  name?: string | null
  className?: string
  fallbackClassName?: string
}

export default function AppAvatar({
  src,
  name,
  className,
  fallbackClassName,
}: AppAvatarProps) {
  const validSrc = hasValidSrc(src)
  const initials = getInitials(name)

  return (
    <Avatar className={cn("h-8 w-8", className)}>
      {validSrc && <AvatarImage src={src!} alt={name || "Avatar"} />}
      <AvatarFallback
        className={cn(
          "font-medium text-[10px]",
          fallbackClassName,
        )}
      >
        {initials}
      </AvatarFallback>
    </Avatar>
  )
}
