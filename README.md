# Aramask 🦅🦊

Aragon account plugin for Metamask.

It allows DAO users to add a special contract account to their Metamask wallet and use it to manage [Aragon Agent](https://help.aragon.org/article/37-agent). It is based on a new [Metamask Plugin System](https://github.com/MetaMask/metamask-snaps-beta/wiki/Motivation).

## Usage

Current limitations:

- Needs [experimental version](https://github.com/MetaMask/metamask-snaps-beta) of Metamask.
- Needs backend service to construct Agent transactions.
- Metamask will [display agent's contract address](https://github.com/xuhcc/aramask/issues/2) in its account list instead of DAO address.
- Every transaction requires two confirmations from the user.
- Successful transactions will be [marked as failed](https://github.com/xuhcc/aramask/issues/3) in transaction list of Aragon account.
- Transaction may [randomly fail](https://github.com/xuhcc/aramask/issues/1) with error `No functions specified in artifact for 0x...`.
- Works only in Chrome/Chromium.
- Agent account will not be preserved after browser restart.

### Metamask installation

Clone the [metamask-snaps-beta](https://github.com/MetaMask/metamask-snaps-beta) repo.

Use the `develop` branch.

Install required packages and build Metamask:

```
yarn install
yarn dist
```

Load unpacked extension from `dist/chrome/`.

### Demo app and plugin installation

Clone this repo.

Install required packages and build the plugin:

```
npm install
npm run build
```

Start server:

```
npm start
```

Navigate to http://localhost:8081/, follow the instructions.
