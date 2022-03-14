class UserOperation {
    constructor(sender, nonce, callData, signature) {
        this.sender = sender;
        this.nonce = nonce;
        this.callData = callData;
        this.signature = signature;
    }
}

module.exports = UserOperation;