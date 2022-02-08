const IERC20Json = require("../artifacts/@openzeppelin/contracts/token/ERC20/ERC20.sol/ERC20.json");
const IAggregatorV3InterfaceAbi = require("@chainlink/contracts/abi/v0.8/AggregatorV3Interface.json")
const { ethers, deployments, network, getChainId, config } = require("hardhat");

async function main() {
    if (await getChainId() === "1337") {
        await deployments.fixture("all");
    }

    const [owner] = await ethers.getSigners();

    const TokenFarm = await deployments.get("TokenFarm");
    const tokenFarm = await ethers.getContractAt("TokenFarm", TokenFarm.address);
    const DappToken = await deployments.get("DappToken");
    const dappToken = await ethers.getContractAt("DappToken", DappToken.address);

    const V3Aggregator = await ethers.getContractAt(IAggregatorV3InterfaceAbi, config.networks[network.name].ethToUsdPriceFeed);
    const [roundId, answer] = await V3Aggregator.latestRoundData();
    const decimals = await V3Aggregator.decimals();
    // console.log('answer: ', ethers.utils.formatEther(answer));
    // console.log('decimals: ', decimals);

    // const startingBalance = await dappToken.balanceOf(owner.address);
    // console.log('startingBalance: ', startingBalance); // 100 ETH

    //we are staking 1 dapp_token = in price to 1 ETH
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });

