import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AsciiArt } from "@/components/ui/m-ascii";
import { ArenaProvider } from "@/context/ArenaContext";
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
            <div className="relative min-h-screen bg-black">
              <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-black" aria-hidden="true">
                <AsciiArt className="h-full w-full scale-[1.02] grayscale opacity-35 contrast-125"/>
                <div className="absolute inset-0 bg-black/65"/>
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_18%,transparent_0%,rgba(0,0,0,0.34)_45%,rgba(0,0,0,0.9)_100%)]"/>
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
