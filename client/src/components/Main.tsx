import { ChainId, useEthers } from '@usedapp/core';
import { constants } from 'ethers';
import { YourWallet } from './YourWallet';
import { makeStyles } from '@material-ui/core';
import hardhatConfig from '../hardhatConfig.json';
import contracts from '../contracts.json';
import dapp from '../images/dapp.png';
import eth from '../images/eth.png';
import dai from '../images/dai.png';

export type Token = {
  image: string;
  address: string;
  name: string;
};

const useStyles = makeStyles((theme) => ({
  title: {
    color: theme.palette.common.white,
    textAlign: 'center',
    padding: theme.spacing(4),
  },
}));

export const Main = () => {
  const classes = useStyles();
  const { chainId } = useEthers();

  const isKovanChainId = chainId === ChainId.Kovan;

  const networkName = isKovanChainId ? 'kovan' : 'hardhat';

  const dappTokenAddress = isKovanChainId
    ? contracts['kovan']['DappToken']['address']
    : constants.AddressZero;
  const wethTokenAddress = isKovanChainId
    ? hardhatConfig['networks'][networkName]['wethToken']
    : constants.AddressZero; // brownie config
  const fauTokenAddress = isKovanChainId
    ? hardhatConfig['networks'][networkName]['fauToken']
    : constants.AddressZero;

  const supportedTokens: Array<Token> = [
    {
      image: dapp,
      address: dappTokenAddress,
      name: 'DAPP',
    },
    {
      image: eth,
      address: wethTokenAddress,
      name: 'WETH',
    },
    {
      image: dai,
      address: fauTokenAddress,
      name: 'DAI',
    },
  ];

  return (
    <>
      <h2 className={classes.title}>Dapp Token App</h2>

      <YourWallet supportedTokens={supportedTokens} />
    </>
  );
};
