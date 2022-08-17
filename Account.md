# Orbiter wallet account on starknet

## Introduction

Starknet account are different from Ethereum account. A Starknet account is a contract, and the account address is the contract address.

The Orbiter account contract relies on the implementation of [OpenZeppelin](https://github.com/OpenZeppelin/cairo-contracts)

In order to update the account contract, orbiter uses the proxy contract to call the Account contract class, and opens the upgrade function to update the contract class (of course, this is limited to the account itself for invoke)

## Useful link

- [StarkNet Account Abstraction Model - Part 1](https://community.starknet.io/t/starknet-account-abstraction-model-part-1/781)
- [Starknet Account Abstraction Model - Part 2](https://community.starknet.io/t/starknet-account-abstraction-model-part-2/839)
- [StarkNet-integration](https://github.com/starknet-edu/StarkNet-integration)

## Account contract class hash

| Network       | Class hash                                                         |
| ------------- | ------------------------------------------------------------------ |
| goerli-alpha  | 0x06d3af7b1fd973229b265f577a3eb510b90c36bd4097f259aa7f2bd2846d6e5f |
| mainnet-alpha | -                                                                  |

## How to deploy account contract(Use starknet.js)

Prerequisites:

- starknet.js
- Account contract class hash(Declared on chain)
- Proxy contract compiled file
- Account private key

```TypeScript
const accountClassHash = ... // Account contract class hash

const accountPrivateKey = ... // Your privateKey
const public_key = ec.getStarkKey(ec.getKeyPair(accountPrivateKey));

const proxyCompiledContract = fs.readFileSync(path of proxyCompiledFile).toString();
const provider = new Provider({ network: "goerli-alpha" });
await provider.deployContract({
    contract: proxyCompiledContract,
    constructorCalldata: stark.compileCalldata({
        implementation: accountClassHash,
        selector: getSelectorFromName("initialize"), // The function called when the contract is deployed
        calldata: stark.compileCalldata({ public_key }), // Function 'initialize' calldata
    }),
    addressSalt: public_key, // Use the public key as the address salt
});
```

## How to recover account contract(Use starknet.js)

Prerequisites:

- starknet.js
- Account contract class hash(Declared on chain)
- Account private key

#### Step 1. Off-chain calculation account contract address

```TypeScript
const accountClassHash = ... // Account contract class hash

const accountPrivateKey = ... // Your privateKey
const public_key = ec.getStarkKey(ec.getKeyPair(accountPrivateKey));

const CONTRACT_ADDRESS_PREFIX = shortString.encodeShortString(
    "STARKNET_CONTRACT_ADDRESS",
) // Constant

const constructorCalldata = stark.compileCalldata({
    implementation: accountClassHash,
    selector: getSelectorFromName("initialize"),
    calldata: stark.compileCalldata({ public_key }),
})
const constructorCalldataHash = computeHashOnElements(constructorCalldata)

const accountAddress = computeHashOnElements([
    CONTRACT_ADDRESS_PREFIX,
    0, // Account contract is not deployed from other contracts, here is 0
    public_key,
    accountClassHash,
    constructorCalldataHash,
])

```

#### Step 2. Check if the account contract is deployed on the chain

```TypeScript
const provider = new Provider({ network: "goerli-alpha" });
const code = await provider.getCode(accountAddress) // accountAddress from `Step 1`

if (code.bytecode.length > 0) {
    // Already deployed on-chain

    
}
```
