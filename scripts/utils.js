const hre = require("hardhat");
const { ethers } = require("ethers");
require('dotenv').config();

async function createDevWallet() {
    console.log("Creating Dev Wallet...");
    const privKey = process.env.DEVNET_PRIVKEY;
    const apiKey = process.env.INFURA_APIKEY;
    const provider = new ethers.providers.InfuraProvider("goerli", apiKey);

    // create wallet.
    const wallet = new ethers.Wallet(privKey, provider);
    console.log('Your wallet address:', wallet.address);

    return wallet;
}
async function connectContractToSigner() {

}

module.exports = {
    createDevWallet, 
    connectContractToSigner
}