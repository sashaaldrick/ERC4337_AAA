const hre = require("hardhat");
const { ethers } = require("ethers");
const keccak256 = require("keccak256");

const UserOperation = require("./UserOperation");
require('dotenv').config();

// AB stands for 'Automator/Bundler' as this is what functionality this script aims to replicate.
// An Automator is someone who has permission on an account abstracted wallet to control payment ability and the one who sends a UserOperation to the UserOperation pool when it is time for a payment to be made.
// A Bundler is someone who listens in on the UserOperationPool and talks to the entry point contract to simulate each UserOperation on the account abstracted wallet using simulateValidation() [Entry Point Contract Function]. If they work and possess a good incentive, a bundler will then bundle multiple UserOperation objects into one handleOps(UserOperation[] userOps) call on the entry point contract. At this point, the entry point contract will checked the validation as well and then execute the required payload code if successful for each UserOperation object.

// Automator: needs to send UserOperation object to the pool. For simplicity, it will just call the bundler function directly with the UserOperation object as an argument. For this we need to build the UserOperation object, including encoding the callData correctly.

// Bundler: Once an object is received, it will call simulateValidation(UserOperation) on the entry point contract. 
// Bundler: If this is successful, it will call handleOps(UserOperation) on the entry point contract.

const deployedWalletAddress = "0xDF826469D6bbCc9224F5b7774aE4F58247249f34";

async function automator() {
    // UserOperation object stencil.
    // address sender;
    // uint256 nonce;
    // bytes callData;
    // bytes signature;

    // building UserOperation object userOp.
    // let deployedWalletAddress = "0x5C76CFe70AA6715589473A149410CFb1C32A2a62";
    console.log("Automator: Getting current AAWallet nonce to build UserOperation object");
    let nonce = await getNonce();
    console.log(nonce);

    // encoding call data using low-level (lol) ethers functionality with AbiCoder: https://docs.ethers.io/v5/api/utils/abi/coder/#AbiCoder--methods
    let abiCoder = ethers.utils.defaultAbiCoder;
    let destination = "0x05992aab572feCe4e4319CC931BDe1a8b6601788"; // aldrick.eth 
    let amount = ethers.utils.parseUnits("0.05", "ether"); // this is the amount to automatically transfer
    let callData = abiCoder.encode([ "string", "uint" ], [ destination, amount ]);
    console.log("Automator: Building callData to allow for automatic transfer of ETH");
    console.log(callData);

    // need to encode the callData and the signature in good old hex.
    let password = "LetsGetAutomatedInHere";
    let hash = keccak256(password).toString('hex');
    let signature = "0x" + hash;

    var userOp = new UserOperation(deployedWalletAddress, nonce + 1, callData, signature);

    // call bundler with UserOperation object.
    bundler(userOp);

}

async function bundler(userOp) {
    // console.log("In Bundler Function");
    // console.log("userOp: " + JSON.stringify(userOp));

    // the Bundler has to connect to the chain to call simulateValidation on the entry point contract.
    // for simplicity, I've used the same account as the automator, as it does not really matter here.
    const privKey = process.env.DEVNET_PRIVKEY;
    const apiKey = process.env.INFURA_APIKEY;
    const provider = new ethers.providers.InfuraProvider("goerli", apiKey);

    // create wallet.
    let wallet = new ethers.Wallet(privKey, provider);
    console.log('Bundler wallet address:', wallet.address);

    // connect to contracts 
    const entryPointAddress = "0xa3eF83A8CFB516b7C3bcF4B91dcdEcaAb5ECE834";
    const entryPointContract = await hre.ethers.getContractAt("EntryPoint", entryPointAddress, wallet);

    const aaWalletContract = await hre.ethers.getContractAt("AAWallet", deployedWalletAddress, wallet);

    console.log("Simulating Validation...");
    let simulateTx = await entryPointContract.simulateValidation(userOp);
    let receipt = await simulateTx.wait();

    // receipt.status = 1 if simulateValidation is successful or else 0.
    if (receipt.status == 1) {
        console.log("Simulation of validation succeeded, I know this is a good UserOperation object, so it is time to call handleOps(UserOperation)");
        console.log("Calling handleOps(UserOperation)");
        let handleOpsTx = await entryPointContract.handleOps([userOp]);
        let executionReceipt = await handleOpsTx.wait();
    }
    
}

async function getNonce() {
    const privKey = process.env.DEVNET_PRIVKEY;
    const apiKey = process.env.INFURA_APIKEY;
    const provider = new ethers.providers.InfuraProvider("goerli", apiKey);

    // create wallet.
    let wallet = new ethers.Wallet(privKey, provider);

    // connect to contract
    const aaWalletContract = await hre.ethers.getContractAt("AAWallet", deployedWalletAddress, wallet);

    let nonceTx = await aaWalletContract.getNonce();
    let currentNonce = nonceTx.toNumber();

    return currentNonce;
}


async function main() {
    automator();
}

// leave this for now, but remember this can glitch with certain RPC errors.
// main()
//   .then(() => process.exit(0))
//   .catch((error) => {
//     console.error(error);
//     process.exit(1);
//   })

main();