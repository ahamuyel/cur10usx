"use client"
import { Sun, Moon } from "lucide-react"
import { useTheme } from "@/provider/theme"

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme()

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-lg text-muted-foreground hover:text-primary hover:bg-accent transition"
      aria-label="Alternar tema"
    >
      {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
    </button>
  )
}

export default ThemeToggle
