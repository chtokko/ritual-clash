# Ritual Clash — Protocol architecture

## Scope

Ritual Clash supports three competitive formats with one shared settlement flow:

- Argue
- Bluff
- Prompt Duel

Profiles, rooms, submissions, native RITUAL wagers, results, XP, and leaderboard data live in one Solidity contract. The required application path has no backend, database, bot, webhook, or off-chain relayer.

## On-chain lifecycle

1. A wallet creates one permanent profile.
2. The creator opens a room and optionally escrows a native RITUAL wager.
3. A second profiled wallet joins with the same wager.
4. Both players submit one immutable entry.
5. Any wallet can call `resolveRoom(roomId, executor)` once the room is ready.
6. The contract validates the executor through Ritual's `TEEServiceRegistry`.
7. The contract makes a short-running asynchronous call to the LLM precompile at `0x0802`.
8. The fulfilled replay decodes the completion, records the winner, updates both profiles, and credits pull-based winnings.
9. Players withdraw credited RITUAL with `withdrawWinnings()`.

## Ritual integration

| System | Value |
| --- | --- |
| Chain ID | `1979` |
| RPC | `https://rpc.ritualfoundation.org` |
| LLM model | `zai-org/GLM-4.7-FP8` |
| LLM TTL | `300` blocks |
| Executor capability | `1` |
| RitualWallet | `0x532F0dF0896F353d8C3DD8cc134e8129DA2a3948` |
| AsyncJobTracker | `0xC069FFCa0389f44eCA2C626e55491b0ab045AEF5` |
| TEEServiceRegistry | `0x9644e8562cE0Fe12b4deeC4163c064A8862Bf47F` |
| LLM precompile | `0x0000000000000000000000000000000000000802` |

Each request is stateless, so conversation history uses an empty storage reference. No cloud-storage credentials are required.

## Safety properties

- Handles, topics, and submissions have strict byte limits.
- A supplied executor must be active, valid, and registered for the LLM capability.
- A failed or malformed LLM completion leaves the room ready for a retry.
- Settlement credits balances before any player withdrawal.
- Withdrawals use a lock and the checks-effects-interactions pattern.
- Public frontend reads use Ritual RPC directly and do not require a wallet session.
- Private keys are deployment-only and are never exposed through Vite variables.
