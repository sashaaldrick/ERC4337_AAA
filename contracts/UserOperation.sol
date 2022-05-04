// SPDX-License-Identifier: MIT
pragma solidity ^0.8.12;

struct UserOperation {
    address sender;
    uint256 nonce;
    bytes callData;
    bytes signature;
}
