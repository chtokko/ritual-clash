import { createPublicClient, defineChain, http } from "viem";

const chain = defineChain({
  id: 1979,
  name: "Ritual",
  nativeCurrency: { name: "RITUAL", symbol: "RITUAL", decimals: 18 },
  rpcUrls: { default: { http: [process.env.RITUAL_RPC_URL || "https://rpc.ritualfoundation.org"] } },
});
const client = createPublicClient({ chain, transport: http() });
const registry = "0x9644e8562cE0Fe12b4deeC4163c064A8862Bf47F";
const wallet = "0x532F0dF0896F353d8C3DD8cc134e8129DA2a3948";
const verdictAddress = process.argv[2];
const registryAbi = [{
  type: "function", name: "getServicesByCapability", stateMutability: "view",
  inputs: [{ type: "uint8" }, { type: "bool" }], outputs: [{ type: "tuple[]", components: [
    { name: "node", type: "tuple", components: [
      { name: "paymentAddress", type: "address" }, { name: "teeAddress", type: "address" }, { name: "teeType", type: "uint8" },
      { name: "publicKey", type: "bytes" }, { name: "endpoint", type: "string" }, { name: "certPubKeyHash", type: "bytes32" }, { name: "capability", type: "uint8" },
    ] }, { name: "isValid", type: "bool" }, { name: "workloadId", type: "bytes32" },
  ] }],
}];

const [chainId, block, registryCode, walletCode, services] = await Promise.all([
  client.getChainId(), client.getBlockNumber(), client.getCode({ address: registry }), client.getCode({ address: wallet }),
  client.readContract({ address: registry, abi: registryAbi, functionName: "getServicesByCapability", args: [1, true] }),
]);
if (chainId !== 1979) throw new Error(`Unexpected chain id ${chainId}`);
if (!registryCode || registryCode === "0x" || !walletCode || walletCode === "0x") throw new Error("Missing Ritual system contract bytecode");
const valid = services.filter((service) => service.isValid && service.node.capability === 1);
if (!valid.length) throw new Error("No valid LLM executor available");

let verdict = null;
if (verdictAddress) {
  const verdictAbi = [
    { type: "function", name: "nextRoomId", stateMutability: "view", inputs: [], outputs: [{ type: "uint256" }] },
    { type: "function", name: "getPlayers", stateMutability: "view", inputs: [], outputs: [{ type: "address[]" }] },
    { type: "function", name: "llmPrecompile", stateMutability: "view", inputs: [], outputs: [{ type: "address" }] },
  ];
  const [code, nextRoomId, players, llmPrecompile] = await Promise.all([
    client.getCode({ address: verdictAddress }),
    client.readContract({ address: verdictAddress, abi: verdictAbi, functionName: "nextRoomId" }),
    client.readContract({ address: verdictAddress, abi: verdictAbi, functionName: "getPlayers" }),
    client.readContract({ address: verdictAddress, abi: verdictAbi, functionName: "llmPrecompile" }),
  ]);
  if (!code || code === "0x") throw new Error("Verdict contract bytecode is missing");
  verdict = {
    address: verdictAddress,
    bytecodeBytes: (code.length - 2) / 2,
    nextRoomId: nextRoomId.toString(),
    players,
    llmPrecompile,
  };
}

console.log(JSON.stringify({
  chainId,
  block: block.toString(),
  validLlmExecutors: valid.map((service) => service.node.teeAddress),
  verdict,
}, null, 2));
