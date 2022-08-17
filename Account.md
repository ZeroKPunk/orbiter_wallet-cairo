# Orbiter wallet account on starknet

## Introduction

Starknet account are different from Ethereum account. A Starknet account is a contract, and the account address is the contract address.

The Orbiter account contract relies on the implementation of [OpenZeppelin](https://github.com/OpenZeppelin/cairo-contracts)

In order to update the account contract, orbiter uses the proxy contract to call the Account contract class, and opens the upgrade function to update the contract class (of course, this is limited to the account itself for invoke)

## Useful link

- [StarkNet Account Abstraction Model - Part 1](https://community.starknet.io/t/starknet-account-abstraction-model-part-1/781)
- [Starknet Account Abstraction Model - Part 2](https://community.starknet.io/t/starknet-account-abstraction-model-part-2/839)
- [StarkNet-integration](https://github.com/starknet-edu/StarkNet-integration)

## How to deploy account contract(Use starknet.js)

Required:

- starknet.js
- Account contract class hash(Declared on chain)
- Proxy contract compiled json

```TypeScript

```
