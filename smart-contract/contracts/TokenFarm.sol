//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/interfaces/IERC20.sol";
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

contract TokenFarm is Ownable {
    //stakeTokens - купить токены
    //unstakeToken - вернуть токены,
    //issueTokens - выпуск токентов
    //addAllowedTokens - добавить доступные токены
    //getValue - конверсия в ETH

    //token address => staker address => amount
    mapping(address => mapping(address => uint256)) public stakingBalance;
    //сколько различных типов токенов есть у адресса
    mapping(address => uint256) public uniqueTokensStaked;
    //адресс токена -> на адресс priceFeed токена
    mapping(address => address) public tokenPriceFeedMapping;
    //лист stakers
    address[] public stakers;
    address[] public allowedTokens;
    //контракт с нашими DAPP токенами
    IERC20 public dappToken;

    constructor(address _dappTokenAddress) {
        dappToken = IERC20(_dappTokenAddress);
    }

    function setPriceFeedContract(address _token, address _priceFeed) public onlyOwner {
        tokenPriceFeedMapping[_token] = _priceFeed;
    }

    //выпустить токены для всех stakers
    function issueTokens() public onlyOwner {
        for (uint256 stakerIndex = 0; stakerIndex < stakers.length; stakerIndex++) {
            address user = stakers[stakerIndex];
            //отправить награду в зависимости сколько у них уже есть токенов
            uint256 userTotalValue = getUserTotalValue(user);
            dappToken.transfer(user, userTotalValue);
        }
    }

    //сколько value есть у владельца
    function getUserTotalValue(address _user) public view returns (uint256) {
        uint256 totalValue = 0;
        require(uniqueTokensStaked[_user] > 0, "No tokens staked");
        for (uint256 allowedTokenIndex = 0; allowedTokenIndex < allowedTokens.length; allowedTokenIndex++) {
            totalValue = totalValue + getUserSingleTokenValue(_user, allowedTokens[allowedTokenIndex]);
        }

        return totalValue;
    }

    //получить стоимость всех токенов определенного типа у юзера
    function getUserSingleTokenValue(address _user, address _token) public view returns (uint256) {
        if (uniqueTokensStaked[_user] <= 0) {
            return 0;
        }
        //price of the token * stakingBalance[_token][_user]
        (uint256 price, uint256 decimals) = getTokenValue(_token);

        // 10000000000000000000 ETH
        // ETH/USD -> 10000000000 (price)
        // 10 * 100 = 1,000
        return (stakingBalance[_token][_user] * price / (10 ** decimals));
    }

    //получить стоимость одного токена
    function getTokenValue(address _token) public view returns (uint256, uint256) {
        address priceFeedAddress = tokenPriceFeedMapping[_token];
        AggregatorV3Interface priceFeed = AggregatorV3Interface(priceFeedAddress);
        (,int price,,,) = priceFeed.latestRoundData();
        uint256 decimals = uint256(priceFeed.decimals());

        return (uint256(price), decimals);
    }

    //взять токены в долю
    function stakeTokens(uint256 _amount, address _token) public {
        require(_amount > 0, "Amount must be more than 0");
        require(tokenIsAllowed(_token), "Token is not Allowed");
        //переводим
        IERC20(_token).transferFrom(msg.sender, address(this), _amount);
        updateUniqueTokenStaked(msg.sender, _token);
        //записываем в маппинг новую сумму - сколько токенов на счете
        stakingBalance[_token][msg.sender] = stakingBalance[_token][msg.sender] + _amount;
        //обновляем кол-во уникальных токенов у sender и добавляем самого sender
        if (uniqueTokensStaked[msg.sender] == 1) {
            stakers.push(msg.sender);
        }
    }

    function unstakeTokens(address _token) public {
        uint256 balance = stakingBalance[_token][msg.sender];
        require(balance > 0, "Staking balance can`t be 0");
        IERC20(_token).transfer(msg.sender, balance);
        stakingBalance[_token][msg.sender] = 0;
        uniqueTokensStaked[msg.sender] = uniqueTokensStaked[msg.sender] - 1;
    }

    //internal - только этот контракт может вызывать эту функцию
    //сколько уникальных токенов у юзера
    function updateUniqueTokenStaked(address _user, address _token) internal {
        if (stakingBalance[_token][_user] <= 0) {
            uniqueTokensStaked[_user] = uniqueTokensStaked[_user] + 1;
        }
    }


    function addAllowedTokens(address _token) public onlyOwner {
        allowedTokens.push(_token);
    }

    //доступен ли такой токен?
    function tokenIsAllowed(address _token) public view returns (bool) {
        for (uint256 i = 0; i < allowedTokens.length; i++) {
            if (allowedTokens[i] == _token) {
                return true;
            }
        }

        return false;
    }
}
