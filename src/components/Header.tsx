export function Header() {
  return (
    <header className="w-full bg-white border-b border-border h-16 flex items-center px-6 flex-shrink-0">
      <div className="w-full flex justify-between items-center">
        {/* Logo */}
        <a href="/" className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-primary to-navy rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">◆</span>
          </div>
          <h1 className="text-xl text-navy font-bold tracking-tight">Crystal</h1>
          <span className="hidden sm:inline text-small text-text-light border-l border-border pl-3">
            Data-as-a-Product
          </span>
        </a>

        {/* Account */}
        <div className="flex items-center gap-4">
          <a href="/" className="text-small text-text-light hover:text-text-dark transition-smooth">
            Dashboard
          </a>
          <button
            title="Taiwo Ayanleye"
            className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-small font-bold hover:opacity-90 transition-smooth"
          >
            T
          </button>
        </div>
      </div>
    </header>
  )
}
