function cleanValue(value: string | undefined) {
  const trimmed = value?.trim() ?? "";
  return trimmed || null;
}

const DEFAULT_ARENA_ADDRESS = "0x1eB4A8374ba2cE8F7668ecCfE2814E3cB2b8deE8";

export const arenaEnv = {
  reownProjectId: cleanValue(import.meta.env.VITE_REOWN_PROJECT_ID),
  ritualClashContractAddress: cleanValue(import.meta.env.VITE_RITUAL_CLASH_CONTRACT_ADDRESS) ?? DEFAULT_ARENA_ADDRESS,
} as const;
