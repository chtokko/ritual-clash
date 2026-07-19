import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { encodeFunctionData, formatEther, parseEther, type Address } from "viem";
import { useSendTransaction, useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import {
  ArrowRight,
  BrainCircuit,
  CheckCircle2,
  Coins,
  LoaderCircle,
  Plus,
  ShieldCheck,
  Sparkles,
  Swords,
  Trophy,
  UserRound,
  WalletCards,
} from "lucide-react";
import { toast } from "sonner";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { GlassButton } from "@/components/ui/glass-button";
import { Input } from "@/components/ui/input";
import { useArena } from "@/context/ArenaContext";
import {
  arenaAbi,
  ASYNC_JOB_TRACKER,
  MODE_LABELS,
  ritualPublicClient,
  registryAbi,
  RITUAL_CLASH_CONTRACT_ADDRESS,
  RITUAL_WALLET,
  ritualWalletAbi,
  STATUS_LABELS,
  TEE_SERVICE_REGISTRY,
  trackerAbi,
  ZERO_ADDRESS,
  type RitualProfile,
  type RitualRoom,
} from "@/lib/ritual";

type AsyncState = "IDLE" | "CONFIRMING" | "SUBMITTED" | "COMMITTED" | "EXECUTING" | "SETTLING" | "COMPLETED" | "ERROR";
type RitualExecutorService = { isValid: boolean; node: { teeAddress: Address } };

const selectClass = "h-12 w-full rounded-xl border border-white/10 bg-black/25 px-4 text-sm text-slate-200 outline-none transition-all focus:border-white/35 focus:ring-4 focus:ring-white/[0.06]";

export default function RitualArena() {
  const { walletAddress, openWalletModal, ensureArenaNetwork, coreContractConfigured } = useArena();
  const [handle, setHandle] = useState("");
  const [mode, setMode] = useState(0);
  const [category, setCategory] = useState("Tech");
  const [topic, setTopic] = useState("");
  const [stake, setStake] = useState("0");
  const [entries, setEntries] = useState<Record<string, string>>({});
  const [asyncState, setAsyncState] = useState<AsyncState>("IDLE");
  const [activeRoom, setActiveRoom] = useState<bigint | null>(null);
  const { writeContractAsync, isPending: writePending } = useWriteContract();
  const { sendTransactionAsync } = useSendTransaction();
  const reader = ritualPublicClient as unknown as { readContract: (request: Record<string, unknown>) => Promise<unknown> };

  const profileQuery = useQuery<RitualProfile>({
    queryKey: ["ritual-profile", walletAddress],
    enabled: coreContractConfigured && Boolean(walletAddress),
    refetchInterval: 8_000,
    queryFn: () => reader.readContract({ address: RITUAL_CLASH_CONTRACT_ADDRESS, abi: arenaAbi, functionName: "profiles", args: [walletAddress!] }) as Promise<RitualProfile>,
  });
  const roomsQuery = useQuery<readonly RitualRoom[]>({
    queryKey: ["ritual-rooms", RITUAL_CLASH_CONTRACT_ADDRESS],
    enabled: coreContractConfigured,
    refetchInterval: 6_000,
    queryFn: () => reader.readContract({ address: RITUAL_CLASH_CONTRACT_ADDRESS, abi: arenaAbi, functionName: "getRecentRooms", args: [20n] }) as Promise<readonly RitualRoom[]>,
  });
  const winningsQuery = useQuery<bigint>({
    queryKey: ["ritual-winnings", walletAddress],
    enabled: coreContractConfigured && Boolean(walletAddress),
    refetchInterval: 8_000,
    queryFn: () => reader.readContract({ address: RITUAL_CLASH_CONTRACT_ADDRESS, abi: arenaAbi, functionName: "claimableWinnings", args: [walletAddress!] }) as Promise<bigint>,
  });
  const walletDepositQuery = useQuery<bigint>({
    queryKey: ["ritual-wallet-deposit", walletAddress],
    enabled: Boolean(walletAddress),
    refetchInterval: 8_000,
    queryFn: () => reader.readContract({ address: RITUAL_WALLET, abi: ritualWalletAbi, functionName: "balanceOf", args: [walletAddress!] }) as Promise<bigint>,
  });
  const senderLockQuery = useQuery<boolean>({
    queryKey: ["ritual-sender-lock", walletAddress],
    enabled: Boolean(walletAddress),
    refetchInterval: 3_000,
    queryFn: () => reader.readContract({ address: ASYNC_JOB_TRACKER, abi: trackerAbi, functionName: "hasPendingJobForSender", args: [walletAddress!] }) as Promise<boolean>,
  });
  const executorsQuery = useQuery<readonly RitualExecutorService[]>({
    queryKey: ["ritual-executors"],
    refetchInterval: 30_000,
    queryFn: () => reader.readContract({ address: TEE_SERVICE_REGISTRY, abi: registryAbi, functionName: "getServicesByCapability", args: [1, true] }) as Promise<readonly RitualExecutorService[]>,
  });

  const profile = profileQuery.data as RitualProfile | undefined;
  const rooms = (roomsQuery.data || []) as readonly RitualRoom[];
  const refetchProfile = profileQuery.refetch;
  const refetchRooms = roomsQuery.refetch;
  const refetchWinnings = winningsQuery.refetch;
  const executor = executorsQuery.data?.find((service) => service.isValid)?.node.teeAddress as Address | undefined;
  const walletDeposit = walletDepositQuery.data ?? 0n;
  const hasJudgeDeposit = walletDeposit >= parseEther("0.31");
  const [resolveHash, setResolveHash] = useState<`0x${string}` | undefined>();
  const receipt = useWaitForTransactionReceipt({ hash: resolveHash, query: { enabled: Boolean(resolveHash) } });

  useEffect(() => {
    if (!resolveHash) return;
    if (receipt.isSuccess) {
      setAsyncState("COMPLETED");
      void refetchRooms();
      void refetchProfile();
      void refetchWinnings();
      toast.success("Verdict settled on Ritual.");
      return;
    }
    if (receipt.isError) {
      setAsyncState("ERROR");
      return;
    }
    const first = window.setTimeout(() => setAsyncState("COMMITTED"), 1_500);
    const second = window.setTimeout(() => setAsyncState("EXECUTING"), 4_000);
    const third = window.setTimeout(() => setAsyncState("SETTLING"), 12_000);
    return () => {
      window.clearTimeout(first);
      window.clearTimeout(second);
      window.clearTimeout(third);
    };
  }, [resolveHash, receipt.isSuccess, receipt.isError, refetchRooms, refetchProfile, refetchWinnings]);

  const runWrite = async (request: Record<string, unknown>, success: string) => {
    if (!walletAddress) return openWalletModal();
    await ensureArenaNetwork();
    const hash = await writeContractAsync(request as never);
    toast.info("Transaction sent to Ritual.");
    await new Promise((resolve) => setTimeout(resolve, 1_500));
    await Promise.all([profileQuery.refetch(), roomsQuery.refetch(), winningsQuery.refetch(), walletDepositQuery.refetch()]);
    toast.success(success);
    return hash;
  };

  const createProfile = async () => {
    try {
      await runWrite({ address: RITUAL_CLASH_CONTRACT_ADDRESS, abi: arenaAbi, functionName: "createProfile", args: [handle.trim()] }, "Profile created.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Profile creation failed.");
    }
  };
  const createRoom = async () => {
    try {
      await runWrite({
        address: RITUAL_CLASH_CONTRACT_ADDRESS,
        abi: arenaAbi,
        functionName: "createRoom",
        args: [mode, category.trim(), topic.trim()],
        value: parseEther(stake || "0"),
      }, "Room opened.");
      setTopic("");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Room creation failed.");
    }
  };
  const joinRoom = async (room: RitualRoom) => {
    try {
      await runWrite({ address: RITUAL_CLASH_CONTRACT_ADDRESS, abi: arenaAbi, functionName: "joinRoom", args: [room.id], value: room.stake }, "Room joined.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not join.");
    }
  };
  const submitEntry = async (room: RitualRoom) => {
    try {
      await runWrite({
        address: RITUAL_CLASH_CONTRACT_ADDRESS,
        abi: arenaAbi,
        functionName: "submitEntry",
        args: [room.id, entries[room.id.toString()]?.trim() || ""],
      }, "Entry locked on-chain.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Submission failed.");
    }
  };
  const depositForAI = async () => {
    try {
      await runWrite({ address: RITUAL_WALLET, abi: ritualWalletAbi, functionName: "deposit", args: [100_000n], value: parseEther("0.5") }, "RitualWallet funded for AI judging.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Deposit failed.");
    }
  };
  const resolveRoom = async (room: RitualRoom) => {
    if (!walletAddress) return openWalletModal();
    if (!executor) return toast.error("No valid Ritual LLM executor is currently available.");
    if (senderLockQuery.data) return toast.error("This wallet already has an async Ritual job pending.");
    if (!hasJudgeDeposit) return toast.error("Deposit at least 0.31 RITUAL in RitualWallet first.");
    try {
      await ensureArenaNetwork();
      setActiveRoom(room.id);
      setAsyncState("CONFIRMING");
      const data = encodeFunctionData({ abi: arenaAbi, functionName: "resolveRoom", args: [room.id, executor] });
      const hash = await sendTransactionAsync({ to: RITUAL_CLASH_CONTRACT_ADDRESS, data, gas: 3_000_000n });
      setResolveHash(hash);
      setAsyncState("SUBMITTED");
    } catch (error) {
      setAsyncState("ERROR");
      toast.error(error instanceof Error ? error.message : "Resolution failed.");
    }
  };

  const connected = Boolean(walletAddress);
  const hasProfile = Boolean(profile?.[5]);
  const claimable = winningsQuery.data ?? 0n;
  const stats = useMemo(() => profile ? `${profile[1]}W / ${profile[2]}L / ${profile[3]}T · ${profile[4]} XP` : "", [profile]);

  return <div className="app-page">
    <Header />
    <main id="main" className="app-container pb-20 pt-28 sm:pt-32">
      <div className="grid-bg pointer-events-none absolute inset-x-0 top-0 h-[720px]"/>
      <section className="relative mb-10 grid gap-6 lg:grid-cols-[1.4fr_0.6fr] lg:items-end">
        <div className="py-5">
          <p className="eyebrow"><span className="status-dot"/> Ritual Chain · TEE verified</p>
          <h1 className="text-balance mt-5 font-heading text-4xl font-black leading-[0.98] tracking-[-0.04em] text-white sm:text-5xl md:text-6xl">
            THE ON-CHAIN<br/><span className="text-white/35">AI BATTLEGROUND</span>
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-slate-500 sm:text-lg">
            Open a challenge, lock both entries, and let Ritual's verified LLM settle the result and wager.
          </p>
        </div>

        <div className="surface p-5">
          <div className="flex items-start justify-between">
            <div><p className="text-[10px] uppercase tracking-[0.22em] text-slate-600">AI execution balance</p><p className="mt-2 font-mono text-2xl text-white">{formatEther(walletDeposit)} <span className="text-sm text-slate-500">RITUAL</span></p></div>
            <div className="grid h-10 w-10 place-items-center rounded-xl border border-white/15 bg-white/[0.05]"><WalletCards className="h-4.5 w-4.5 text-white"/></div>
          </div>
          <div className="mt-4 flex items-center justify-between text-xs"><span className="text-slate-600">Required escrow</span><span className="text-white/65">{hasJudgeDeposit ? "Ready" : "0.31 RITUAL"}</span></div>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/[0.05]"><div className={"h-full rounded-full bg-white transition-all " + (hasJudgeDeposit ? "w-full" : "w-1/4")}/></div>
          {!hasJudgeDeposit && connected && <Button variant="wallet" className="mt-4 w-full" onClick={depositForAI}>Fund with 0.5 RITUAL</Button>}
          {senderLockQuery.data && <p className="mt-3 flex items-center gap-2 text-xs text-white/60"><LoaderCircle className="h-3.5 w-3.5 animate-spin"/> AI settlement in progress</p>}
        </div>
      </section>

      {!coreContractConfigured && <div role="alert" className="surface mb-8 border-white/20 p-5 text-sm text-white/65">Contract configuration is missing.</div>}

      {!connected && <section className="surface mb-10 overflow-hidden p-8 sm:p-10">
        <div className="grid gap-8 md:grid-cols-[1fr_auto] md:items-center">
          <div><p className="eyebrow">Wallet required</p><h2 className="mt-4 font-heading text-2xl text-white sm:text-3xl">Connect to enter the protocol</h2><p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">Your wallet is your identity, profile, match signer, and destination for all claimable rewards.</p></div>
          <Button variant="wallet" size="lg" onClick={openWalletModal}>Connect wallet <ArrowRight/></Button>
        </div>
      </section>}

      {connected && coreContractConfigured && !hasProfile && <section className="surface mb-10 p-6 sm:p-8">
        <div className="flex items-start gap-4">
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-white/15 bg-white/[0.05]"><UserRound className="h-5 w-5 text-white"/></div>
          <div className="flex-1"><h2 className="font-heading text-2xl text-white">Create your on-chain identity</h2><p className="mt-2 text-sm text-slate-500">Choose a public handle for the ladder and every future verdict.</p>
            <div className="mt-5 flex max-w-2xl flex-col gap-3 sm:flex-row"><Input value={handle} maxLength={24} onChange={(event) => setHandle(event.target.value)} placeholder="Handle · 3–24 characters"/><GlassButton disabled={writePending || handle.trim().length < 3} onClick={createProfile}>Create profile</GlassButton></div>
          </div>
        </div>
      </section>}

      {hasProfile && <>
        <section className="mb-6 grid gap-4 md:grid-cols-3">
          <StatCard icon={UserRound} label="Player" value={profile?.[0] || "—"} detail={stats} accent="green"/>
          <StatCard icon={Coins} label="Claimable rewards" value={`${formatEther(claimable)} RITUAL`} detail={claimable > 0n ? "Ready to withdraw" : "No unsettled rewards"} action={claimable > 0n ? <Button variant="wallet" size="sm" onClick={() => runWrite({ address: RITUAL_CLASH_CONTRACT_ADDRESS, abi: arenaAbi, functionName: "withdrawWinnings" }, "Winnings withdrawn.")}>Withdraw</Button> : undefined}/>
          <StatCard icon={BrainCircuit} label="AI judge" value="GLM-4.7-FP8" detail="Short async · TEE verified" accent="pink"/>
        </section>

        <section className="surface mb-12 p-6 sm:p-8">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div><p className="eyebrow"><Plus className="h-3 w-3"/> New match</p><h2 className="mt-4 font-heading text-2xl text-white">Open a challenge room</h2></div>
            <p className="max-w-sm text-sm leading-6 text-slate-600">Your rival must join with the same stake before either entry can be locked.</p>
          </div>
          <div className="mt-7 grid gap-4 md:grid-cols-2 lg:grid-cols-6">
            <Field label="Game mode"><select className={selectClass} value={mode} onChange={(event) => setMode(Number(event.target.value))}>{MODE_LABELS.map((label, index) => <option value={index} key={label}>{label}</option>)}</select></Field>
            <Field label="Category"><Input value={category} onChange={(event) => setCategory(event.target.value)} placeholder="Tech"/></Field>
            <div className="md:col-span-2 lg:col-span-3"><Field label="Challenge topic"><Input value={topic} maxLength={240} onChange={(event) => setTopic(event.target.value)} placeholder="State the claim, target, or prompt"/></Field></div>
            <Field label="Stake"><Input value={stake} onChange={(event) => setStake(event.target.value)} inputMode="decimal" placeholder="0.00 RITUAL"/></Field>
          </div>
          <Button variant="wallet" className="mt-6" disabled={writePending || topic.trim().length < 8} onClick={createRoom}><Swords/> Create on-chain</Button>
        </section>
      </>}

      <section>
        <div className="mb-6 flex items-end justify-between">
          <div><p className="eyebrow">Live protocol</p><h2 className="mt-4 font-heading text-3xl text-white">Challenge rooms</h2></div>
          <span className="rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider text-slate-500">{rooms.length} recent</span>
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          {rooms.map((room) => {
            const mine = walletAddress?.toLowerCase() === room.creator.toLowerCase();
            const rival = walletAddress?.toLowerCase() === room.opponent.toLowerCase();
            const canSubmit = room.status === 1 && (mine || rival) && !(mine ? room.creatorSubmission : room.opponentSubmission);
            return <article key={room.id.toString()} className="surface group p-5 transition-colors hover:border-white/[0.13] sm:p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0"><p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/55">{MODE_LABELS[room.mode]} · Room #{room.id.toString()}</p><h3 className="text-balance mt-3 font-heading text-xl leading-snug text-white">{room.topic}</h3><p className="mt-2 text-xs text-slate-600">{room.category} · {formatEther(room.stake)} RITUAL each</p></div>
                <StatusPill status={room.status}/>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3">
                <Seat label="OWNER" address={formatAddress(room.creator)} locked={Boolean(room.creatorSubmission)} color="green"/>
                <Seat label="OPPONENT" address={room.opponent === ZERO_ADDRESS ? "Open seat" : formatAddress(room.opponent)} locked={Boolean(room.opponentSubmission)} color="pink"/>
              </div>

              {room.status === 0 && !mine && hasProfile && <Button variant="wallet" className="mt-5 w-full" onClick={() => joinRoom(room)}>Join for {formatEther(room.stake)} RITUAL <ArrowRight/></Button>}
              {canSubmit && <div className="mt-5 flex flex-col gap-2 sm:flex-row"><Input value={entries[room.id.toString()] || ""} onChange={(event) => setEntries((all) => ({ ...all, [room.id.toString()]: event.target.value }))} placeholder="Your final on-chain entry"/><Button variant="wallet" onClick={() => submitEntry(room)}>Lock entry</Button></div>}
              {room.status === 2 && <Button variant="outline" className="mt-5 w-full border-white/20 text-white hover:border-white/40 hover:bg-white/[0.07]" disabled={Boolean(senderLockQuery.data)} onClick={() => resolveRoom(room)}><BrainCircuit/> Request verified verdict</Button>}

              {activeRoom === room.id && asyncState !== "IDLE" && <div role="status" className="glass-panel mt-5 rounded-xl p-4 text-sm">
                <div className="flex items-center gap-2 text-white/70">{!(["COMPLETED", "ERROR"].includes(asyncState)) && <LoaderCircle className="h-4 w-4 animate-spin"/>}{asyncState === "COMPLETED" && <ShieldCheck className="h-4 w-4 text-white"/>}<span className="font-semibold">{asyncState}</span></div>
                {resolveHash && <p className="mt-2 break-all font-mono text-[9px] leading-4 text-slate-600">{resolveHash}</p>}
              </div>}

              {room.status === 3 && <div className="glass-panel mt-5 rounded-xl p-4">
                <p className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-widest text-white/65"><CheckCircle2 className="h-3.5 w-3.5"/> TEE verified verdict</p>
                <p className="mt-3 font-mono text-sm text-slate-200">{room.verdict.trim()} · Winner {room.winner === ZERO_ADDRESS ? "TIE" : formatAddress(room.winner)}</p>
              </div>}
              {room.resolutionError && room.status === 2 && <p className="mt-4 text-xs text-white/45">Last attempt: {room.resolutionError}</p>}
            </article>;
          })}

          {!rooms.length && <div className="surface-soft grid min-h-64 place-items-center p-10 text-center lg:col-span-2">
            <div><div className="mx-auto grid h-12 w-12 place-items-center rounded-xl border border-white/[0.08] bg-white/[0.03]"><Swords className="h-5 w-5 text-slate-600"/></div><h3 className="mt-5 font-heading text-lg text-slate-300">No rooms yet</h3><p className="mt-2 text-sm text-slate-600">Create the first on-chain challenge when your profile is ready.</p></div>
          </div>}
        </div>
      </section>
    </main>
  </div>;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block"><span className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-600">{label}</span>{children}</label>;
}

function StatCard({ icon: Icon, label, value, detail, accent, action }: { icon: typeof Trophy; label: string; value: string; detail: string; accent?: "green" | "pink"; action?: React.ReactNode }) {
  const color = accent === "pink" ? "border-white/20 bg-white/[0.07] text-white" : "border-white/15 bg-white/[0.05] text-white";
  return <div className="surface p-5"><div className="flex items-start justify-between"><div className={`grid h-10 w-10 place-items-center rounded-xl border ${color}`}><Icon className="h-4.5 w-4.5"/></div>{action}</div><p className="mt-5 text-[10px] uppercase tracking-[0.2em] text-slate-600">{label}</p><p className="mt-2 truncate font-heading text-lg text-white">{value}</p><p className="mt-1 font-mono text-[10px] text-slate-600">{detail}</p></div>;
}

function Seat({ label, address, locked, color }: { label: string; address: string; locked: boolean; color: "green" | "pink" }) {
  const accent = color === "green" ? "text-white/65" : "text-white";
  return <div className="glass-panel rounded-xl p-3.5"><div className="flex items-center justify-between"><span className={`text-[9px] font-semibold tracking-widest ${accent}`}>{label}</span><span className={`h-1.5 w-1.5 rounded-full ${locked ? "bg-white" : "bg-slate-700"}`}/></div><p className="mt-3 truncate font-mono text-xs text-slate-300">{address}</p><p className="mt-2 text-[10px] text-slate-600">{locked ? "Entry locked ✓" : "Awaiting entry"}</p></div>;
}

function StatusPill({ status }: { status: number }) {
  const colors = status === 3 ? "border-white/25 bg-white/[0.09] text-white" : status === 2 ? "border-white/20 bg-white/[0.06] text-white/75" : "border-white/15 bg-white/[0.035] text-white/50";
  return <span className={`shrink-0 rounded-full border px-2.5 py-1 text-[9px] font-semibold uppercase tracking-wider ${colors}`}>{STATUS_LABELS[status]}</span>;
}

function formatAddress(address: string) {
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}
