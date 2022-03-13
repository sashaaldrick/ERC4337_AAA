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
    await hre.ethers.getContractFactory("Greeter")
  ).connect(wallet);

  // deploy contract and log address.
  const contract = await ContractWithSigner.deploy("Hello, Hardhat");
  await contract.deployed();
  console.log("Greeter deployed to:", contract.address);
  
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
