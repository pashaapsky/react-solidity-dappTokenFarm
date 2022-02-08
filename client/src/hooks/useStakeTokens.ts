import { useEffect, useState } from 'react';
import { ChainId, useContractFunction, useEthers } from '@usedapp/core';
import { constants, utils } from 'ethers';
import contracts from '../contracts.json';
import ERC20Json from '../ERC20.json';
import { Contract } from '@ethersproject/contracts';

export const useStakeTokens = (tokenAddress: string) => {
  const { chainId } = useEthers();

  const abi = contracts.kovan.TokenFarm.abi;
  const isKovanChainId = chainId === ChainId.Kovan;

  const tokenFarmAddress = isKovanChainId
    ? contracts['kovan']['TokenFarm']['address']
    : constants.AddressZero;

  const tokenFarmInterface = new utils.Interface(abi);
  const tokenFarmContract = new Contract(tokenFarmAddress, tokenFarmInterface);

  const erc20ABI = ERC20Json.abi;
  const erc20Interface = new utils.Interface(erc20ABI);
  const erc20Contract = new Contract(tokenAddress, erc20Interface);

  // approve
  const { send: approveErc20Send, state: approveAndStakeErc20State } =
    useContractFunction(erc20Contract, 'approve', {
      transactionName: 'Approve ERC20 transfer',
    });

  const [amountToStake, setAmountToStake] = useState('0');
  const [state, setState] = useState(approveAndStakeErc20State);

  const approveAndStake = (amount: string) => {
    setAmountToStake(amount);
    return approveErc20Send(tokenFarmAddress, amount);
  };

  // stake
  const { send: stakeSend, state: stakeState } = useContractFunction(
    tokenFarmContract,
    'stakeTokens',
    {
      transactionName: 'Stake Tokens',
    },
  );

  //useEffect
  useEffect(() => {
    if (approveAndStakeErc20State.status === 'Success') {
      stakeSend(amountToStake, tokenAddress);
    }
  }, [approveAndStakeErc20State, amountToStake, tokenAddress]);

  useEffect(() => {
    if (approveAndStakeErc20State.status === 'Success') {
      setState(stakeState);
    } else {
      setState(approveAndStakeErc20State);
    }
  }, [approveAndStakeErc20State, stakeState]);

  return { approveAndStake, state };
};
