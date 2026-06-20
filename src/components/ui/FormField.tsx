type FormFieldProps = {
  label: string
  error?: string
  children: React.ReactNode
}

const FormField = ({ label, error, children }: FormFieldProps) => {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-semibold text-muted-foreground">{label}</label>
      {children}
      {error && <span className="text-xs text-destructive">{error}</span>}
    </div>
  )
}

export default FormField
