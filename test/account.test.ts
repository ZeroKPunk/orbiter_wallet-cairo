import hardhat, { starknet } from "hardhat";
import { StarknetContractFactory } from "hardhat/types/runtime";
import { ec, stark } from "starknet";
import { getSelectorFromName } from "starknet/dist/utils/hash";
import { ensureEnvVar } from "./util";

describe("Account", function () {
  let accountContractClass: string;
  let proxyContractFactory: StarknetContractFactory;

  before(async function () {
    await hardhat.run("starknet-compile", {
      paths: ["contracts/account.cairo"],
      accountContract: true,
    });
    await hardhat.run("starknet-compile", {
      paths: ["contracts/proxy.cairo"],
    });

    const accountContractFactory = await starknet.getContractFactory("account");
    accountContractClass = await accountContractFactory.declare();
    console.log("accountContractClass:", accountContractClass);

    proxyContractFactory = await starknet.getContractFactory("proxy");
  });

  it("Test deploy", async function () {
    const privateKey = ensureEnvVar("OZ_ACCOUNT_PRIVATE_KEY");
    const public_key = ec.getStarkKey(ec.getKeyPair(privateKey));

    const resp = await proxyContractFactory.deploy({
      implementation: accountContractClass,
      selector: getSelectorFromName("initialize"),
      calldata: stark.compileCalldata({ public_key }),
    });
    console.warn(resp);
  });

  it("Test invoke", async function () {});
});
