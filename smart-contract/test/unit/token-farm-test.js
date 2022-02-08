const {expect} = require("chai");
const {ethers, getChainId, deployments, network, config} = require("hardhat");
const IAggregatorV3InterfaceAbi = require("@chainlink/contracts/abi/v0.8/AggregatorV3Interface.json")

describe("Unit tests:", () => {
    let TokenFarm;
    let tokenFarm;
    let DappToken;
    let dappToken;
    const amountStaked = ethers.utils.parseUnits("1", "ether");
    let V3Aggregator;


    before(async () => {
        await deployments.fixture(["main"]);
        TokenFarm = await deployments.get("TokenFarm");
        tokenFarm = await ethers.getContractAt("TokenFarm", TokenFarm.address);
        DappToken = await deployments.get("DappToken");
        dappToken = await ethers.getContractAt("DappToken", DappToken.address);
        V3Aggregator = await ethers.getContractAt(IAggregatorV3InterfaceAbi, config.networks[network.name].ethToUsdPriceFeed);
    });

    it("TEST setPriceFeedContract", async function() {
        if (await getChainId() !== "1337") {
            this.skip();
        }
        const [owner, notOwner] = await ethers.getSigners();

        const ethToUsdPriceFeed = config.networks[network.name].ethToUsdPriceFeed;
        await tokenFarm.setPriceFeedContract(dappToken.address, ethToUsdPriceFeed);

        await expect(await tokenFarm.tokenPriceFeedMapping(dappToken.address)).to.be.equal(ethToUsdPriceFeed);
        await expect(tokenFarm.connect(notOwner).setPriceFeedContract(dappToken.address, ethToUsdPriceFeed)).to.be.revertedWith("Ownable: caller is not the owner");
    });

    it("TEST stakeTokens", async function() {
        if (await getChainId() !== "1337") {
            this.skip();
        }

        const [owner] = await ethers.getSigners();

        await dappToken.approve(tokenFarm.address, amountStaked);
        await tokenFarm.stakeTokens(amountStaked, dappToken.address);

        await expect(await tokenFarm.stakingBalance(dappToken.address, owner.address)).to.be.equal(amountStaked);
        await expect(await tokenFarm.uniqueTokensStaked(owner.address)).to.be.equal(1);
        await expect(await tokenFarm.stakers(0)).to.be.equal(owner.address);
    });

    it("TEST issueTokens", async function() {
        if (await getChainId() !== "1337") {
            this.skip();
        }
        const [owner, notOwner] = await ethers.getSigners();

        const startingBalance = await dappToken.balanceOf(owner.address);
        const [roundId, answer] = await V3Aggregator.latestRoundData();
        const decimals = await V3Aggregator.decimals();
        const newBalance = startingBalance.add(ethers.BigNumber.from(answer.mul(10 ** (18 - decimals))));

        await tokenFarm.issueTokens();
        await expect(await dappToken.balanceOf(owner.address)).to.be.equal(newBalance); //стоимость 1ETH в $
    });
});
