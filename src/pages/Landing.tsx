import { ArrowRight, ArrowUpRight, Check, ExternalLink } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { useArena } from "@/context/useArena";
import { RITUAL_CLASH_CONTRACT_ADDRESS, RITUAL_EXPLORER } from "@/lib/ritual";

const modes = [
  { id: "01", title: "Argue", meta: "Evidence / Reasoning", text: "Build the stronger case. The executor evaluates clarity, support, and internal consistency." },
  { id: "02", title: "Bluff", meta: "Persuasion / Strategy", text: "Sell the claim. Winning depends on the most convincing performance, not factual truth." },
  { id: "03", title: "Prompt duel", meta: "Precision / Control", text: "Compete against a shared target. The verified judge selects the more effective prompt." },
];

const lifecycle = [
  ["01", "Identity", "Create a permanent player handle on Ritual Chain."],
  ["02", "Room", "Set the mode, challenge, and optional native stake."],
  ["03", "Commit", "Both players lock one immutable final entry."],
  ["04", "Execute", "A registered TEE executor requests the LLM judgment."],
  ["05", "Settle", "The contract records the result, XP, and claimable pot."],
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
    <main id="main" className="pt-16">
      <section className="app-container">
        <div className="grid min-h-[calc(100vh-4rem)] border-x border-white/[0.12] lg:grid-cols-12">
          <div className="flex flex-col justify-between border-b border-white/[0.12] px-5 py-10 sm:px-10 sm:py-14 lg:col-span-8 lg:border-b-0 lg:border-r lg:px-14 lg:py-16">
            <div className="flex items-center justify-between gap-6">
              <p className="data-label">Ritual Clash / Competitive protocol</p>
              <p className="hidden font-mono text-[9px] uppercase tracking-[0.16em] text-white/25 sm:block">Chain ID 1979</p>
            </div>

            <div className="my-20 max-w-5xl lg:my-12">
              <p className="mb-7 font-mono text-[10px] uppercase tracking-[0.18em] text-white/40">Play the claim. Commit the answer.</p>
              <h1 className="text-balance font-heading text-[clamp(3.5rem,8vw,7.5rem)] font-medium leading-[0.82] tracking-[-0.065em] text-[#eeece4]">
                VERDICTS,<br/><span className="text-white/28">NOT PROMISES.</span>
              </h1>
              <p className="mt-9 max-w-2xl text-lg leading-8 text-white/42 sm:text-xl">
                Head-to-head AI games with native wagers, permanent records, and judgment executed by verified Ritual infrastructure.
              </p>
            </div>

            <div className="grid gap-5 border-t border-white/[0.12] pt-6 sm:grid-cols-3">
              <Fact index="A" label="State" value="Fully on-chain"/>
              <Fact index="B" label="Settlement" value="TEE verified"/>
              <Fact index="C" label="Custody" value="Contract enforced"/>
            </div>
          </div>

          <aside className="flex flex-col justify-between px-5 py-10 sm:px-10 sm:py-14 lg:col-span-4 lg:px-10 lg:py-16">
            <div>
              <div className="flex items-center justify-between border-b border-white/[0.14] pb-4">
                <span className="data-label">Live deployment</span>
                <span className="flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.14em] text-white/55"><span className="status-dot"/> Online</span>
              </div>
              <dl className="divide-y divide-white/[0.1]">
                <DeploymentRow label="Network" value="Ritual Chain"/>
                <DeploymentRow label="Executor" value="TEE Registry"/>
                <DeploymentRow label="Contract" value={`${RITUAL_CLASH_CONTRACT_ADDRESS.slice(0, 8)}…${RITUAL_CLASH_CONTRACT_ADDRESS.slice(-6)}`}/>
              </dl>
              <a href={`${RITUAL_EXPLORER}/address/${RITUAL_CLASH_CONTRACT_ADDRESS}`} target="_blank" rel="noreferrer" className="rule-link mt-5">
                Inspect deployment <ExternalLink className="h-3 w-3"/>
              </a>
            </div>

            <div className="mt-20 border-t border-white/[0.14] pt-8">
              <p className="max-w-sm text-sm leading-6 text-white/38">No account server. No private moderator. Your wallet signs every meaningful transition.</p>
              <div className="mt-7 flex flex-col gap-2 sm:flex-row lg:flex-col xl:flex-row">
                <Button variant="wallet" size="lg" className="flex-1 justify-between" onClick={enter}>Enter console <ArrowRight/></Button>
                <Button variant="outline" size="lg" onClick={() => document.getElementById("protocol")?.scrollIntoView({ behavior: "smooth" })}>Read protocol</Button>
              </div>
            </div>
          </aside>
        </div>
      </section>

      <section className="border-y border-white/[0.12] bg-[#0b0b0b]">
        <div className="app-container grid md:grid-cols-3">
          <Feature index="01" title="Equal stakes">Both players escrow the same native amount before either entry can settle.</Feature>
          <Feature index="02" title="Immutable entries">A final submission cannot be edited after it is committed to the room.</Feature>
          <Feature index="03" title="Pull payments">Rewards remain claimable on the contract until the winner withdraws.</Feature>
        </div>
      </section>

      <section className="app-container py-24 sm:py-32">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <p className="eyebrow">Game formats</p>
            <h2 className="mt-7 max-w-sm text-4xl font-medium leading-[0.95] tracking-[-0.045em] text-white sm:text-5xl">One contract.<br/><span className="text-white/30">Three disciplines.</span></h2>
          </div>
          <div className="border-t border-white/[0.14] lg:col-span-8">
            {modes.map((mode) => <article key={mode.id} className="group grid gap-5 border-b border-white/[0.14] py-7 transition-colors hover:bg-white/[0.025] sm:grid-cols-[48px_1fr_1.25fr_auto] sm:items-center sm:px-4">
              <span className="font-mono text-[10px] text-white/30">{mode.id}</span>
              <div><h3 className="text-2xl font-medium tracking-[-0.03em] text-white">{mode.title}</h3><p className="mt-1 font-mono text-[9px] uppercase tracking-[0.15em] text-white/28">{mode.meta}</p></div>
              <p className="text-sm leading-6 text-white/38">{mode.text}</p>
              <ArrowUpRight className="h-4 w-4 text-white/25 transition-colors group-hover:text-white"/>
            </article>)}
          </div>
        </div>
      </section>

      <section id="protocol" className="scroll-mt-20 border-y border-white/[0.12] bg-[#eeece4] text-black">
        <div className="app-container grid lg:grid-cols-12">
          <div className="border-black/15 py-16 lg:col-span-4 lg:border-r lg:py-24 lg:pr-12">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-black/45">Match lifecycle</p>
            <h2 className="mt-7 text-5xl font-medium leading-[0.9] tracking-[-0.055em] sm:text-6xl">FROM WALLET<br/>TO FINALITY.</h2>
            <p className="mt-7 max-w-sm text-base leading-7 text-black/55">Five explicit transitions. Every one visible, signed, and recoverable on-chain.</p>
          </div>
          <div className="border-t border-black/15 py-6 lg:col-span-8 lg:border-t-0 lg:py-12 lg:pl-12">
            {lifecycle.map(([number, title, text]) => <div key={number} className="grid gap-3 border-b border-black/15 py-6 sm:grid-cols-[44px_150px_1fr] sm:items-baseline">
              <span className="font-mono text-[10px] text-black/40">{number}</span>
              <h3 className="text-xl font-semibold">{title}</h3>
              <p className="text-sm leading-6 text-black/55">{text}</p>
            </div>)}
          </div>
        </div>
      </section>

      <section className="app-container py-20 sm:py-28">
        <div className="grid gap-10 border border-white/[0.14] p-7 sm:p-10 lg:grid-cols-[1fr_auto] lg:items-end">
          <div><p className="data-label">Ready / Ritual Chain</p><h2 className="mt-5 max-w-3xl text-4xl font-medium leading-[0.95] tracking-[-0.045em] text-white sm:text-6xl">Open the first room.<br/><span className="text-white/30">Make the record permanent.</span></h2></div>
          <Button variant="wallet" size="lg" onClick={enter}>Start a match <ArrowRight/></Button>
        </div>
      </section>

      <footer className="border-t border-white/[0.12] pb-20 md:pb-0">
        <div className="app-container flex flex-col gap-4 py-7 font-mono text-[9px] uppercase tracking-[0.14em] text-white/25 sm:flex-row sm:items-center sm:justify-between">
          <span>© 2026 Ritual Clash</span>
          <span className="flex items-center gap-2"><Check className="h-3 w-3"/> Powered by verified Ritual infrastructure</span>
        </div>
      </footer>
    </main>
  </div>;
}

function Fact({ index, label, value }: { index: string; label: string; value: string }) {
  return <div className="grid grid-cols-[24px_1fr] gap-2"><span className="font-mono text-[9px] text-white/25">{index}</span><div><p className="data-label">{label}</p><p className="mt-2 text-sm text-white/70">{value}</p></div></div>;
}

function DeploymentRow({ label, value }: { label: string; value: string }) {
  return <div className="flex items-center justify-between gap-4 py-4"><dt className="font-mono text-[9px] uppercase tracking-[0.14em] text-white/30">{label}</dt><dd className="font-mono text-[10px] text-white/65">{value}</dd></div>;
}

function Feature({ index, title, children }: { index: string; title: string; children: string }) {
  return <article className="border-b border-white/[0.12] py-8 last:border-b-0 md:border-b-0 md:border-r md:px-8 md:first:pl-0 md:last:border-r-0 md:last:pr-0">
    <div className="flex items-center justify-between"><span className="font-mono text-[9px] text-white/25">{index}</span><Check className="h-3.5 w-3.5 text-white/45"/></div>
    <h2 className="mt-8 text-xl font-medium text-white">{title}</h2>
    <p className="mt-3 text-sm leading-6 text-white/35">{children}</p>
  </article>;
}
