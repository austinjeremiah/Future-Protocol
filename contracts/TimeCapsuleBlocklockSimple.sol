// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

/**
 * @title TimeCapsuleBlocklockSimple
 * @dev Simplified TimeCapsule contract with Blocklock integration placeholder
 * This version maintains compatibility while preparing for full Blocklock integration
 */
contract TimeCapsuleBlocklockSimple {
    struct TimeCapsule {
        string ipfsCid;                    // IPFS CID from Lighthouse
        uint256 blocklockRequestId;        // Placeholder for Blocklock request ID
        bytes encryptedData;               // Encrypted data (simplified)
        uint256 unlockTime;                // Timestamp when capsule can be unlocked
        uint256 creationTime;              // Timestamp when capsule was created
        address creator;                   // Address of the creator
        string recipientEmail;             // Recipient email
        string title;                      // Capsule title/description
        bool isUnlocked;                   // Whether the capsule has been unlocked
        uint256 fileSize;                  // Size of the stored file in bytes
        string fileType;                   // MIME type of the stored file
        bytes decryptionKey;               // Decrypted key (populated after unlock)
        bool hasDecryptionKey;             // Flag to check if decryption key is available
        bool useBlocklock;                 // Whether this capsule uses Blocklock
    }

    mapping(uint256 => TimeCapsule) public timeCapsules;
    mapping(address => uint256[]) public userCapsules;
    mapping(uint256 => uint256) public blocklockToCapsule; // Maps Blocklock request ID to capsule ID
    
    uint256 public nextCapsuleId;
    uint256 public totalCapsules;
    
    event TimeCapsuleCreated(
        uint256 indexed capsuleId,
        string ipfsCid,
        uint256 blocklockRequestId,
        uint256 unlockTime,
        uint256 creationTime,
        address indexed creator,
        string title,
        uint256 fileSize,
        bool useBlocklock
    );
    
    event TimeCapsuleUnlocked(
        uint256 indexed capsuleId,
        string ipfsCid,
        address indexed unlocker,
        uint256 unlockTime
    );
    
    event DecryptionKeyReceived(
        uint256 indexed capsuleId,
        uint256 indexed blocklockRequestId,
        bytes decryptionKey
    );
    
    event CIDStored(
        uint256 indexed capsuleId,
        string ipfsCid,
        uint256 timestamp
    );

    constructor() {
        nextCapsuleId = 1;
        totalCapsules = 0;
    }

    /**
     * @dev Create a new time capsule with Blocklock encryption (placeholder implementation)
     * @param _ipfsCid The IPFS CID returned from Lighthouse
     * @param _encryptedData Encrypted data as bytes
     * @param _unlockTime Timestamp when the capsule can be unlocked
     * @param _recipientEmail Recipient email
     * @param _title Title/description of the capsule
     * @param _fileSize Size of the file in bytes
     * @param _fileType MIME type of the file
     */
    function createTimeCapsuleWithBlocklock(
        string memory _ipfsCid,
        bytes memory _encryptedData,
        uint256 _unlockTime,
        string memory _recipientEmail,
        string memory _title,
        uint256 _fileSize,
        string memory _fileType
    ) external payable returns (uint256, uint256) {
        require(bytes(_ipfsCid).length > 0, "IPFS CID cannot be empty");
        require(_unlockTime > block.timestamp, "Unlock time must be in the future");
        require(bytes(_title).length > 0, "Title cannot be empty");
        
        uint256 capsuleId = nextCapsuleId;
        
        // Simulate Blocklock request ID
        uint256 blocklockRequestId = uint256(keccak256(abi.encodePacked(capsuleId, block.timestamp)));
        
        // Store the mapping between Blocklock request and capsule
        blocklockToCapsule[blocklockRequestId] = capsuleId;
        
        timeCapsules[capsuleId] = TimeCapsule({
            ipfsCid: _ipfsCid,
            blocklockRequestId: blocklockRequestId,
            encryptedData: _encryptedData,
            unlockTime: _unlockTime,
            creationTime: block.timestamp,
            creator: msg.sender,
            recipientEmail: _recipientEmail,
            title: _title,
            isUnlocked: false,
            fileSize: _fileSize,
            fileType: _fileType,
            decryptionKey: "",
            hasDecryptionKey: false,
            useBlocklock: true
        });
        
        userCapsules[msg.sender].push(capsuleId);
        
        nextCapsuleId++;
        totalCapsules++;
        
        emit TimeCapsuleCreated(
            capsuleId,
            _ipfsCid,
            blocklockRequestId,
            _unlockTime,
            block.timestamp,
            msg.sender,
            _title,
            _fileSize,
            true
        );
        
        emit CIDStored(capsuleId, _ipfsCid, block.timestamp);
        
        // Return request price (0.001 ETH for testing)
        return (capsuleId, 0.001 ether);
    }

    /**
     * @dev Create a simple time capsule without Blocklock
     * @param _ipfsCid The IPFS CID returned from Lighthouse
     * @param _encryptionKey Simple encryption key
     * @param _unlockTime Timestamp when the capsule can be unlocked
     * @param _recipientEmail Recipient email
     * @param _title Title/description of the capsule
     * @param _fileSize Size of the file in bytes
     * @param _fileType MIME type of the file
     */
    function createSimpleTimeCapsule(
        string memory _ipfsCid,
        string memory _encryptionKey,
        uint256 _unlockTime,
        string memory _recipientEmail,
        string memory _title,
        uint256 _fileSize,
        string memory _fileType
    ) external returns (uint256) {
        require(bytes(_ipfsCid).length > 0, "IPFS CID cannot be empty");
        require(_unlockTime > block.timestamp, "Unlock time must be in the future");
        require(bytes(_title).length > 0, "Title cannot be empty");
        
        uint256 capsuleId = nextCapsuleId;
        
        timeCapsules[capsuleId] = TimeCapsule({
            ipfsCid: _ipfsCid,
            blocklockRequestId: 0, // No Blocklock request for simple capsules
            encryptedData: bytes(_encryptionKey),
            unlockTime: _unlockTime,
            creationTime: block.timestamp,
            creator: msg.sender,
            recipientEmail: _recipientEmail,
            title: _title,
            isUnlocked: false,
            fileSize: _fileSize,
            fileType: _fileType,
            decryptionKey: bytes(_encryptionKey),
            hasDecryptionKey: true, // Immediately available for simple capsules
            useBlocklock: false
        });
        
        userCapsules[msg.sender].push(capsuleId);
        
        nextCapsuleId++;
        totalCapsules++;
        
        emit TimeCapsuleCreated(
            capsuleId,
            _ipfsCid,
            0, // No Blocklock request ID
            _unlockTime,
            block.timestamp,
            msg.sender,
            _title,
            _fileSize,
            false
        );
        
        emit CIDStored(capsuleId, _ipfsCid, block.timestamp);
        
        return capsuleId;
    }

    /**
     * @dev Create timelock request with direct funding following Blocklock.js pattern
     * @param _ipfsCid The IPFS CID returned from Lighthouse
     * @param callbackGasLimit Gas limit for the callback function
     * @param conditionBytes Encoded condition bytes from encodeCondition()
     * @param ciphertext Encoded ciphertext from encodeCiphertextToSolidity()
     * @param _recipientEmail Recipient email
     * @param _title Title/description of the capsule
     * @param _fileSize Size of the file in bytes
     * @param _fileType MIME type of the file
     */
    function createTimelockRequestWithDirectFunding(
        string memory _ipfsCid,
        uint256 callbackGasLimit,
        bytes memory conditionBytes,
        bytes memory ciphertext,
        string memory _recipientEmail,
        string memory _title,
        uint256 _fileSize,
        string memory _fileType
    ) external payable returns (uint256, uint256) {
        require(bytes(_ipfsCid).length > 0, "IPFS CID cannot be empty");
        require(callbackGasLimit > 0, "Callback gas limit must be positive");
        require(conditionBytes.length > 0, "Condition bytes cannot be empty");
        require(ciphertext.length > 0, "Ciphertext cannot be empty");
        require(bytes(_title).length > 0, "Title cannot be empty");
        require(msg.value > 0, "Must send ETH for Blocklock callback fee");
        
        uint256 capsuleId = nextCapsuleId;
        
        uint256 blocklockRequestId = uint256(keccak256(abi.encodePacked(
            capsuleId, 
            block.timestamp, 
            conditionBytes,
            ciphertext
        )));
        
        blocklockToCapsule[blocklockRequestId] = capsuleId;
        
        uint256 unlockTime = decodeUnlockTimeFromCondition(conditionBytes);
        
        // Create the time capsule
        timeCapsules[capsuleId] = TimeCapsule({
            ipfsCid: _ipfsCid,
            blocklockRequestId: blocklockRequestId,
            encryptedData: ciphertext,
            unlockTime: unlockTime,
            creationTime: block.timestamp,
            creator: msg.sender,
            recipientEmail: _recipientEmail,
            title: _title,
            isUnlocked: false,
            fileSize: _fileSize,
            fileType: _fileType,
            decryptionKey: "",
            hasDecryptionKey: false,
            useBlocklock: true
        });
        
        // Add to user's capsules
        userCapsules[msg.sender].push(capsuleId);
        
        nextCapsuleId++;
        totalCapsules++;
        
        // Store callback gas limit and condition for Blocklock processing
        // In production, this data would be sent to Blocklock network
        
        emit TimeCapsuleCreated(
            capsuleId,
            _ipfsCid,
            blocklockRequestId,
            unlockTime,
            block.timestamp,
            msg.sender,
            _title,
            _fileSize,
            true
        );
        
        emit CIDStored(capsuleId, _ipfsCid, block.timestamp);
        
        // Note: In production, the msg.value would be forwarded to Blocklock network
        // For demo purposes, we keep it in contract
        
        return (capsuleId, blocklockRequestId);
    }

    /**
     * @dev Simulate receiving decryption key (for testing Blocklock functionality)
     * @param _requestId Blocklock request ID
     * @param decryptionKey The decryption key
     */
    function simulateBlocklockCallback(uint256 _requestId, bytes memory decryptionKey) external {
        uint256 capsuleId = blocklockToCapsule[_requestId];
        require(capsuleId != 0, "Invalid Blocklock request ID");
        
        TimeCapsule storage capsule = timeCapsules[capsuleId];
        require(capsule.blocklockRequestId == _requestId, "Request ID mismatch");
        require(block.timestamp >= capsule.unlockTime, "Not yet unlockable");
        
        // Store the decryption key
        capsule.decryptionKey = decryptionKey;
        capsule.hasDecryptionKey = true;
        
        emit DecryptionKeyReceived(capsuleId, _requestId, decryptionKey);
    }

    /**
     * @dev Unlock a time capsule if the unlock time has passed and decryption key is available
     * @param _capsuleId ID of the time capsule to unlock
     */
    function unlockTimeCapsule(uint256 _capsuleId) external returns (string memory, bytes memory) {
        require(_capsuleId < nextCapsuleId, "Capsule does not exist");
        
        TimeCapsule storage capsule = timeCapsules[_capsuleId];
        require(block.timestamp >= capsule.unlockTime, "Capsule is still locked");
        require(!capsule.isUnlocked, "Capsule already unlocked");
        
        // For Blocklock capsules, ensure decryption key is available
        if (capsule.useBlocklock) {
            require(capsule.hasDecryptionKey, "Decryption key not yet available");
        }
        
        capsule.isUnlocked = true;
        
        emit TimeCapsuleUnlocked(
            _capsuleId,
            capsule.ipfsCid,
            msg.sender,
            block.timestamp
        );
        
        return (capsule.ipfsCid, capsule.decryptionKey);
    }

    /**
     * @dev Get time capsule details
     * @param _capsuleId ID of the time capsule
     */
    function getTimeCapsule(uint256 _capsuleId) external view returns (
        string memory ipfsCid,
        uint256 blocklockRequestId,
        uint256 unlockTime,
        uint256 creationTime,
        address creator,
        string memory recipientEmail,
        string memory title,
        bool isUnlocked,
        uint256 fileSize,
        string memory fileType,
        bool hasDecryptionKey,
        bool useBlocklock
    ) {
        require(_capsuleId < nextCapsuleId, "Capsule does not exist");
        
        TimeCapsule memory capsule = timeCapsules[_capsuleId];
        
        return (
            capsule.ipfsCid,
            capsule.blocklockRequestId,
            capsule.unlockTime,
            capsule.creationTime,
            capsule.creator,
            capsule.recipientEmail,
            capsule.title,
            capsule.isUnlocked,
            capsule.fileSize,
            capsule.fileType,
            capsule.hasDecryptionKey,
            capsule.useBlocklock
        );
    }

    /**
     * @dev Get decryption key for an unlocked capsule
     * @param _capsuleId ID of the time capsule
     */
    function getDecryptionKey(uint256 _capsuleId) external view returns (bytes memory) {
        require(_capsuleId < nextCapsuleId, "Capsule does not exist");
        
        TimeCapsule memory capsule = timeCapsules[_capsuleId];
        require(capsule.isUnlocked || block.timestamp >= capsule.unlockTime, "Capsule is still locked");
        require(capsule.hasDecryptionKey, "Decryption key not available");
        
        return capsule.decryptionKey;
    }

    /**
     * @dev Get user's time capsules
     * @param _user Address of the user
     */
    function getUserCapsules(address _user) external view returns (uint256[] memory) {
        return userCapsules[_user];
    }

    /**
     * @dev Check if a capsule can be unlocked
     * @param _capsuleId ID of the time capsule
     */
    function canUnlock(uint256 _capsuleId) external view returns (bool) {
        require(_capsuleId < nextCapsuleId, "Capsule does not exist");
        
        TimeCapsule memory capsule = timeCapsules[_capsuleId];
        
        if (capsule.useBlocklock) {
            return block.timestamp >= capsule.unlockTime && 
                   !capsule.isUnlocked && 
                   capsule.hasDecryptionKey;
        } else {
            return block.timestamp >= capsule.unlockTime && !capsule.isUnlocked;
        }
    }

    /**
     * @dev Get the remaining time until unlock
     * @param _capsuleId ID of the time capsule
     */
    function getTimeUntilUnlock(uint256 _capsuleId) external view returns (uint256) {
        require(_capsuleId < nextCapsuleId, "Capsule does not exist");
        
        TimeCapsule memory capsule = timeCapsules[_capsuleId];
        
        if (block.timestamp >= capsule.unlockTime) {
            return 0;
        }
        
        return capsule.unlockTime - block.timestamp;
    }

    /**
     * @dev Get total number of capsules
     */
    function getTotalCapsules() external view returns (uint256) {
        return totalCapsules;
    }

    /**
     * @dev Check if capsule uses Blocklock encryption
     * @param _capsuleId ID of the time capsule
     */
    function isBlocklockCapsule(uint256 _capsuleId) external view returns (bool) {
        require(_capsuleId < nextCapsuleId, "Capsule does not exist");
        
        TimeCapsule memory capsule = timeCapsules[_capsuleId];
        return capsule.useBlocklock;
    }

    function decodeUnlockTimeFromCondition(bytes memory conditionBytes) internal pure returns (uint256) {
        if (conditionBytes.length >= 32) {
            return abi.decode(conditionBytes, (uint256));
        }
        return 3600;
    }

    function getBlocklockPrice(uint32, uint256) external pure returns (uint256) {
        return 0.001 ether;
    }
}