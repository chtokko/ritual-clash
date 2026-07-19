const { existsSync, readFileSync, writeFileSync } = require("node:fs");
const { resolve } = require("node:path");
const hre = require("hardhat");

function saveFrontendAddress(address) {
  const envPath = resolve(".env.local");
  const current = existsSync(envPath) ? readFileSync(envPath, "utf8") : "";
  const line = `VITE_RITUAL_CLASH_CONTRACT_ADDRESS=${address}`;
  const next = /^VITE_RITUAL_CLASH_CONTRACT_ADDRESS=.*$/m.test(current)
    ? current.replace(/^VITE_RITUAL_CLASH_CONTRACT_ADDRESS=.*$/m, line)
    : `${current.trimEnd()}${current.trim() ? "\n" : ""}${line}\n`;
  writeFileSync(envPath, next, "utf8");
}

async function main() {
  const registry = "0x9644e8562cE0Fe12b4deeC4163c064A8862Bf47F";
  const llm = "0x0000000000000000000000000000000000000802";
  const [deployer] = await hre.ethers.getSigners();
  if (!deployer) throw new Error("RITUAL_PRIVATE_KEY is missing from the local .env file.");

  const network = await hre.ethers.provider.getNetwork();
  if (network.chainId !== 1979n) throw new Error(`Unexpected chain ${network.chainId}.`);
  const factory = await hre.ethers.getContractFactory("VerdictArenaRitual", deployer);
  const unsigned = await factory.getDeployTransaction(registry, llm);
  const [balance, gas, feeData] = await Promise.all([
    hre.ethers.provider.getBalance(deployer.address),
    hre.ethers.provider.estimateGas({ from: deployer.address, data: unsigned.data }),
    hre.ethers.provider.getFeeData(),
  ]);
  const gasPrice = feeData.gasPrice ?? feeData.maxFeePerGas;
  const estimatedCost = gasPrice ? gas * gasPrice : 0n;
  if (estimatedCost && balance <= estimatedCost) throw new Error("Insufficient Ritual balance for deployment.");

  console.log("Deploying once from", deployer.address);
  console.log("Estimated gas", gas.toString(), "estimated cost", hre.ethers.formatEther(estimatedCost), "RITUAL");
  const arena = await factory.deploy(registry, llm);
  await arena.waitForDeployment();
  const address = await arena.getAddress();
  const code = await hre.ethers.provider.getCode(address);
  if (code === "0x") throw new Error("Deployment receipt confirmed but contract bytecode is missing.");
  saveFrontendAddress(address);
  console.log("Transaction:", arena.deploymentTransaction().hash);
  console.log("VITE_RITUAL_CLASH_CONTRACT_ADDRESS=" + address);
  console.log("Frontend configuration saved to .env.local");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
