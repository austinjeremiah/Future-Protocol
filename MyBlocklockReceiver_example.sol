// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

contract MyBlocklockReceiver {
    /**
     * @dev Create timelock request with direct funding
     * @param callbackGasLimit Gas limit for the callback function
     * @param conditionBytes Encoded condition bytes from encodeCondition()
     * @param ciphertext Encoded ciphertext from encodeCiphertextToSolidity()
     */
    function createTimelockRequestWithDirectFunding(
        uint256 callbackGasLimit,
        bytes memory conditionBytes,
        bytes memory ciphertext
    ) external payable returns (uint256) {
        // Your contract implementation here
        // This method should:
        // 1. Forward msg.value to Blocklock network
        // 2. Store the request details
        // 3. Return a request ID
        // 4. Set up callback handling for decryption key
        
        return block.timestamp; // Placeholder return
    }
}