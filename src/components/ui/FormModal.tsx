"use client"
import { useEffect, useRef } from "react"
import { X } from "lucide-react"

type FormModalProps = {
  open: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
}

const FormModal = ({ open, onClose, title, children }: FormModalProps) => {
  const overlayRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    if (open) {
      document.addEventListener("keydown", handleEsc)
      document.body.style.overflow = "hidden"
    }
    return () => {
      document.removeEventListener("keydown", handleEsc)
      document.body.style.overflow = ""
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={(e) => e.target === overlayRef.current && onClose()}
    >
      <div className="bg-card rounded-card shadow-card border border-border w-full max-w-lg max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-border">
          <h2 className="text-lg font-bold text-foreground">{title}</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition"
          >
            <X size={18} />
          </button>
        </div>
        <div className="p-4 sm:p-6">
          {children}
        </div>
      </div>
    </div>
  )
}

export default FormModal
