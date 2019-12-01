# Aramask 🦅🦊

Aragon account Metamask plugin.

With this [plugin](https://github.com/MetaMask/metamask-snaps-beta/wiki) you can use Metamask to interact with dapps on behalf of Aragon DAOs that have [Agent app](https://help.aragon.org/article/37-agent) installed.

## Usage

Current limitations:

- Needs [experimental version](https://github.com/MetaMask/metamask-snaps-beta) of Metamask.
- Needs backend service to construct Agent transactions.
- Works only in Chrome/Chromium.

### Metamask installation

Clone the [metamask-snaps-beta](https://github.com/MetaMask/metamask-snaps-beta) repo.

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
