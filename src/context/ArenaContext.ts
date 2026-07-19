import { createContext } from "react";
import type { Address } from "viem";
import type { BrowserEthereumProvider } from "@/lib/ethereum";

export type NetworkStatus = "unknown" | "ready" | "wrong-network";

export interface ArenaContextValue {
  walletAddress: Address | null;
  provider: BrowserEthereumProvider | null;
  walletReady: boolean;
  openWalletModal: () => Promise<void>;
  disconnectWallet: () => Promise<void>;
  ensureArenaNetwork: () => Promise<void>;
  walletChainId: string | null;
  walletArenaStatus: NetworkStatus;
  coreContractAddress: string;
  coreContractConfigured: boolean;
}

export const ArenaContext = createContext<ArenaContextValue | null>(null);
