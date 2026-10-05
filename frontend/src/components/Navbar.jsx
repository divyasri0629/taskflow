import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  return (
    <header className="border-b border-line">
      <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-accent" />
          <span className="font-display text-sm tracking-widest uppercase text-white/70">TaskFlow</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-white/50 hidden sm:inline">{user?.name}</span>
          <button
            onClick={logout}
            className="text-sm text-white/70 border border-line rounded-md px-3 py-1.5 hover:border-white/30 transition"
          >
            Sign out
          </button>
        </div>
      </div>
    </header>
  );
}
