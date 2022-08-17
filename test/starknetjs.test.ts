import { readFileSync } from "fs";
import hardhat from "hardhat";
import path from "path";
import { ec, Provider, shortString, stark } from "starknet";
import {
    computeHashOnElements,
    getSelectorFromName
} from "starknet/dist/utils/hash";
import { ensureEnvVar } from "./util";

describe("starknetjs", function () {
  const accountPrivateKey = ensureEnvVar("OZ_ACCOUNT_PRIVATE_KEY");
  const accountClassHash = ensureEnvVar("ACCOUNT_CLASS_HASH");

  const provider = new Provider({ network: "goerli-alpha" });

  let proxyCompiledContract: any;
  const public_key = ec.getStarkKey(ec.getKeyPair(accountPrivateKey));

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
  });

  // it("Test account deploy", async function () {
  //   const resp = await provider.deployContract({
  //     contract: proxyCompiledContract,
  //     constructorCalldata: stark.compileCalldata({
  //       implementation: accountClassHash,
  //       selector: getSelectorFromName("initialize"),
  //       calldata: stark.compileCalldata({ public_key }),
  //     }),
  //     addressSalt: public_key,
  //   });
  //   console.log("resp:", resp);

  //   await provider.waitForTransaction(resp.transaction_hash);
  // });

  it("Test account recover", async function () {
    const CONTRACT_ADDRESS_PREFIX = shortString.encodeShortString(
      "STARKNET_CONTRACT_ADDRESS"
    ); // Constant
    
    const constructorCalldata = stark.compileCalldata({
      implementation: accountClassHash,
      selector: getSelectorFromName("initialize"),
      calldata: stark.compileCalldata({ public_key }),
    });
    console.warn("constructorCalldata:", constructorCalldata);

    const constructorCalldataHash = computeHashOnElements(constructorCalldata);

    const accountAddress = computeHashOnElements([
      CONTRACT_ADDRESS_PREFIX,
      0, // Account contract is not deployed from other contracts, here is 0
      public_key,
      accountClassHash,
      constructorCalldataHash,
    ]);

    console.warn("accountAddress:", accountAddress);
  });
});
