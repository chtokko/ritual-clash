# Security Policy

## Reporting a vulnerability

Do not disclose an active vulnerability in a public issue. Use GitHub's **Security** tab and select **Report a vulnerability** to submit a private report.

Include:

- affected contract, component, or commit;
- a clear reproduction or proof of concept;
- expected impact on funds, permissions, or availability;
- any suggested mitigation.

Reports that could affect on-chain funds, executor validation, settlement, withdrawals, or deployment credentials are treated as high priority.

## Deployment credentials

Deployment keys belong only in ignored local environment files. Frontend variables prefixed with `VITE_` are public by design and must never contain secrets.

## Supported version

Security updates target the latest commit on `main` and the currently documented Ritual deployment.
