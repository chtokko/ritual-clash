import { ExternalLink, LogOut } from "lucide-react";
import { Link, NavLink } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useArena } from "@/context/useArena";
import { RITUAL_EXPLORER } from "@/lib/ritual";
import { cn } from "@/lib/utils";

const navClass = ({ isActive }: { isActive: boolean }) => cn(
  "relative flex h-16 items-center px-4 font-mono text-[10px] font-medium uppercase tracking-[0.16em] transition-colors after:absolute after:inset-x-4 after:bottom-0 after:h-px",
  isActive ? "text-white after:bg-white" : "text-white/35 after:bg-transparent hover:text-white/75",
);

const mobileNavClass = ({ isActive }: { isActive: boolean }) => cn(
  "flex h-11 flex-1 items-center justify-center font-mono text-[10px] uppercase tracking-[0.14em]",
  isActive ? "bg-[#eeece4] text-black" : "text-white/50",
);

export default function Header({ centered: _centered = false }: { centered?: boolean }) {
  const { walletAddress, openWalletModal, disconnectWallet, walletArenaStatus, ensureArenaNetwork } = useArena();

  return <>
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/[0.14] bg-[#080808]/95 backdrop-blur-md">
      <nav className="app-container flex h-16 items-center justify-between" aria-label="Primary navigation">
        <Link to="/" className="flex items-center gap-3" aria-label="Ritual Clash home">
          <span className="grid h-7 w-7 place-items-center border border-white/60 font-mono text-[9px] font-semibold text-white">RC</span>
          <span className="flex items-baseline gap-2">
            <span className="font-heading text-sm font-semibold uppercase tracking-[0.12em] text-white">Ritual Clash</span>
            <span className="hidden font-mono text-[8px] uppercase tracking-[0.15em] text-white/25 sm:inline">Protocol 01</span>
          </span>
        </Link>

        <div className="absolute left-1/2 hidden h-16 -translate-x-1/2 items-center md:flex">
          <NavLink to="/arena" className={navClass}>Match console</NavLink>
          <NavLink to="/leaderboard" className={navClass}>Ranking</NavLink>
          <a href={RITUAL_EXPLORER} target="_blank" rel="noreferrer" className="flex h-16 items-center gap-2 px-4 font-mono text-[10px] uppercase tracking-[0.16em] text-white/35 transition-colors hover:text-white/75">
            Explorer <ExternalLink className="h-3 w-3"/>
          </a>
        </div>

        <div className="flex items-center gap-2">
          {walletAddress ? <>
            {walletArenaStatus === "wrong-network" && <Button variant="wallet" size="sm" onClick={ensureArenaNetwork}>Switch chain</Button>}
            <div className="hidden items-center gap-2 border-l border-white/15 pl-4 sm:flex">
              <span className="status-dot"/>
              <span className="font-mono text-[10px] text-white/55">{walletAddress.slice(0, 6)}…{walletAddress.slice(-4)}</span>
            </div>
            <Button variant="ghost" size="icon" onClick={disconnectWallet} title="Disconnect wallet" aria-label="Disconnect wallet">
              <LogOut className="h-4 w-4"/>
            </Button>
          </> : <Button variant="wallet" size="sm" onClick={openWalletModal}>Connect</Button>}
        </div>
      </nav>
    </header>

    <nav className="fixed inset-x-3 bottom-3 z-50 flex overflow-hidden border border-white/20 bg-[#0a0a0a]/95 shadow-2xl backdrop-blur-md md:hidden" aria-label="Mobile navigation">
      <NavLink to="/arena" className={mobileNavClass}>Console</NavLink>
      <NavLink to="/leaderboard" className={mobileNavClass}>Ranking</NavLink>
      <a href={RITUAL_EXPLORER} target="_blank" rel="noreferrer" className="flex h-11 flex-1 items-center justify-center font-mono text-[10px] uppercase tracking-[0.14em] text-white/50">Explorer</a>
    </nav>
  </>;
}
