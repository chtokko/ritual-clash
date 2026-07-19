import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ArenaProvider } from "@/context/ArenaProvider";
import { wagmiAdapter } from "@/lib/appkit";
import Landing from "@/pages/Landing";
import Leaderboard from "@/pages/Leaderboard";
import RitualArena from "@/pages/RitualArena";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();
export default function App() {
  return <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <WagmiProvider config={wagmiAdapter.wagmiConfig}>
        <ArenaProvider>
          <Sonner/>
          <BrowserRouter>
            <div className="relative min-h-screen bg-[#080808]">
              <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-[#080808]" aria-hidden="true">
                <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.018)_1px,transparent_1px)] bg-[size:80px_100%]"/>
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_72%_10%,rgba(255,255,255,0.045),transparent_26rem)]"/>
              </div>
              <div className="relative z-10 min-h-screen">
                <a href="#main" className="sr-only focus:not-sr-only">Skip to content</a>
                <Routes>
                  <Route path="/" element={<Landing/>}/>
                  <Route path="/arena" element={<RitualArena/>}/>
                  <Route path="/leaderboard" element={<Leaderboard/>}/>
                  <Route path="*" element={<NotFound/>}/>
                </Routes>
              </div>
            </div>
          </BrowserRouter>
        </ArenaProvider>
      </WagmiProvider>
    </TooltipProvider>
  </QueryClientProvider>;
}
