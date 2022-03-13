// SPDX-License-Identifier: MIT
pragma solidity 0.8.12;

import "hardhat/console.sol";

contract AAWallet {
    // state variables.
    address payable public owner; // the controller of the wallet.
    address payable public automator = payable(0x2D57E5E2bb5ea3BCd001668e3dEf98b6EE040E5E); // my dev wallet.
    // TODO: CHANGE THIS TO DEPLOYED ENTRY POINT ADDRESS!!
    address payable public immutable entryPoint = payable(0x2D57E5E2bb5ea3BCd001668e3dEf98b6EE040E5E); // the EntryPoint contract I have deployed to Goerli.
    uint private nonce; // the wallet nonce against double spending.
    bool private paymentAllowed;

    // initialising struct for UserOperation object.
    struct UserOperation {
        address sender;
        uint256 nonce;
        bytes callData;
        bytes signature;
    }

    // setting up ability to receive Ether.
    receive() external payable {}
    fallback() external payable {}

    constructor(address _owner) {
        // deploy with wallet's owner address.
        owner = payable(_owner);
    }

    // core ERC 4337 validation functions:
    function validateUserOp(UserOperation calldata userOp) external onlyEntryPoint {
        // for the validation to pass the paymentAllowed flag has to be true, the nonce has to be correct, and the hash of the signature (which, in turn, is a hash of a secret password known only to the owner and automator off-chain) has to match the required final hash.
        bytes32 requiredHash = hex"66578c4631aaa6b538543de104789d345fa98cd99167d68c26ff64ee6aab2c2b";
        bytes32 signatureHash = keccak256(abi.encodePacked(userOp.signature));

        require(paymentAllowed == true && nonce++ == userOp.nonce && signatureHash == requiredHash, "Signature Validation did not pass! Better luck next time ;)");

        // as validation has succeeded, it is safe to increment the nonce.
        nonce++;
    }

    function allowPayment() external onlyAutomator {
        require(paymentAllowed == false, "No need to set paymentAllowed to true twice!");
        paymentAllowed = true;
    }

    // core ERC 4337 execution function:
    // called by entryPoint, only after validateUserOp succeeded.
    // assume that for this simple example, the only execution logic is to automate a payment every day.
    function executionFromEntryPoint(bytes memory callData) external onlyEntryPoint {
        // unpacking callData.
        address dest;
        uint value;
        (dest, value) = abi.decode(callData, (address, uint));

        // main execution.
        require(paymentAllowed == true, "Automator has to allow payment before it is carried out!");
        _call(dest, value);

        // automatic payment complete so time to set the paymentAllowed flag to false.
        paymentAllowed = false;
    }
            
    // wallet core functionality:
    function _call(address payee, uint value) private {
        // sending empty data for simplicity.
        // value is almost certainly in WEI.
        (bool success, ) = payee.call{value : value}("");
        require(success, "Failed to send Ether!");
    }

    // owner's way to transfer funds.
    function _transfer(address dest, uint value) external onlyOwner {
        _call(dest, value);
    }

    // owner's way to withdraw funds.
    function _withdraw(uint value) external onlyOwner {
        _call(owner, value);
    }

    // getBalance getter.
    function getBalance() external view returns(uint) {
        uint balance = address(this).balance;
        return balance;
    }

    // change owner and automator post-hoc (exicting ERC 4337 benefits!)
    function changeOwner(address _owner) external onlyOwner {
        owner = payable(_owner);
    }

    function changeAutomator(address _automator) external onlyOwner {
        // perhaps I could allow automator to change this aswell.
        automator = payable(_automator);
    }

    // modifiers for owner, automator and entry point access.
    modifier onlyOwner() {
        require(msg.sender == owner, "Not Owner");
        _;
    }

    modifier onlyAutomator() {
        require(msg.sender == automator, "Not Automator");
        _;
    }

    modifier onlyEntryPoint() {
        require(msg.sender == entryPoint, "Not EntryPoint");
        _;
    }
}


