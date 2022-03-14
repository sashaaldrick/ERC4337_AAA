require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-etherscan");
require("@nomiclabs/hardhat-ethers")
require("dotenv").config();

const INFURA_APIKEY = process.env.INFURA_APIKEY;
const ETHERSCAN_APIKEY = process.env.ETHERSCAN_APIKEY;

module.exports = {
  solidity: "0.8.12",
  networks: {
    hardhat: {
      chainId: 1337
    },
    goerli: {
      url: `https://goerli.infura.io/v3/${INFURA_APIKEY}`,
      chainId: 5,
      gas: 2100000, 
      gasPrice: 8000000000
    },
    rinkeby: {
      url: `https://rinkeby.infura.io/v3/${INFURA_APIKEY}`,
      chainId: 4,
      gas: 2100000, 
      gasPrice: 8000000000
    },
    ropsten: {
      url: `https://ropsten.infura.io/v3/${INFURA_APIKEY}`,
      chainId: 3,
      gas: 2100000, 
      gasPrice: 8000000000
    }
  },
  etherscan: {
    apiKey: ETHERSCAN_APIKEY
  }
};
