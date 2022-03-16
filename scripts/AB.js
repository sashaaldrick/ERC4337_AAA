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
// Bundler: If this is successful, it will call handleOps(UserOperation) on the entry point contract, which if everything matches will execute the transfer.

const deployedWalletAddress = "0x333619469Cd4409468F2F91b90c2BEAf6A6C78dB";
const entryPointAddress = "0xdd4D8f42b1B4a22FD5Ff3fb5EeE2B0d25ee1301f";

async function automator() {

    console.log("Hi Gelato Team!! 🍦");
    console.log("Let's get some ERC 4337 action going...")
    console.log("-----------------------------------------------------" + '\n');

    await new Promise(resolve => setTimeout(resolve, 5000)); // setting a timer to make it a bit more presentable

    // UserOperation object stencil.
    // address sender;
    // uint256 nonce;
    // bytes callData;
    // bytes signature;

    // encoding call data using low-level (lol) ethers functionality with AbiCoder: https://docs.ethers.io/v5/api/utils/abi/coder/#AbiCoder--methods
    let abiCoder = ethers.utils.defaultAbiCoder;
    let destination = ethers.utils.getAddress("0x05992aab572feCe4e4319CC931BDe1a8b6601788");
    console.log("Automator: AA Wallet is " + deployedWalletAddress);
    let amount = ethers.utils.parseUnits("0.01", "ether"); // this is the amount to automatically transfer
    let callData = abiCoder.encode([ "address", "uint" ], [ destination, amount ]);
    console.log("Automator: Building callData to allow for automatic transfer of ETH");
    console.log("Calldata: " + callData);

    // need to encode the callData and the signature in good old hex.
    let password = "LetsGetAutomatedInHere";
    let hash = keccak256(password).toString('hex');
    let signature = "0x" + hash;
    console.log("Automator: Generating signature to allow for verification and execution...");
    console.log("Signature: " + signature);

    let nonce = await getNonce();
    // building UserOperation object userOp.
    var userOp = new UserOperation(deployedWalletAddress, nonce + 1, callData, signature);
    console.log("-----------------------------------------------------" + '\n');
    console.log("🍦🍦🍦");

    // call bundler with UserOperation object.
    return userOp;

}

async function bundler(userOp) {
    console.log("-----------------------------------------------------" + '\n');
    // the Bundler has to connect to the chain to call simulateValidation on the entry point contract.
    // for simplicity, I've used the same account as the automator, as it does not really matter here.
    const privKey = process.env.DEVNET_PRIVKEY;
    const apiKey = process.env.INFURA_APIKEY;
    const provider = new ethers.providers.InfuraProvider("goerli", apiKey);

    // create wallet.
    let wallet = new ethers.Wallet(privKey, provider);

    // connect to contracts 
    const entryPointContract = await hre.ethers.getContractAt("EntryPoint", entryPointAddress, wallet);

    // prefund AAWallet contract to cover gas and for automatic transfer.
    let prefundTx = {
        to: deployedWalletAddress,
        value: ethers.utils.parseUnits("0.01", "ether")
    }

    console.log("Funding account abstracted wallet @ " + deployedWalletAddress + "...");

    let tx = await wallet.sendTransaction(prefundTx);
    await tx.wait();

    console.log("Bundler: Simulating validation via validateUserOp to see if it's worth to bundle it...");
    let simulateTx = await entryPointContract.simulateValidation(userOp);
    let simulateReceipt = await simulateTx.wait();

    // simulateReceipt.status = 1 if simulateValidation is successful or else 0.
    if (simulateReceipt.status == 1) {
        console.log("Bundler: Simulation of validation succeeded.");
        console.log("Bundler: Calling handleOps(UserOperation) on the EntryPoint contract @ " + entryPointAddress + "...");

        let handleOpsTx = await entryPointContract.handleOps([userOp]);
        let handleOpsReceipt = await handleOpsTx.wait();
        if (handleOpsReceipt.status == 1) {
            console.log("ERC 4337: handleOps call was successful, automatic execution was carried out!! 🥇🥇🥇");
            console.log("Check out the wallet's etherscan page here: " + "https://goerli.etherscan.io/address/" + deployedWalletAddress);
        } else {
            console.log("Oops-a-daisy! Something went wrong... ❌");
            console.log("-----------------------------------------------------" + '\n');
            console.log("handleOps receipt data: " + handleOpsReceipt);
        }
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

// run the automator to send the userOp to the active bundler.
async function main() {
    let userOp = await automator();
    console.log(userOp);
    console.log("🍦🍦🍦");
    console.log("-----------------------------------------------------" + '\n');
    await new Promise(resolve => setTimeout(resolve, 15000));
    console.log("Sending UserOperation object to the alternative mempool, UserOperationPool... 🏊");
    console.log("Engaging bundler to listen in to UserOperationPool...👂");
    await new Promise(resolve => setTimeout(resolve, 10000));
    bundler(userOp);
}

main();
