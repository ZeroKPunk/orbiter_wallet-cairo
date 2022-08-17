import { expect } from "chai";
import { readFileSync } from "fs";
import hardhat from "hardhat";
import path from "path";
import {
  Account,
  Contract,
  ec,
  number,
  Provider,
  shortString,
  stark,
  uint256,
} from "starknet";
import {
  computeHashOnElements,
  getSelectorFromName,
} from "starknet/dist/utils/hash";
import { BigNumberish, toBN, toFelt } from "starknet/dist/utils/number";
import { bnToUint256, uint256ToBN } from "starknet/dist/utils/uint256";
import { ensureEnvVar } from "./util";

describe("starknetjs", function () {
  const accountPrivateKey = ensureEnvVar("OZ_ACCOUNT_PRIVATE_KEY");
  const accountClassHash = ensureEnvVar("ACCOUNT_CLASS_HASH");

  const provider = new Provider({ network: "goerli-alpha" });
  const keyPair = ec.getKeyPair(accountPrivateKey);
  const public_key = ec.getStarkKey(keyPair);

  let proxyCompiledContract: string;
  let proxyContractClassHash: BigNumberish;
  let deployedAccountAddress: string;

  before(async function () {
    await hardhat.run("starknet-compile", {
      paths: ["contracts/proxy.cairo"],
    });

    proxyCompiledContract = readFileSync(
      path.resolve(
        __dirname,
        "../starknet-artifacts/contracts/proxy.cairo/proxy.json"
      )
    ).toString();

    proxyContractClassHash =
      (
        await provider.declareContract({
          contract: proxyCompiledContract,
        })
      ).class_hash || 0;
  });

  it("Test account deploy", async function () {
    const resp = await provider.deployContract({
      contract: proxyCompiledContract,
      constructorCalldata: stark.compileCalldata({
        implementation: accountClassHash,
        selector: getSelectorFromName("initialize"),
        calldata: stark.compileCalldata({ public_key }),
      }),
      addressSalt: public_key,
    });
    console.log("resp:", resp);

    await provider.waitForTransaction(resp.transaction_hash);

    deployedAccountAddress = resp.address || "";
  });

  it("Test account recover", async function () {
    const CONTRACT_ADDRESS_PREFIX = shortString.encodeShortString(
      "STARKNET_CONTRACT_ADDRESS"
    ); // Constant

    const constructorCalldata = stark.compileCalldata({
      implementation: accountClassHash,
      selector: getSelectorFromName("initialize"),
      calldata: stark.compileCalldata({ public_key }),
    });

    const constructorCalldataHash = computeHashOnElements(constructorCalldata);

    const accountAddress = computeHashOnElements([
      CONTRACT_ADDRESS_PREFIX,
      0, // Account contract is not deployed from other contracts, here is 0
      public_key,
      proxyContractClassHash,
      constructorCalldataHash,
    ]);

    console.log("accountAddress:", accountAddress);
    expect(deployedAccountAddress).to.equal(accountAddress);
  });

  it("Test ERC20(ETH) transfer", async function () {
    const erc20Address =
      "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7";
    const recipient =
      "0x07aA9CC1deFC55E199079357a4f27eDf687E7e65314a13dea44F5624d5fA2475";
    const amount = 10 ** 14;

    const erc20ABI = (
      await import("../token-contract-artifacts/ERC20.cairo/ERC20_abi.json")
    ).default as any;
    const erc20Contract = new Contract(erc20ABI, erc20Address, provider);

    const account = new Account(provider, deployedAccountAddress, keyPair);

    const { balance } = await erc20Contract.call(
      "balanceOf",
      stark.compileCalldata({ account: account.address })
    );
    console.log("balance:", balance);

    if (uint256ToBN(balance).lte(toBN(amount))) {
      throw new Error("Insufficient balance");
    }

    const calls = [
      {
        contractAddress: erc20Address,
        entrypoint: "transfer",
        calldata: stark.compileCalldata({
          recipient,
          amount: { type: "struct", ...bnToUint256(amount) },
        }),
      },
    ];
    const abis = [erc20ABI];
    const resp = await account.execute(calls, abis, { maxFee: 10 ** 15 });
    console.log("resp:", resp);

    console.log("waitForTransaction..., ", resp.transaction_hash);
    await provider.waitForTransaction(resp.transaction_hash);
  });
});
