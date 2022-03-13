const hre = require("hardhat");
const { ethers } = require("ethers");
require('dotenv').config();

// AB stands for 'Automator/Bundler' as this is what functionality this script aims to replicate.
// An Automator is someone who has permission on an account abstracted wallet to control payment ability and the one who sends a UserOperation to the UserOperation pool when it is time for a payment to be made.
// A Bundler is someone who listens in on the UserOperationPool and talks to the entry point contract to simulate each UserOperation on the account abstracted wallet using simulateValidation() [Entry Point Contract Function]. If they work and possess a good incentive, a bundler will then bundle multiple UserOperation objects into one handleOps(UserOperation[] userOps) call on the entry point contract. At this point, the entry point contract will checked the validation as well and then execute the required payload code if successful for each UserOperation object.

// Automator: needs to set payment flag on AAWallet contract to true.
// Automator: needs to send UserOperation object to the pool. For simplicity, it will just call the bundler function directly with the UserOperation object as an argument. For this we need to build the UserOperation object, including encoding the callData correctly.

// Bundler: Once an object is received, it will call simulateValidation(UserOperation) on the entry point contract. 
// Bundler: If this is successful, it will call handleOps(UserOperation) on the entry point contract.

async function automator() {

    
}

async function bundler() {
    
}

async function main() {

}

// leave this for now, but remember this can glitch with certain RPC errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })