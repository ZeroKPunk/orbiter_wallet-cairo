# Orbiter Wallet Cairo Contracts

**A decentralized ZK Rollup Wallet** written in Cairo for [StarkNet](https://starkware.co/product/starknet/).

## Get started

#### Clone this repo

```
git clone https://github.com/linkdrone/orbiter_wallet-cairo.git
cd orbiter_wallet-cairo
```

#### Install dependencies

```
npm ci
```

#### Compile a contract

```
npx hardhat starknet-compile contracts/account.cairo
```

#### Run a test that interacts with the compiled contract

```
npx hardhat test account.test.ts
```

## Troubleshooting

## Branches

- `main`

### Branch updating (for developers)

- New PRs and features should be targeted to the `develop` branch.

## Contracts interface

- [Account](./contracts/account.cairo)
- [Proxy](./contracts/Proxy.cairo)
