// SPDX-License-Identifier: MIT
pragma solidity 0.8.12;

import "hardhat/console.sol";

struct UserOperation {
    address sender;
    uint256 nonce;
    bytes callData;
    bytes signature;
}
