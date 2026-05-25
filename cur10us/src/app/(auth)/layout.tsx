import Link from "next/link"

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-gradient-to-b from-zinc-50 to-zinc-100 dark:from-zinc-950 dark:to-zinc-900 p-4 sm:p-6 lg:p-10">
      {/* Background decoration */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-indigo-500/5 blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-violet-500/5 blur-[120px]" />
        <div className="absolute top-[40%] left-[50%] -translate-x-1/2 w-[400px] h-[400px] rounded-full bg-growth-500/5 blur-[100px]" />
      </div>

      <div className="w-full flex flex-col items-center">
        {/* Logo */}
        <div className="mb-8 sm:mb-10">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-600/20 group-hover:shadow-indigo-600/30 transition-shadow">
              <span className="text-white font-bold text-sm">CX</span>
            </div>
            <span className="text-xl font-bold tracking-tight">
              Cur10us
              <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
                X
              </span>
            </span>
          </Link>
        </div>

        {/* Content */}
        <div className="w-full flex flex-col items-center px-4 sm:px-0">
          {children}
        </div>

        {/* Footer */}
        <div className="mt-8 sm:mt-10">
          <p className="text-center text-xs text-zinc-400 dark:text-zinc-500">
            &copy; {new Date().getFullYear()} Cur10usX. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </div>
  )
}
