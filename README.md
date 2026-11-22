# dcvault
The website for DC Vault, a Washington, DC based pole vault club and training program.

## Requirements

Backend development uses **Node 16** (see `.nvmrc`). Switch with `nvm use` before installing or running.

## Tests

Unit tests use **Jest 29** (pinned for Node 16). They live under `server/__tests__/` and do **not** start Express or connect to MySQL.

From this directory (`dcvault/`):

```bash
nvm use              # 16.20.2
npm install          # if node_modules is missing or npm install hits ENOTEMPTY, delete node_modules and retry
npm test             # run once
npm run test:watch   # re-run on file changes
```

If `npm install` fails with `ENOTEMPTY`, delete `node_modules` (keep `package-lock.json`) and install again.

HTTP tests with Supertest come later, after `server/app.js` is split so the app can be imported without `listen()` or a database connection.
