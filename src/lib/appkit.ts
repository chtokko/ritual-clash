import { createAppKit } from "@reown/appkit/react";
import type { AppKitNetwork } from "@reown/appkit/networks";
import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";
import { arenaEnv } from "@/lib/env";
import { ritualChain } from "@/lib/ritualChain";

const LOCAL_PROJECT_ID = "b56e18d47c72ab683b10814fe9495694";
const projectId = arenaEnv.reownProjectId || LOCAL_PROJECT_ID;

const networks = [ritualChain as AppKitNetwork] as [AppKitNetwork, ...AppKitNetwork[]];
const appUrl = typeof window === "undefined" ? "http://localhost:5173" : window.location.origin;

export const wagmiAdapter = new WagmiAdapter({ projectId, networks, ssr: false });

createAppKit({
  adapters: [wagmiAdapter],
  projectId,
  networks,
  defaultNetwork: ritualChain,
  metadata: {
    name: "Ritual Clash",
    description: "Competitive on-chain AI games powered by Ritual.",
    url: appUrl,
    icons: [`${appUrl}/favicon.svg`],
  },
  features: { analytics: false, socials: false, email: false },
});
