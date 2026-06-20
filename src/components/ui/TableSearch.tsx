"use client"
import { Search } from "lucide-react"

type TableSearchProps = {
  value?: string
  onChange?: (value: string) => void
}

const TableSearch = ({ value, onChange }: TableSearchProps) => {
  return (
    <div className="group w-full flex items-center gap-2 text-sm rounded-xl ring-[1.5px] ring-border px-2.5 sm:px-3 py-1.5 sm:py-1 bg-card transition-all focus-within:ring-primary shadow-card">
      <Search
        size={14}
        className="text-muted-foreground group-focus-within:text-primary transition-colors shrink-0"
      />
      <input
        type="text"
        placeholder="Pesquisar..."
        value={value ?? ""}
        onChange={(e) => onChange?.(e.target.value)}
        className="w-full p-1.5 sm:p-2 bg-transparent outline-none text-xs sm:text-sm text-foreground placeholder:text-muted-foreground"
      />
    </div>
  )
}

export default TableSearch
