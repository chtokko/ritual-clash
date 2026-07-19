# Contributing to Ritual Clash

Thank you for helping improve Ritual Clash. Keep changes focused, reviewable, and safe for an on-chain application.

## Development workflow

1. Create a branch from `main` using a concise name such as `feat/match-filtering` or `fix/retry-state`.
2. Install dependencies with `pnpm install --frozen-lockfile`.
3. Make the smallest complete change that solves the issue.
4. Add or update tests for contract behavior.
5. Run `pnpm check` before opening a pull request.

## Pull requests

- Explain what changed, why it changed, and how it was verified.
- Keep refactors separate from behavior changes when practical.
- Include screenshots for visible interface changes.
- Document contract, deployment, environment, or network changes.
- Never commit `.env` files, private keys, wallet exports, or production credentials.

## Commit style

Use short conventional messages:

```text
feat: add room filtering
fix: preserve retry state after executor failure
docs: clarify Ritual deployment flow
test: cover tied verdict settlement
```

## Smart contract changes

Contract changes require tests covering success, failure, access control, and fund movement. Deployment scripts must verify chain ID and available balance before broadcasting a transaction.
