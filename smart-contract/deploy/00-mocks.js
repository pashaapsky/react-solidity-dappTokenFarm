const { ethers, config, network } = require("hardhat");

module.exports = async ({ getNamedAccounts, deployments, getChainId }) => {
    const { deploy, get } = deployments;
    const [owner] = await ethers.getSigners();
    const chainId = await getChainId();

    if (chainId === "1337") {
        console.log('local net detected, deploy mocks...');

        await deploy("MockDAI", {
            from: owner.address,
            log: true,
            args: [],
        });

        await deploy("MockWETH", {
            from: owner.address,
            log: true,
            args: [],
        });

        console.log('mocks deployed!');
    }
};

module.exports.tags = ["all", "mocks", "main"];