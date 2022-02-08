require("@nomiclabs/hardhat-waffle");
require('hardhat-deploy');

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

const ALCHEMY_MAINNET_FORK_API_URL =
    "https://eth-mainnet.alchemyapi.io/v2/gIuOz3g7EgE5HwC6HrPlHDkwd0dsK7T_";
const INFURA_KOVAN_API_URL = "https://kovan.infura.io/v3/9ff1d616c7a0459aa1cc217f4e3ddb03";

module.exports = {
  solidity: {
    compilers: [
      {
        version: "0.8.4",
      },
    ],
  },
  networks: {
    hardhat: {
      chainId: 1337,
      forking: {
        url: ALCHEMY_MAINNET_FORK_API_URL,
      //   // blockNumber: 11095000
      },
      wethToken: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
      fauToken: "0xfab46e002bbf0b4509813474841e0716e6730136",
      ethToUsdPriceFeed: "0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419",
      daiToUsdPriceFeed: "0xAed0c38402a5d19df6E4c03F4E2DceD6e29c1ee9",
    },
    kovan: {
      url: INFURA_KOVAN_API_URL,
      accounts: [process.env.META_MASK_AC1_KEY, process.env.META_MASK_AC2_KEY],
      wethToken: "0xd0a1e359811322d97991e03f863a0c30c2cf029c",
      fauToken: "0xfab46e002bbf0b4509813474841e0716e6730136",
      ethToUsdPriceFeed: "0x9326BFA02ADD2366b30bacB125260Af641031331",
      daiToUsdPriceFeed: "0x777A68032a88E5A84678A77Af2CD65A7b3c0775a",
    }
  },
  mocha: {
    timeout: 1000000,
  },
  etherscan: {
    apiKey: process.env.ETHER_SCAN_API_KEY,
  },
};
