const { readFileSync } = require("node:fs");
const { resolve } = require("node:path");
const { ContractFactory, JsonRpcProvider, Wallet, formatEther } = require("ethers");
require("dotenv").config();

const RPC_URL = process.env.RITUAL_RPC_URL || "https://rpc.ritualfoundation.org";
const TEE_REGISTRY = "0x9644e8562cE0Fe12b4deeC4163c064A8862Bf47F";
const LLM_PRECOMPILE = "0x0000000000000000000000000000000000000802";
const artifactPath = resolve(
  "hardhat-artifacts/contracts/evm/VerdictArenaRitual.sol/VerdictArenaRitual.json",
);

async function main() {
  const privateKey = process.env.RITUAL_PRIVATE_KEY;
  if (!privateKey) throw new Error("RITUAL_PRIVATE_KEY is missing from the local .env file.");
  const deployer = new Wallet(privateKey).address;
  const artifact = JSON.parse(readFileSync(artifactPath, "utf8"));
  const provider = new JsonRpcProvider(RPC_URL, 1979);
  const factory = new ContractFactory(artifact.abi, artifact.bytecode);
  const transaction = await factory.getDeployTransaction(TEE_REGISTRY, LLM_PRECOMPILE);
  const [network, balance, nonce, gas, feeData] = await Promise.all([
    provider.getNetwork(),
    provider.getBalance(deployer),
    provider.getTransactionCount(deployer),
    provider.estimateGas({ from: deployer, data: transaction.data }),
    provider.getFeeData(),
  ]);
  const gasPrice = feeData.gasPrice ?? feeData.maxFeePerGas;
  const estimatedCost = gasPrice ? gas * gasPrice : null;

  console.log(JSON.stringify({
    chainId: network.chainId.toString(),
    deployer,
    nonce,
    balance: formatEther(balance),
    estimatedGas: gas.toString(),
    gasPrice: gasPrice?.toString() ?? null,
    estimatedCost: estimatedCost ? formatEther(estimatedCost) : null,
    affordable: estimatedCost ? balance > estimatedCost : null,
  }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
