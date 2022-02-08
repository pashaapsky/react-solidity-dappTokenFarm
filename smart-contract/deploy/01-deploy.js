const IERC20Json = require("../artifacts/@openzeppelin/contracts/token/ERC20/ERC20.sol/ERC20.json");
const IAggregatorV3InterfaceAbi = require("@chainlink/contracts/abi/v0.8/AggregatorV3Interface.json")
const { ethers, config, network } = require("hardhat");

async function addAllowedTokens(tokenFarm, allowedTokens) {
    for (let token in allowedTokens) {
        if (allowedTokens.hasOwnProperty(token)) {
            const addTx = await tokenFarm.addAllowedTokens(token);
            await addTx.wait();
            const setTx = await tokenFarm.setPriceFeedContract(token, allowedTokens[token].address);
            await setTx.wait();
        }
    }
}

module.exports = async ({ getNamedAccounts, deployments, getChainId }) => {
    const { deploy, get } = deployments;
    const [owner] = await ethers.getSigners();
    const chainId = await getChainId();

    let WethToken;
    let wethToken;
    let DaiToken;
    let daiToken;
    const KEPT_BALANCE = ethers.utils.parseUnits("100", "ether");

    if (chainId === "1337") {
        WethToken = await deployments.get("MockWETH");
        wethToken = await ethers.getContractAt("MockWETH", WethToken.address);
        DaiToken = await deployments.get("MockDAI");
        daiToken = await ethers.getContractAt("MockDAI", DaiToken.address);
    } else {
        WethToken = config.networks[network.name].wethToken;
        wethToken = await ethers.getContractAt(IERC20Json.abi, WethToken);
        DaiToken = config.networks[network.name].fauToken;
        daiToken = await ethers.getContractAt(IERC20Json.abi, DaiToken);
    }

    const DappToken = await deploy("DappToken", {
        from: owner.address,
        log: true,
        args: [],
    });

    const TokenFarm = await deploy("TokenFarm", {
        from: owner.address,
        log: true,
        args: [DappToken.address],
    });

    const dappToken = await ethers.getContractAt("DappToken", DappToken.address);
    const tokenFarm = await ethers.getContractAt("TokenFarm", TokenFarm.address);

    const totalDappTokenSupply = await dappToken.totalSupply();
    console.log('totalDappTokenSupply: ', totalDappTokenSupply);

    const transferValue = totalDappTokenSupply.sub(KEPT_BALANCE);
    console.log('transferring: ', transferValue, ' to TokenFarm');
    await dappToken.transfer(tokenFarm.address, transferValue);
    console.log('transferring complete! ');

    // dappToken, wethToken, fauToken/dai
    const allowedTokens = {
        [dappToken.address]: await ethers.getContractAt(IAggregatorV3InterfaceAbi, config.networks[network.name].daiToUsdPriceFeed),
        [daiToken.address]: await ethers.getContractAt(IAggregatorV3InterfaceAbi, config.networks[network.name].daiToUsdPriceFeed),
        [wethToken.address]: await ethers.getContractAt(IAggregatorV3InterfaceAbi, config.networks[network.name].ethToUsdPriceFeed),
    };

    console.log('add allowed tokens with priceFeeds...');
    await addAllowedTokens(tokenFarm, allowedTokens);
    console.log('Adding successful');
};

module.exports.tags = ["all", "main"];