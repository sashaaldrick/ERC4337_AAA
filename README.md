# ERC 4337 Account Abstraction + Automation 

* A very simple barebones implementation of an automated transaction of a certain amount of ETH every day, sent on behalf of an account-abstract smart contract wallet as specified in the ERC 4337 specification, see here: https://eips.ethereum.org/EIPS/eip-4337

* Nethermine's .NET based Ethereum client has been working on an implementation and they have running validators for the UserOperation objects listening in on an alternative UserOperation mempool on the Goerli testnet. Their code can be found here: https://github.com/eth-infinitism/account-abstraction
 
* It is well tested and written quite well but lacks any documentation whatsoever other than some doc strings on the main functions. For this reason, I attempted to fork their code and write a smart contract wallet there and the automation, but it is quite a large codebase and therefore defeats the main point of a simple barebones implementation to understand the fundamental concepts of ERC 4337.
 
* For this reason, I have used some of their code and attempted to comply with their mempool on the Goerli testnet. Their validators are quite slow, so in practice I have also written a script to act as a bundler just on one UserOperation sent to it for demonstration purposes.


**TODO**:
## Hardhat
* [X] Set up hardhat repo with all required plugins - but keep it minimal, connect it to Goerli.
* [X] Connect it properly to a .env file with the required information.
## Account Abstraction
~~* [ ] Get the ABI for the EntryPoint contract and connect it within your code.~~
* [ ] Create a skeleton SimpleWallet.sol that contains:
	* function validateUserOp(UserOperation calldata userOp, bytes32 requestId, uint requiredPrefund):
		* This function can contain any signature verification scheme, and implement a very simple way of checking if the UserOperation sent to the mempool is valid and therefore 'allows' handleOps in the entry point contract to call the wallets execution code i.e. transfer of ETH to a certain address.
	* Key point: perhaps ignore gas for this basic implementation as it not super necessary to understand what is going on. This depends on how tricky it is to deploy a UserOperation object to the nodes on Goerli.
* [ ] Create a very simple EntryPoint.sol that I deploy to act as a very simple ERC 4337 compliant entry point contract.
* [ ] Create a bundler script that takes an argument of a UserOperation that, we shall say for simplicity, is already in the figurative mempool and carry out the handleOps call on the entry point contract that I have deployed. This is to mimic the full specification in ERC 4337 but in a very easy to follow way.

## Non-Account Abstraction
* How would this work at the moment with EOAs?:
	* An EOA would have to sign a transaction every day for there to be a transfer. The automation would have to be handled like Gelato does with canExec and execPayload or ChainLink Keepers with checkUpkeep and performUpkeep on a non ERC 4337 smart contract wallet. This wallet has no way of executing code without an EOA calling and triggering the execution every time. The advantage of ERC 4337 smart contract wallet shines through here, as the user can be completely hands off after funding the wallet and all that is required is something who can pass the signature check to execute code without any direct calls of any smart contract functions or any EOAs (...private keys) required.
