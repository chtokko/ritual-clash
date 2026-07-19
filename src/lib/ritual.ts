import type { Address } from "viem";
import { arenaEnv } from "@/lib/env";

export { ritualPublicClient } from "@/lib/ritualChain";

export const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000" as const;
export const RITUAL_CLASH_CONTRACT_ADDRESS = (arenaEnv.ritualClashContractAddress || ZERO_ADDRESS) as Address;
export const RITUAL_WALLET = "0x532F0dF0896F353d8C3DD8cc134e8129DA2a3948" as const;
export const ASYNC_JOB_TRACKER = "0xC069FFCa0389f44eCA2C626e55491b0ab045AEF5" as const;
export const TEE_SERVICE_REGISTRY = "0x9644e8562cE0Fe12b4deeC4163c064A8862Bf47F" as const;
export const RITUAL_EXPLORER = "https://explorer.ritualfoundation.org";

const roomComponents = [
  { name: "id", type: "uint256" }, { name: "mode", type: "uint8" }, { name: "status", type: "uint8" },
  { name: "creator", type: "address" }, { name: "opponent", type: "address" }, { name: "winner", type: "address" },
  { name: "stake", type: "uint128" }, { name: "createdAt", type: "uint64" },
  { name: "category", type: "string" }, { name: "topic", type: "string" },
  { name: "creatorSubmission", type: "string" }, { name: "opponentSubmission", type: "string" },
  { name: "verdict", type: "string" }, { name: "resolutionError", type: "string" },
] as const;

export const arenaAbi = [
  { type: "function", name: "profiles", stateMutability: "view", inputs: [{ name: "player", type: "address" }], outputs: [
    { name: "handle", type: "string" }, { name: "wins", type: "uint64" }, { name: "losses", type: "uint64" },
    { name: "ties", type: "uint64" }, { name: "xp", type: "uint128" }, { name: "exists", type: "bool" },
  ] },
  { type: "function", name: "createProfile", stateMutability: "nonpayable", inputs: [{ name: "handle", type: "string" }], outputs: [] },
  { type: "function", name: "renameProfile", stateMutability: "nonpayable", inputs: [{ name: "handle", type: "string" }], outputs: [] },
  { type: "function", name: "createRoom", stateMutability: "payable", inputs: [
    { name: "mode", type: "uint8" }, { name: "category", type: "string" }, { name: "topic", type: "string" },
  ], outputs: [{ name: "roomId", type: "uint256" }] },
  { type: "function", name: "joinRoom", stateMutability: "payable", inputs: [{ name: "roomId", type: "uint256" }], outputs: [] },
  { type: "function", name: "submitEntry", stateMutability: "nonpayable", inputs: [{ name: "roomId", type: "uint256" }, { name: "submission", type: "string" }], outputs: [] },
  { type: "function", name: "resolveRoom", stateMutability: "nonpayable", inputs: [{ name: "roomId", type: "uint256" }, { name: "executor", type: "address" }], outputs: [{ name: "resolved", type: "bool" }] },
  { type: "function", name: "cancelRoom", stateMutability: "nonpayable", inputs: [{ name: "roomId", type: "uint256" }], outputs: [] },
  { type: "function", name: "withdrawWinnings", stateMutability: "nonpayable", inputs: [], outputs: [] },
  { type: "function", name: "claimableWinnings", stateMutability: "view", inputs: [{ name: "player", type: "address" }], outputs: [{ type: "uint256" }] },
  { type: "function", name: "getRecentRooms", stateMutability: "view", inputs: [{ name: "limit", type: "uint256" }], outputs: [{ name: "result", type: "tuple[]", components: roomComponents }] },
  { type: "function", name: "getPlayers", stateMutability: "view", inputs: [], outputs: [{ type: "address[]" }] },
] as const;

export const ritualWalletAbi = [
  { type: "function", name: "balanceOf", stateMutability: "view", inputs: [{ name: "user", type: "address" }], outputs: [{ type: "uint256" }] },
  { type: "function", name: "lockUntil", stateMutability: "view", inputs: [{ name: "user", type: "address" }], outputs: [{ type: "uint256" }] },
  { type: "function", name: "deposit", stateMutability: "payable", inputs: [{ name: "lockDuration", type: "uint256" }], outputs: [] },
] as const;

export const trackerAbi = [{
  type: "function", name: "hasPendingJobForSender", stateMutability: "view",
  inputs: [{ name: "sender", type: "address" }], outputs: [{ type: "bool" }],
}] as const;

export const registryAbi = [{
  type: "function", name: "getServicesByCapability", stateMutability: "view",
  inputs: [{ name: "capability", type: "uint8" }, { name: "checkValidity", type: "bool" }],
  outputs: [{ name: "services", type: "tuple[]", components: [
    { name: "node", type: "tuple", components: [
      { name: "paymentAddress", type: "address" }, { name: "teeAddress", type: "address" },
      { name: "teeType", type: "uint8" }, { name: "publicKey", type: "bytes" },
      { name: "endpoint", type: "string" }, { name: "certPubKeyHash", type: "bytes32" }, { name: "capability", type: "uint8" },
    ] }, { name: "isValid", type: "bool" }, { name: "workloadId", type: "bytes32" },
  ] }],
}] as const;

export type RitualProfile = readonly [string, bigint, bigint, bigint, bigint, boolean];
export interface RitualRoom {
  id: bigint; mode: number; status: number; creator: Address; opponent: Address; winner: Address;
  stake: bigint; createdAt: bigint; category: string; topic: string; creatorSubmission: string;
  opponentSubmission: string; verdict: string; resolutionError: string;
}

export const MODE_LABELS = ["Argue", "Bluff", "Prompt Duel"] as const;
export const STATUS_LABELS = ["Waiting for rival", "Accepting entries", "Ready for AI judge", "Resolved", "Cancelled"] as const;
