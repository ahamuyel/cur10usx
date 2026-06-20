"use client"
import { useEffect, useRef, useState } from "react"
import { X } from "lucide-react"

type ConfirmActionModalProps = {
  open: boolean
  onClose: () => void
  onConfirm: () => Promise<void>
  title: string
  message: string
  confirmLabel: string
  confirmColor?: "red" | "amber" | "indigo" | "emerald"
}

const colorMap = {
  red: "bg-rose-600 hover:bg-rose-700 shadow-rose-600/20",
  amber: "bg-amber-600 hover:bg-amber-700 shadow-amber-600/20",
  indigo: "bg-primary hover:bg-primary-700 shadow-primary/20",
  emerald: "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20",
}

const ConfirmActionModal = ({ open, onClose, onConfirm, title, message, confirmLabel, confirmColor = "indigo" }: ConfirmActionModalProps) => {
  const overlayRef = useRef<HTMLDivElement>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !loading) onClose()
    }
    if (open) {
      document.addEventListener("keydown", handleEsc)
      document.body.style.overflow = "hidden"
    }
    return () => {
      document.removeEventListener("keydown", handleEsc)
      document.body.style.overflow = ""
    }
  }, [open, onClose, loading])

  const handleConfirm = async () => {
    setLoading(true)
    try {
      await onConfirm()
    } finally {
      setLoading(false)
    }
  }

  if (!open) return null

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={(e) => e.target === overlayRef.current && !loading && onClose()}
    >
      <div className="bg-card rounded-card shadow-card border border-border w-full max-w-sm animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-bold text-foreground">{title}</h2>
          <button
            onClick={onClose}
            disabled={loading}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition"
          >
            <X size={18} />
          </button>
        </div>
        <div className="p-4 sm:p-6">
          <p className="text-sm text-muted-foreground mb-6">{message}</p>
          <div className="flex items-center gap-3 justify-end">
            <button
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 rounded-xl text-sm font-medium text-muted-foreground bg-muted hover:bg-accent transition"
            >
              Cancelar
            </button>
            <button
              onClick={handleConfirm}
              disabled={loading}
              className={`px-4 py-2 rounded-xl text-sm font-semibold text-white transition disabled:opacity-50 shadow-lg ${colorMap[confirmColor]}`}
            >
              {loading ? "Processando..." : confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ConfirmActionModal
