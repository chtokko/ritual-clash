import { createPublicClient, defineChain, http } from "viem";

export const RITUAL_RPC_URL = "https://rpc.ritualfoundation.org";

export const ritualChain = defineChain({
  id: 1979,
  name: "Ritual",
  nativeCurrency: { name: "RITUAL", symbol: "RITUAL", decimals: 18 },
  rpcUrls: { default: { http: [RITUAL_RPC_URL], webSocket: ["wss://rpc.ritualfoundation.org/ws"] } },
  blockExplorers: { default: { name: "Ritual Explorer", url: "https://explorer.ritualfoundation.org" } },
  contracts: { multicall3: { address: "0x5577Ea679673Ec7508E9524100a188E7600202a3" } },
});

// Public protocol data must remain available before a wallet is connected.
export const ritualPublicClient = createPublicClient({
  chain: ritualChain,
  transport: http(RITUAL_RPC_URL),
});
