import { useMemo, type ReactNode } from "react";
import { useAppKit, useAppKitAccount, useAppKitNetwork, useAppKitProvider, useDisconnect } from "@reown/appkit/react";
import type { Provider } from "@reown/appkit/react";
import { getAddress, type Address } from "viem";
import { arenaEnv } from "@/lib/env";
import type { BrowserEthereumProvider } from "@/lib/ethereum";
import { ArenaContext, type NetworkStatus } from "@/context/ArenaContext";

export function ArenaProvider({ children }: { children: ReactNode }) {
  const { open } = useAppKit();
  const { disconnect } = useDisconnect();
  const { address, status } = useAppKitAccount({ namespace: "eip155" });
  const { chainId } = useAppKitNetwork();
  const { walletProvider } = useAppKitProvider<Provider>("eip155");
  const provider = (walletProvider as BrowserEthereumProvider | undefined) ?? null;
  const walletAddress = useMemo(() => address ? getAddress(address as Address) : null, [address]);
  const numericChainId = typeof chainId === "number" ? chainId : Number(String(chainId).split(":").pop());
  const walletArenaStatus: NetworkStatus = !numericChainId
    ? "unknown"
    : numericChainId === 1979 ? "ready" : "wrong-network";

  async function openWalletModal() {
    await open({ view: "Connect", namespace: "eip155" });
  }

  async function ensureArenaNetwork() {
    if (!provider) throw new Error("Connect a wallet first.");
    try {
      await provider.request({ method: "wallet_switchEthereumChain", params: [{ chainId: "0x7bb" }] });
    } catch (error) {
      if ((error as { code?: number }).code !== 4902) throw error;
      await provider.request({ method: "wallet_addEthereumChain", params: [{
        chainId: "0x7bb",
        chainName: "Ritual",
        nativeCurrency: { name: "RITUAL", symbol: "RITUAL", decimals: 18 },
        rpcUrls: ["https://rpc.ritualfoundation.org"],
        blockExplorerUrls: ["https://explorer.ritualfoundation.org"],
      }] });
    }
  }

  return <ArenaContext.Provider value={{
    walletAddress,
    provider,
    walletReady: status !== "connecting" && status !== "reconnecting",
    openWalletModal,
    disconnectWallet: async () => { await disconnect({ namespace: "eip155" }); },
    ensureArenaNetwork,
    walletChainId: numericChainId ? `0x${numericChainId.toString(16)}` : null,
    walletArenaStatus,
    coreContractAddress: arenaEnv.ritualClashContractAddress,
    coreContractConfigured: Boolean(arenaEnv.ritualClashContractAddress),
  }}>{children}</ArenaContext.Provider>;
}
