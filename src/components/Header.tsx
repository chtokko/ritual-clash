import { BrainCircuit, ExternalLink, LogOut, Trophy } from "lucide-react";
import { Link, NavLink } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useArena } from "@/context/useArena";
import { RITUAL_EXPLORER } from "@/lib/ritual";
import { cn } from "@/lib/utils";

const navClass = ({ isActive }: { isActive: boolean }) => cn(
  "rounded-lg px-3 py-2 text-sm font-medium transition-colors",
  isActive ? "bg-white/[0.07] text-white" : "text-slate-500 hover:bg-white/[0.04] hover:text-slate-200",
);

export default function Header({ centered = false }: { centered?: boolean }) {
  const { walletAddress, openWalletModal, disconnectWallet, walletArenaStatus, ensureArenaNetwork } = useArena();

  return <header className="fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-5 sm:pt-4">
    <nav className="glass-panel mx-auto flex h-16 max-w-7xl items-center justify-between rounded-2xl px-3 sm:px-4" aria-label="Primary navigation">
      <Link to="/" className={cn("flex items-center gap-3", centered && "md:absolute md:left-1/2 md:-translate-x-1/2")}>
        <span className="grid h-9 w-9 place-items-center rounded-xl border border-white/15 bg-white/[0.06] shadow-[inset_0_0_18px_rgba(255,255,255,0.04)]">
          <BrainCircuit className="h-[18px] w-[18px] text-white"/>
        </span>
        <span>
          <span className="block font-heading text-sm font-black tracking-[0.14em] text-white sm:text-base">RITUAL CLASH</span>
          <span className="hidden text-[9px] uppercase tracking-[0.2em] text-slate-600 sm:block">On-chain AI games</span>
        </span>
      </Link>

      <div className="hidden items-center gap-1 md:flex">
        <NavLink to="/arena" className={navClass}>Play</NavLink>
        <NavLink to="/leaderboard" className={navClass}><span className="flex items-center gap-2"><Trophy className="h-3.5 w-3.5"/> Ladder</span></NavLink>
        <a href={RITUAL_EXPLORER} target="_blank" rel="noreferrer" className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-500 transition-colors hover:bg-white/[0.04] hover:text-slate-200">
          Explorer <ExternalLink className="h-3.5 w-3.5"/>
        </a>
      </div>

      <div className="flex items-center gap-2">
        {walletAddress ? <>
          {walletArenaStatus === "wrong-network" && <Button variant="wallet" size="sm" onClick={ensureArenaNetwork}>Switch network</Button>}
          <div className="hidden items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.035] px-3 py-2 sm:flex">
            <span className="status-dot"/>
            <span className="font-mono text-[11px] text-slate-300">{walletAddress.slice(0, 6)}…{walletAddress.slice(-4)}</span>
          </div>
          <Button variant="ghost" size="icon" onClick={disconnectWallet} title="Disconnect wallet" aria-label="Disconnect wallet">
            <LogOut className="h-4 w-4"/>
          </Button>
        </> : <Button variant="wallet" size="sm" onClick={openWalletModal}>Connect wallet</Button>}
      </div>
    </nav>
  </header>;
}
