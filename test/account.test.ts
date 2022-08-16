import { expect } from "chai";
import hardhat, { starknet } from "hardhat";
import {
  StarknetContract,
  StarknetContractFactory,
} from "hardhat/types/runtime";
import { ec, Provider, stark } from "starknet";
import { getSelectorFromName } from "starknet/dist/utils/hash";
import { ensureEnvVar } from "./util";

describe("Account", function () {
  const accountPrivateKey = ensureEnvVar("OZ_ACCOUNT_PRIVATE_KEY");

  let accountContractClass: string;
  let proxyContractFactory: StarknetContractFactory;
  let proxyContract: StarknetContract;

  before(async function () {
    await hardhat.run("starknet-compile", {
      paths: ["contracts/account.cairo"],
      accountContract: true,
    });
    await hardhat.run("starknet-compile", {
      paths: ["contracts/proxy.cairo", "contracts/tests/test_counter.cairo"],
    });

    const accountContractFactory = await starknet.getContractFactory("account");
    accountContractClass = await accountContractFactory.declare();
    console.log("accountContractClass:", accountContractClass);

    proxyContractFactory = await starknet.getContractFactory("proxy");
  });

  it("Test deploy", async function () {
    const public_key = ec.getStarkKey(ec.getKeyPair(accountPrivateKey));

    proxyContract = await proxyContractFactory.deploy({
      implementation: accountContractClass,
      selector: getSelectorFromName("initialize"),
      calldata: stark.compileCalldata({ public_key }),
    });
    console.log("proxyContract.address:", proxyContract.address);
  });

  it("Test invoke", async function () {
    const testCounterContractFactory = await starknet.getContractFactory(
      "test_counter"
    );
    const testCounterContract = await testCounterContractFactory.deploy();
    console.log("testCounterContract.address:", testCounterContract.address);

    const account = await starknet.getAccountFromAddress(
      proxyContract.address,
      accountPrivateKey,
      "OpenZeppelin"
    );

    const value = 5n;
    const { count: countBefore } = await testCounterContract.call("get_count");
    await account.invoke(testCounterContract, "increase", { value });
    const { count: countAfter } = await testCounterContract.call("get_count");

    console.log("countBefore:", countBefore);
    console.log("countAfter:", countAfter);
    expect(countAfter - countBefore).to.equal(value);
  });
});
