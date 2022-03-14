const hre = require("hardhat");
const { ethers } = require("ethers");
require('dotenv').config();

async function main() {
  // setting up connections to an EOA and provider to Goerli.
  const privKey = process.env.DEVNET_PRIVKEY;
  const apiKey = process.env.INFURA_APIKEY;
  const provider = new ethers.providers.InfuraProvider("goerli", apiKey);

  // create wallet.
  let wallet = new ethers.Wallet(privKey, provider);
  console.log('Your wallet address:', wallet.address);

  // connect Contract Object created by hardhat from ABI with signer.
  const ContractWithSigner = await (
    await hre.ethers.getContractFactory("AAWallet")
  ).connect(wallet);

  // deploy contract and log address.
  // aldrick.eth is the owner, and the entry point contract address is passed through.
  const contract = await ContractWithSigner.deploy("0x05992aab572feCe4e4319CC931BDe1a8b6601788", "0xa3eF83A8CFB516b7C3bcF4B91dcdEcaAb5ECE834"); 
  await contract.deployed();
  console.log("AAWallet deployed to:", contract.address);
  
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
