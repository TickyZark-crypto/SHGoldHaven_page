# Goldhaven Main Site

Goldhaven Main Site is the frontend DApp for the Goldhaven ecosystem. It provides a Web3 interface for GHV Hook buy/sell, token staking, NFT management, arena participation, battle history, arena reward claiming, NFT marketplace listings, IPFS image loading, and bilingual English/Chinese UI.

The site is built as a lightweight static frontend using HTML, CSS, JavaScript, and ethers.js.

## Overview

This frontend connects to the deployed Goldhaven smart contracts and gives users access to the main protocol flows:

* Connect wallet
* Buy / mint GHV through the Hook router
* Sell / burn GHV through the Hook router
* Stake and unstake GHV tokens
* Claim token staking dividends
* View owned and arena-staked Goldhaven NFTs
* Put NFTs into the arena queue
* Unlock NFTs when arena rules allow
* View live arena state
* Open daily arena as a validator
* Verify arena matches as a validator
* View battle history and local replay summaries
* Claim arena battle and validator rewards
* Browse and buy listed NFTs from the marketplace
* View class, element, beast, fate, stats, and skill data
* Switch between English and Chinese UI

## Live Network

Current configuration target:

```text
Network: Base Sepolia
Chain ID: 84532
Native Token: ETH
Protocol Token: GHV
```

Contract addresses are configured in:

```text
config/contracts.js
```

If a contract address is empty, the related module will stay unavailable or show a clear warning in the UI.

## Pages

### `index.html`

Homepage and protocol overview.

Includes:

* Goldhaven project landing section
* Protocol route overview
* Rotating NFT image showcase
* Navigation to asset console, arena, market, and skill guide
* Wallet connection button
* Language switch

### `app.html`

Main asset console.

Includes:

* Hook buy / mint panel
* Hook sell / burn panel
* GHV token staking
* GHV unstaking
* Dividend claiming
* NFT list
* NFT arena staking
* NFT unlock flow
* Transaction log

### `arena.html`

Arena dashboard.

Includes:

* Current arena status
* Current round information
* Remaining participants
* Champion display
* Current / next arena reward information
* Validator operation panel
* Open Daily Arena
* Verify Next Match
* Open / Refresh Next Round
* My arena cards
* Battle history
* Top 32 / survivor list
* Arena reward claim

### `market.html`

Live NFT marketplace page.

Includes:

* Active NFT listings
* NFT image loading from `GoldhavenNFT.imageURI(tokenId)`
* Fallback image loading from configured IPFS CIDs
* NFT attributes and stats
* GHV approval flow
* NFT purchase flow

### `tools/battle-tester.html`

Skill Guide page.

Includes:

* Class and beast explanations
* Skill multiplier tables
* Fate passive explanations
* Battle mechanism notes
* Damage formula
* Battle order explanation
* Bilingual skill names

## Project Structure

```text
.
├── index.html
├── app.html
├── arena.html
├── market.html
├── styles.css
├── app.js
├── favicon.ico
│
├── assets/
│   ├── goldhaven-logo.png
│   ├── goldhaven-logo-512.png
│   ├── goldhaven-mark.svg
│   ├── favicon.ico
│   ├── favicon.png
│   ├── favicon-32.png
│   ├── favicon-16.png
│   └── apple-touch-icon.png
│
├── config/
│   └── contracts.js
│
├── src/
│   ├── abi.js
│   ├── web3.js
│   └── live-ui-fixes.js
│
└── tools/
    └── battle-tester.html
```

## Core Files

### `config/contracts.js`

Main runtime configuration file.

Contains:

* Chain ID
* Network name
* Token symbol
* Contract addresses
* Uniswap v4 Hook settings
* NFT image gateway
* NFT image CID fallback table
* Social links

Important fields:

```js
window.GOLDHAVEN_CONFIG = {
  chainId: 84532,
  networkName: 'Base Sepolia',
  nativeSymbol: 'ETH',
  tokenSymbol: 'GHV',

  addresses: {
    ghvToken: '',
    goldhavenNFT: '',
    goldhavenVault: '',
    ghvHook: '',
    arenaFactory: '',
    battleEngine: '',
    nftMarketplace: '',
    priceOracle: '',
    poolManager: '',
    uniswapV4Router: '',
    activeArena: ''
  }
};
```

Before production deployment, make sure all required deployed contract addresses are correctly filled.

### `src/abi.js`

Frontend ABI registry.

Contains the ABI fragments used by the DApp for:

* ERC20
* Goldhaven NFT
* Goldhaven Vault
* GHV Hook
* GHV Swap Router
* Arena Factory
* Arena
* NFT Marketplace
* Price Oracle

### `src/web3.js`

Main Web3 interaction layer.

Handles:

* Wallet connection
* Wallet session restore
* Network checks
* Contract loading
* Buy / sell quotes
* Hook buy / sell execution
* GHV approval
* Token staking
* Token unstaking
* Dividend claiming
* NFT reading
* NFT arena staking
* NFT unlock
* Dashboard refresh
* Transaction logs

### `src/live-ui-fixes.js`

Live UI state layer.

Handles:

* Mobile wallet restore
* Cross-page wallet persistence
* Live marketplace listing scan
* Arena page refresh
* Arena active/latest-finished resolution
* Validator operation state
* Match verification actions
* Arena reward claiming
* Battle history rendering
* Top 32 rendering
* Friendly revert/error messages

### `app.js`

Shared UI layer.

Handles:

* Navigation active state
* Mobile menu
* Language switch
* English / Chinese text mapping
* Social links
* Basic page animations
* Shared display helpers

### `styles.css`

Global style sheet for all pages.

Includes:

* Layout
* Responsive mobile styling
* Cards and panels
* NFT display components
* Arena history cards
* Marketplace listings
* Buttons
* Wallet UI
* Language UI
* Transaction log styling

## Requirements

The frontend is a static site and does not require a build step.

Required in browser:

* Injected wallet such as MetaMask or Rabby
* Access to Base Sepolia
* JavaScript enabled

External dependency loaded by HTML pages:

```html
<script src="https://cdn.jsdelivr.net/npm/ethers@6.13.5/dist/ethers.umd.min.js"></script>
```

## Local Development

Because the project uses static HTML files, you can run it with any local static server.

Example using Python:

```bash
python3 -m http.server 5173
```

Then open:

```text
http://localhost:5173
```

Example using Node:

```bash
npx serve .
```

## Configuration

Edit:

```text
config/contracts.js
```

Set the deployed contract addresses:

```js
addresses: {
  ghvToken: '0x...',
  goldhavenNFT: '0x...',
  goldhavenVault: '0x...',
  ghvHook: '0x...',
  arenaFactory: '0x...',
  battleEngine: '0x...',
  nftMarketplace: '0x...',
  priceOracle: '0x...',
  poolManager: '0x...',
  uniswapV4Router: '0x...',
  activeArena: ''
}
```

`activeArena` can be left empty. If empty, the arena page attempts to resolve the active arena from:

1. `Vault.activeArena()`
2. `ArenaFactory.activeArena()`
3. `ArenaFactory.latestArena()`
4. `ArenaFactory.arenaOfDay(today)`

## NFT Images

NFT images are loaded in this order:

1. `GoldhavenNFT.imageURI(tokenId)` from the contract
2. Fallback CID from `config/contracts.js`
3. Gateway URL from `nftImageGateway`

Default gateway:

```js
nftImageGateway: 'https://ipfs.io/ipfs/'
```

The fallback CID table is mapped by:

```text
classId-beastId
```

Example:

```js
nftImageCids: {
  '0-0': 'Qm...',
  '0-1': 'Qm...',
  '6-6': 'Qm...'
}
```

## Wallet Behavior

The frontend supports wallet persistence across page navigation and refresh.

Local storage keys:

```text
goldhavenWalletConnected
goldhavenWalletAccount
goldhavenLang
```

Notes:

* First wallet connection requires user approval.
* After connection, the UI restores the cached address across pages.
* Disconnect only clears the local DApp session.
* Browser wallets do not allow a website to revoke wallet authorization directly.

## Main User Flows

### Buy / Mint GHV

1. Connect wallet.
2. Go to `Mint & Stake`.
3. Enter ETH amount.
4. Click `Quote`.
5. Confirm estimated GHV output.
6. Click `Buy / Mint`.
7. Confirm transaction in wallet.

If the buy reaches the NFT mint threshold, the Hook may mint a Goldhaven NFT.

### Sell / Burn GHV

1. Enter GHV amount.
2. Click `Quote`.
3. Approve GHV for the router if needed.
4. Click `Sell / Burn`.
5. Confirm transaction in wallet.

### Stake GHV

1. Enter GHV amount.
2. Approve GHV for the Vault if needed.
3. Click `Stake`.

### Claim Dividends

1. Go to the staking panel.
2. Check pending dividend amount.
3. Click `Claim Dividend`.

### Put NFT Into Arena

1. Go to `Mint & Stake`.
2. Refresh My NFTs.
3. Select an available NFT.
4. Click `Put Arena`.
5. Pay the NFT arena stake fee.
6. The NFT becomes visible as an arena-staked card.

### Unlock NFT

NFT unlock depends on contract rules.

The UI checks:

* Whether the NFT is staked
* Whether it is locked in an active arena
* Whether the arena is running
* Whether the current time is inside the lock window

If locked, the UI shows an unavailable state.

### Open Daily Arena

Validator-only flow:

1. Go to `Arena`.
2. Connect a validator wallet.
3. Click `Open Daily Arena`.
4. Confirm transaction.
5. The page resolves and caches the opened arena address.

Production arena rules are enforced by contracts.

### Verify Arena Match

Validator-only flow:

1. Go to `Arena`.
2. Connect a validator wallet.
3. Click `Verify Next Match`, or verify a specific match if available.
4. Confirm transaction.
5. UI refreshes current round and match state.

### Claim Arena Rewards

1. Go to `Arena`.
2. Check pending battle / validator rewards.
3. Click claim.
4. Confirm transaction.

## Arena UI Rules

The frontend displays contract-driven arena lifecycle state.

Production rules shown by the UI:

* Arena opens during the configured UTC window.
* One arena opens per UTC day unless contract test mode disables the daily limit.
* NFT stake/unstake can be locked around arena opening time.
* NFT stake/unstake is locked while an arena is active.
* Arena rewards are claimable after settlement.

The frontend does not override contract rules. Contract state is always authoritative.

## Marketplace Flow

The marketplace page scans NFT token IDs and reads:

```solidity
nftMarketplace.listings(tokenId)
```

Only active listings are displayed.

For each listing, the UI shows:

* NFT image
* Token ID
* Seller
* Price in GHV
* Class
* Element
* Beast
* Skills
* Attack
* Defense
* HP
* Speed

Buy flow:

1. Connect wallet.
2. Open `NFT Market`.
3. Choose a listed NFT.
4. Approve GHV if allowance is too low.
5. Click Buy.
6. Confirm transaction.

## Language Support

The UI supports English and Chinese.

The language switch is available in the navigation bar.

Current language is stored in:

```text
localStorage.goldhavenLang
```

Class, beast, element, fate, and skill names are displayed bilingually where useful.

## Deployment

The site can be deployed to any static hosting service.

Recommended options:

* GitHub Pages
* Vercel
* Netlify
* Cloudflare Pages
* IPFS static hosting
* Any standard web server

No build command is required.

For GitHub Pages:

1. Push the repository to GitHub.
2. Go to repository Settings.
3. Open Pages.
4. Select the branch and root folder.
5. Save.
6. Visit the generated GitHub Pages URL.

## Production Checklist

Before publishing:

* Confirm all contract addresses in `config/contracts.js`.
* Confirm the configured `chainId`.
* Confirm `nftImageGateway`.
* Confirm all NFT image CIDs.
* Confirm social links.
* Confirm marketplace address if marketplace is enabled.
* Confirm arena factory address if arena is enabled.
* Test wallet connection on desktop and mobile.
* Test buy quote and sell quote.
* Test NFT loading.
* Test arena page resolution.
* Test marketplace listing scan.
* Test both English and Chinese UI.
* Serve over HTTPS in production.

## Security Notes

This repository is frontend-only.

Important notes:

* The frontend never stores private keys.
* All transactions are confirmed by the user's wallet.
* Contract state is the source of truth.
* Always verify contract addresses before deployment.
* Do not rely on frontend checks as security boundaries.
* Smart contract permissions and validations must be enforced on-chain.
* Use HTTPS hosting to avoid script injection and wallet security issues.

## License

MIT
