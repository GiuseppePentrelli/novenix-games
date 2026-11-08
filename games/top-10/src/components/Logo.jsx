export default function Logo({ subtitle, small }) {
  return (
    <header className="text-center pt-2">
      <div className={`inline-flex items-center select-none ${small ? 'gap-1.5' : 'gap-2 sm:gap-3'}`}>
        <span
          className={`font-black tracking-tight bg-gradient-to-r from-emerald-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent animate-gradient-text ${
            small ? 'text-3xl' : 'text-5xl sm:text-7xl'
          }`}
        >
          TOP
        </span>
        <span
          className={`inline-block font-black text-slate-900 bg-gradient-to-br from-amber-300 to-amber-500 rounded-2xl shadow-lg shadow-amber-500/30 animate-float ${
            small ? 'text-2xl px-2 py-0.5' : 'text-4xl sm:text-6xl px-3 sm:px-4 py-1'
          }`}
        >
          10
        </span>
      </div>
      {subtitle && (
        <p className="mt-2 uppercase tracking-[0.2em] sm:tracking-[0.3em] text-[11px] sm:text-xs text-slate-400 px-2">
          {subtitle}
        </p>
      )}
    </header>
  )
}
