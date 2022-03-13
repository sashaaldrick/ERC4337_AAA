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
    }
  },
  etherscan: {
    apiKey: ETHERSCAN_APIKEY
  }
};
