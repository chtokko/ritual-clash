import { motion } from "framer-motion";
import {
  BrainCircuit,
  CheckCircle2,
  Coins,
  Cpu,
  LockKeyhole,
  MessageSquareText,
  ShieldCheck,
  Swords,
  Trophy,
  UserPlus,
  WalletCards,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import { BackgroundPaths } from "@/components/ui/background-paths";
import { Button } from "@/components/ui/button";
import { useArena } from "@/context/useArena";

const features = [
  { icon: BrainCircuit, title: "Verified AI judgment", text: "A Ritual TEE executor judges the locked entries and returns a result the contract can verify." },
  { icon: Coins, title: "Native wagers", text: "Both players escrow the same RITUAL stake. The winner claims the complete on-chain pot." },
  { icon: ShieldCheck, title: "No private backend", text: "Profiles, entries, XP, payouts, and standings are stored directly on Ritual." },
];

const modes = [
  { number: "01", title: "ARGUE", text: "Make the strongest case. Evidence and reasoning decide the verdict." },
  { number: "02", title: "BLUFF", text: "Sell the claim. The most convincing performance wins the room." },
  { number: "03", title: "PROMPT DUEL", text: "Compete against one target. The AI judge selects the better output." },
];

const tutorialSteps = [
  { icon: WalletCards, title: "Connect to Ritual", text: "Connect your wallet and approve Ritual Chain, chain ID 1979." },
  { icon: LockKeyhole, title: "Fund the AI escrow", text: "Deposit about 0.31 RITUAL into RitualWallet for verified execution." },
  { icon: UserPlus, title: "Create your profile", text: "Choose an on-chain handle for your record, XP, and rewards." },
  { icon: Swords, title: "Open or join a match", text: "Choose a mode, set the challenge and stake, then match with a rival." },
  { icon: MessageSquareText, title: "Lock both entries", text: "Both players submit one final answer that cannot be edited." },
  { icon: Cpu, title: "Settle the verdict", text: "The TEE executor judges, updates XP, and unlocks the winner's pot." },
];

export default function Landing() {
  const navigate = useNavigate();
  const { walletAddress, openWalletModal } = useArena();
  const enter = async () => {
    if (!walletAddress) await openWalletModal();
    else navigate("/arena");
  };

  return <div className="app-page">
    <Header/>
    <main id="main">
      <BackgroundPaths
        title="PLAY ARGUE SETTLE"
        eyebrow="Live on Ritual · Chain 1979"
        description="Competitive AI games with native wagers, permanent reputation, and verdicts executed by verified Ritual infrastructure."
        primaryLabel="Enter Ritual Clash"
        onPrimaryAction={enter}
        secondaryLabel="How it works"
        onSecondaryAction={() => document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" })}
      />

      <div className="app-container">
        <section className="grid gap-4 pb-24 md:grid-cols-3">
          {features.map(({ icon: Icon, title, text }, index) => <motion.article
            key={title}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.07 }}
            className="surface group p-6 transition-all duration-300 hover:-translate-y-1 hover:border-white/20"
          >
            <div className="grid h-11 w-11 place-items-center rounded-xl border border-white/15 bg-white/[0.05] text-white"><Icon className="h-5 w-5"/></div>
            <h2 className="mt-6 font-heading text-lg text-white">{title}</h2>
            <p className="mt-3 text-sm leading-6 text-white/35">{text}</p>
          </motion.article>)}
        </section>

        <section className="border-y border-white/[0.08] py-24">
          <div className="grid gap-10 lg:grid-cols-[0.7fr_1.3fr] lg:items-end">
            <div><p className="eyebrow">Three game formats</p><h2 className="text-balance mt-5 font-heading text-4xl tracking-[-0.04em] text-white sm:text-6xl">ONE PROTOCOL.<br/><span className="text-white/35">THREE WAYS TO WIN.</span></h2></div>
            <p className="max-w-xl text-base leading-7 text-white/35 lg:ml-auto">Every mode follows the same transparent lifecycle: equal stakes, immutable entries, verified AI judgment, and contract-enforced rewards.</p>
          </div>
          <div className="glass-panel mt-12 grid gap-px overflow-hidden rounded-2xl lg:grid-cols-3">
            {modes.map((mode) => <article key={mode.title} className="group bg-black/25 p-7 backdrop-blur-lg transition-colors hover:bg-white/[0.05]">
              <div className="flex items-center justify-between"><span className="font-mono text-[10px] text-white/25">{mode.number}</span><Swords className="h-4 w-4 text-white/25 transition-colors group-hover:text-white"/></div>
              <h3 className="mt-12 font-heading text-3xl text-white">{mode.title}</h3>
              <p className="mt-4 text-sm leading-6 text-white/35">{mode.text}</p>
            </article>)}
          </div>
        </section>

        <section id="how-it-works" className="scroll-mt-28 py-24">
          <div className="flex flex-col justify-between gap-8 md:flex-row md:items-end">
            <div><p className="eyebrow">Player tutorial</p><h2 className="text-balance mt-5 font-heading text-4xl tracking-[-0.04em] text-white sm:text-6xl">FROM WALLET<br/><span className="text-white/35">TO VERDICT.</span></h2></div>
            <p className="max-w-md text-base leading-7 text-white/35">No account, server, or hidden moderator. Your wallet signs every meaningful step.</p>
          </div>

          <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {tutorialSteps.map(({ icon: Icon, title, text }, index) => <motion.article
              key={title}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ delay: index * 0.05 }}
              className="surface-soft group p-6 transition-colors hover:border-white/20 hover:bg-white/[0.045]"
            >
              <div className="flex items-start justify-between"><div className="grid h-11 w-11 place-items-center rounded-xl border border-white/15 bg-white/[0.05]"><Icon className="h-5 w-5 text-white"/></div><span className="font-mono text-[10px] text-white/20">0{index + 1}</span></div>
              <h3 className="mt-7 font-heading text-lg text-white">{title}</h3>
              <p className="mt-3 text-sm leading-6 text-white/35">{text}</p>
            </motion.article>)}
          </div>

          <div className="surface mt-6 grid gap-5 p-6 md:grid-cols-[auto_1fr_auto] md:items-center">
            <div className="grid h-12 w-12 place-items-center rounded-xl border border-white/15 bg-white/[0.05]"><Trophy className="h-5 w-5 text-white"/></div>
            <div><h3 className="font-heading text-lg text-white">Ready for the first verified verdict?</h3><p className="mt-1 flex items-center gap-2 text-sm text-white/35"><CheckCircle2 className="h-3.5 w-3.5"/> One AI settlement at a time per wallet.</p></div>
            <Button variant="wallet" onClick={enter}>Start playing</Button>
          </div>
        </section>

        <footer className="flex flex-col gap-4 border-t border-white/[0.08] py-8 text-xs text-white/25 sm:flex-row sm:items-center sm:justify-between">
          <span>© Ritual Clash · Powered by Ritual AI</span>
          <button onClick={() => navigate("/leaderboard")} className="text-left transition-colors hover:text-white">View on-chain ladder</button>
        </footer>
      </div>
    </main>
  </div>;
}
