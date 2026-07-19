# Ritual Clash

Ritual Clash is a fully on-chain competitive AI game built for Ritual Chain. Two players lock their entries and optional native RITUAL wagers, then a TEE-verified Ritual LLM executor settles the match directly through the smart contract.

The application has no required backend, database, relayer, bot, or webhook. Profiles, rooms, submissions, results, XP, standings, and claimable rewards all live on Ritual.

## Live deployment

| Resource | Value |
| --- | --- |
| Network | Ritual Chain |
| Chain ID | `1979` |
| RPC | `https://rpc.ritualfoundation.org` |
| Arena contract | `0x1eB4A8374ba2cE8F7668ecCfE2814E3cB2b8deE8` |
| Explorer | `https://explorer.ritualfoundation.org` |

## Game modes

- **Argue** — the clearer and better-supported argument wins.
- **Bluff** — the most persuasive bluff wins, independently of factual truth.
- **Prompt Duel** — the prompt most likely to reproduce the target wins.

## Match lifecycle

1. Connect a wallet on Ritual Chain.
2. Deposit the execution reserve into RitualWallet.
3. Create a permanent on-chain profile.
4. Create or join a challenge room with an optional RITUAL stake.
5. Both players submit and lock one final entry.
6. The contract validates an active TEE executor in Ritual's registry.
7. Ritual's LLM precompile executes the judging request asynchronously.
8. The fulfilled transaction records the winner, updates XP, and credits rewards.
9. Players withdraw claimable rewards from the contract.

If Ritual returns an execution error, the room stays in the `Ready` state so the verdict can be retried without losing the wager.

## Stack

- React 18, TypeScript, and Vite
- Tailwind CSS and focused shadcn-style UI primitives
- Reown AppKit, Wagmi, and Viem
- Solidity 0.8.26 and Hardhat
- Ritual TEE Service Registry, RitualWallet, AsyncJobTracker, and LLM precompile

## Local development

Requirements:

- Node.js 18 or newer
- pnpm 10

```bash
pnpm install --frozen-lockfile
copy .env.example .env.local
pnpm dev
```

The Vite development server uses port `8080` by default. A different port can be passed with `pnpm dev -- --port 8081`.

## Environment variables

```dotenv
# Public frontend configuration
VITE_REOWN_PROJECT_ID=
VITE_RITUAL_CLASH_CONTRACT_ADDRESS=0x1eB4A8374ba2cE8F7668ecCfE2814E3cB2b8deE8

# Deployment only — never expose this key through a VITE_* variable
RITUAL_RPC_URL=https://rpc.ritualfoundation.org
RITUAL_PRIVATE_KEY=0xYOUR_PRIVATE_KEY

# Source verification
RITUAL_VERIFIER_URL=https://rpc.ritualfoundation.org/api/verify
```

Local environment files are ignored by Git. Never commit a private key.

## Commands

```bash
pnpm lint              # source quality checks
pnpm typecheck         # TypeScript validation
pnpm test              # Solidity contract test suite
pnpm build             # production frontend build
pnpm check             # complete local verification
pnpm preflight:ritual  # verify Ritual system contracts and deployment
pnpm estimate:ritual   # estimate deployment gas and affordability
pnpm deploy:ritual     # deploy a new arena contract to Ritual
```

## Project structure

```text
contracts/evm/                 Ritual arena contract and local mocks
deploy/                        Ritual deployment script
docs/ritual-architecture.md    Protocol architecture and system addresses
scripts/                       Deployment estimate and network preflight
src/                           React application
test/evm/                      Hardhat contract tests
```

## Security model

- The contract validates every supplied executor against Ritual's TEE registry.
- Topics, handles, and submissions have strict byte limits.
- Entries become immutable once submitted.
- Settlement errors preserve the room and wager for a safe retry.
- Rewards use pull payments and a withdrawal lock.
- Public chain reads work without connecting a wallet; signing is required only for state changes.

See [docs/ritual-architecture.md](docs/ritual-architecture.md) for the detailed contract flow and Ritual system addresses.
