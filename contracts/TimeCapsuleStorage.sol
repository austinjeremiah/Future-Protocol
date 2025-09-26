// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

/**
 * @title TimeCapsuleStorage
 * @dev Contract to store time-locked IPFS CIDs with metadata
 * Integrates with Lighthouse IPFS for decentralized file storage
 */
contract TimeCapsuleStorage {
    struct TimeCapsule {
        string ipfsCid;           // IPFS CID from Lighthouse
        string encryptionKey;     // Encrypted key for file access
        uint256 unlockTime;       // Timestamp when capsule can be unlocked
        uint256 creationTime;     // Timestamp when capsule was created
        address creator;          // Address of the creator
        string recipientEmail;    // Encrypted recipient email
        string title;             // Capsule title/description
        bool isUnlocked;          // Whether the capsule has been unlocked
        uint256 fileSize;         // Size of the stored file in bytes
        string fileType;          // MIME type of the stored file
    }

    mapping(uint256 => TimeCapsule) public timeCapsules;
    mapping(address => uint256[]) public userCapsules;
    
    uint256 public nextCapsuleId;
    uint256 public totalCapsules;
    
    event TimeCapsuleCreated(
        uint256 indexed capsuleId,
        string ipfsCid,
        uint256 unlockTime,
        uint256 creationTime,
        address indexed creator,
        string title,
        uint256 fileSize
    );
    
    event TimeCapsuleUnlocked(
        uint256 indexed capsuleId,
        string ipfsCid,
        address indexed unlocker,
        uint256 unlockTime
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
     * @dev Create a new time capsule with IPFS CID and metadata
     * @param _ipfsCid The IPFS CID returned from Lighthouse
     * @param _encryptionKey Encrypted key for file access
     * @param _unlockTime Timestamp when the capsule can be unlocked
     * @param _recipientEmail Encrypted recipient email
     * @param _title Title/description of the capsule
     * @param _fileSize Size of the file in bytes
     * @param _fileType MIME type of the file
     */
    function createTimeCapsule(
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
            encryptionKey: _encryptionKey,
            unlockTime: _unlockTime,
            creationTime: block.timestamp,
            creator: msg.sender,
            recipientEmail: _recipientEmail,
            title: _title,
            isUnlocked: false,
            fileSize: _fileSize,
            fileType: _fileType
        });
        
        userCapsules[msg.sender].push(capsuleId);
        
        nextCapsuleId++;
        totalCapsules++;
        
        emit TimeCapsuleCreated(
            capsuleId,
            _ipfsCid,
            _unlockTime,
            block.timestamp,
            msg.sender,
            _title,
            _fileSize
        );
        
        emit CIDStored(capsuleId, _ipfsCid, block.timestamp);
        
        return capsuleId;
    }

    /**
     * @dev Unlock a time capsule if the unlock time has passed
     * @param _capsuleId ID of the time capsule to unlock
     */
    function unlockTimeCapsule(uint256 _capsuleId) external returns (string memory) {
        require(_capsuleId < nextCapsuleId, "Capsule does not exist");
        
        TimeCapsule storage capsule = timeCapsules[_capsuleId];
        require(block.timestamp >= capsule.unlockTime, "Capsule is still locked");
        require(!capsule.isUnlocked, "Capsule already unlocked");
        
        capsule.isUnlocked = true;
        
        emit TimeCapsuleUnlocked(
            _capsuleId,
            capsule.ipfsCid,
            msg.sender,
            block.timestamp
        );
        
        return capsule.ipfsCid;
    }

    /**
     * @dev Get time capsule details
     * @param _capsuleId ID of the time capsule
     */
    function getTimeCapsule(uint256 _capsuleId) external view returns (
        string memory ipfsCid,
        string memory encryptionKey,
        uint256 unlockTime,
        uint256 creationTime,
        address creator,
        string memory recipientEmail,
        string memory title,
        bool isUnlocked,
        uint256 fileSize,
        string memory fileType
    ) {
        require(_capsuleId < nextCapsuleId, "Capsule does not exist");
        
        TimeCapsule memory capsule = timeCapsules[_capsuleId];
        
        return (
            capsule.ipfsCid,
            capsule.encryptionKey,
            capsule.unlockTime,
            capsule.creationTime,
            capsule.creator,
            capsule.recipientEmail,
            capsule.title,
            capsule.isUnlocked,
            capsule.fileSize,
            capsule.fileType
        );
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
        return block.timestamp >= capsule.unlockTime && !capsule.isUnlocked;
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
}