import hardhat, { starknet } from "hardhat";

// npx hardhat run scripts/declare.ts
async function main() {
  await hardhat.run("starknet-compile", {
    paths: ["contracts/account.cairo"],
    accountContract: true,
  });
  await hardhat.run("starknet-compile", {
    paths: ["contracts/proxy.cairo"],
  });

  const accountContractFactory = await starknet.getContractFactory("account");
  const accountContractClass = await accountContractFactory.declare();
  console.log("accountContractClass:", accountContractClass);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
