// This setup uses Hardhat Ignition to manage smart contract deployments.
// Learn more about it at https://hardhat.org/ignition

import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const EphemeralWalletModule = buildModule("EphemeralWalletModule", (m) => {
  const owner = m.getParameter("owner", "0x9473EC0057AcBBa6b6E1d6af50d14C6343C0817A");

  const ephemeralWallet = m.contract("EphemeralWallet", [owner], {
    value: 1000000000000000n, // 0.001 ETH in wei
  });

  return { ephemeralWallet };
});

export default EphemeralWalletModule;
