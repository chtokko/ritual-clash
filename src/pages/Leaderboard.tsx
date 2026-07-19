import { useQuery } from "@tanstack/react-query";
import { ArrowUpRight, Crown, Medal, ShieldCheck, UsersRound } from "lucide-react";
import Header from "@/components/Header";
import { arenaAbi, ritualPublicClient, RITUAL_CLASH_CONTRACT_ADDRESS, type RitualProfile } from "@/lib/ritual";
import { useArena } from "@/context/useArena";

export default function Leaderboard() {
  const { coreContractConfigured } = useArena();
  const query = useQuery({
    queryKey: ["ritual-leaderboard", RITUAL_CLASH_CONTRACT_ADDRESS],
    enabled: coreContractConfigured,
    refetchInterval: 10_000,
    queryFn: async () => {
      const reader = ritualPublicClient as unknown as { readContract: (request: Record<string, unknown>) => Promise<unknown> };
      const players = await reader.readContract({ address: RITUAL_CLASH_CONTRACT_ADDRESS, abi: arenaAbi, functionName: "getPlayers" }) as `0x${string}`[];
      const profiles = await Promise.all(players.map(async (address) => ({
        address,
        profile: await reader.readContract({ address: RITUAL_CLASH_CONTRACT_ADDRESS, abi: arenaAbi, functionName: "profiles", args: [address] }) as RitualProfile,
      })));
      return profiles.sort((a, b) => Number(b.profile[4] - a.profile[4]));
    },
  });
  const entries = query.data || [];
  const totalMatches = entries.reduce((sum, entry) => sum + entry.profile[1] + entry.profile[2] + entry.profile[3], 0n) / 2n;

  return <div className="app-page">
    <Header/>
    <main id="main" className="app-container pb-20 pt-28 sm:pt-32">
      <div className="grid-bg pointer-events-none absolute inset-x-0 top-0 h-[680px]"/>
      <section className="relative border-b border-white/[0.14] py-10 sm:py-14">
        <p className="eyebrow">Protocol ranking / Live</p>
        <div className="mt-5 flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div><h1 className="font-heading text-5xl font-medium leading-[0.9] tracking-[-0.055em] text-white sm:text-6xl">VERIFIED<br/><span className="text-white/30">RANKING.</span></h1><p className="mt-5 max-w-xl text-base leading-7 text-slate-500">Permanent player reputation, ordered by XP earned through settled Ritual verdicts.</p></div>
          <div className="flex gap-3"><MiniMetric label="Players" value={entries.length.toString()}/><MiniMetric label="Matches" value={totalMatches.toString()}/></div>
        </div>
      </section>

      {!coreContractConfigured && <div className="surface border-white/20 p-6 text-white/65">Contract configuration is missing.</div>}
      {query.isError && <div className="surface border-red-400/20 p-6 text-red-200/80">Ritual data is temporarily unavailable. The app will retry automatically.</div>}

      <section className="surface relative overflow-hidden">
        <div className="flex flex-col gap-4 border-b border-white/[0.07] p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div className="flex items-center gap-3"><div className="grid h-10 w-10 place-items-center border border-white/20 bg-white/[0.04]"><Crown className="h-4.5 w-4.5 text-white"/></div><div><h2 className="font-heading text-lg text-white">Global ranking</h2><p className="mt-0.5 font-mono text-[9px] uppercase tracking-[0.12em] text-slate-600">Synced from Ritual every 10 seconds</p></div></div>
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.18em] text-white/55"><ShieldCheck className="h-3.5 w-3.5"/> On-chain verified</div>
        </div>

        {entries.length ? <div className="divide-y divide-white/[0.06]">
          {entries.map(({ address, profile }, index) => <article key={address} className="group grid items-center gap-4 p-5 transition-colors hover:bg-white/[0.025] sm:p-6 md:grid-cols-[72px_1.5fr_repeat(3,0.7fr)_auto]">
            <Rank index={index}/>
            <div className="min-w-0"><p className="truncate font-heading text-lg text-white">{profile[0]}</p><p className="mt-1 font-mono text-[10px] text-slate-600">{shortAddress(address)}</p></div>
            <Metric label="XP" value={profile[4]} primary/>
            <Metric label="Wins" value={profile[1]}/>
            <Metric label="Record" value={`${profile[1]}–${profile[2]}–${profile[3]}`}/>
            <a href={`https://explorer.ritualfoundation.org/address/${address}`} target="_blank" rel="noreferrer" className="grid h-9 w-9 place-items-center border border-white/[0.1] text-slate-600 transition-colors hover:border-white/40 hover:text-white" aria-label={`View ${profile[0]} on Ritual Explorer`}><ArrowUpRight className="h-4 w-4"/></a>
          </article>)}
        </div> : coreContractConfigured && <div className="grid min-h-80 place-items-center p-10 text-center"><div><div className="mx-auto grid h-14 w-14 place-items-center border border-white/[0.12] bg-white/[0.03]"><UsersRound className="h-5 w-5 text-slate-600"/></div><h3 className="mt-5 font-heading text-xl text-slate-300">The ranking is open</h3><p className="mt-2 max-w-sm text-sm leading-6 text-slate-600">The first settled match will establish the first verified rank.</p></div></div>}
      </section>
    </main>
  </div>;
}

function Rank({ index }: { index: number }) {
  if (index === 0) return <div className="flex items-center gap-2 text-white"><Crown className="h-5 w-5"/><span className="font-mono text-xs">01</span></div>;
  if (index < 3) return <div className="flex items-center gap-2 text-slate-400"><Medal className="h-5 w-5"/><span className="font-mono text-xs">0{index + 1}</span></div>;
  return <div className="font-mono text-xs text-slate-600">#{String(index + 1).padStart(2, "0")}</div>;
}

function Metric({ label, value, primary = false }: { label: string; value: bigint | string; primary?: boolean }) {
  return <div><p className="text-[9px] uppercase tracking-[0.18em] text-slate-700">{label}</p><p className={`mt-1.5 font-mono text-sm ${primary ? "text-white" : "text-slate-300"}`}>{value.toString()}</p></div>;
}

function MiniMetric({ label, value }: { label: string; value: string }) {
  return <div className="surface-soft min-w-24 px-4 py-3"><p className="text-[9px] uppercase tracking-wider text-slate-700">{label}</p><p className="mt-1 font-mono text-lg text-white">{value}</p></div>;
}

function shortAddress(address: string) {
  return `${address.slice(0, 8)}…${address.slice(-6)}`;
}
