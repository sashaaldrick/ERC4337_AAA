// SPDX-License-Identifier: MIT
pragma solidity 0.8.12;

import "./UserOperation.sol";

interface IAAWallet {
    // an interface to allow the entry point contract to call the core ERC 4337 wallet functions.
    function validateUserOp(UserOperation calldata userOp, bool simulate) external;
    function executionFromEntryPoint(bytes memory callData) external returns(address payable destination, uint amount, bool success);

}