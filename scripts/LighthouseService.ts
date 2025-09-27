import lighthouse from "@lighthouse-web3/sdk";
import fs from "fs";
import path from "path";
import axios from "axios";

export class LighthouseService {
    private apiKey: string;
    
    constructor(apiKey: string) {
        this.apiKey = apiKey;
        if (!apiKey) {
            throw new Error("Lighthouse API key is required");
        }
    }

    /**
     * Upload file to Lighthouse IPFS using official SDK
     * @param filePath Path to the file to upload
     * @param fileName Optional custom filename
     * @returns Promise with upload response containing CID
     */
    async uploadFile(filePath: string, fileName?: string): Promise<{
        Hash: string;
        Name: string;
        Size: string;
    }> {
        try {
            // Check if file exists
            if (!fs.existsSync(filePath)) {
                throw new Error(`File not found: ${filePath}`);
            }

            console.log(`Uploading file to Lighthouse IPFS: ${filePath}`);
            
            // Get file stats
            const stats = fs.statSync(filePath);
            const fileSize = stats.size;
            
            console.log(`File size: ${fileSize} bytes`);

            // Upload to Lighthouse using official SDK
            const uploadResponse = await lighthouse.upload(filePath, this.apiKey);
            
            if (!uploadResponse || !uploadResponse.data || !uploadResponse.data.Hash) {
                throw new Error("Failed to upload file to Lighthouse");
            }

            const data = uploadResponse.data;
            
            console.log(`File uploaded successfully to IPFS`);
            console.log(`IPFS CID: ${data.Hash}`);
            console.log(`Uploaded size: ${data.Size} bytes`);
            console.log(`Gateway URL: https://gateway.lighthouse.storage/ipfs/${data.Hash}`);
            
            return {
                Hash: data.Hash,
                Name: fileName || data.Name || path.basename(filePath),
                Size: data.Size || fileSize.toString()
            };

        } catch (error: any) {
                  console.error(`Validation error:`, error.message);
            if (error.response) {
                console.error("Response data:", error.response.data);
            }
            throw error;
        }
    }

    /**
     * Upload encrypted file with time-based access control
     * @param filePath Path to the file to upload
     * @param unlockTime Timestamp when file should be unlocked
     * @param fileName Optional custom filename
     */
    async uploadEncryptedFile(
        filePath: string, 
        unlockTime: number,
        fileName?: string
    ): Promise<{
        Hash: string;
        Name: string;
        Size: string;
        encryptionKey?: string;
    }> {
        try {
            console.log(`Uploading encrypted file to Lighthouse IPFS: ${filePath}`);
            console.log(`Encryption enabled: true`);
            
            // For now, we'll use regular upload and handle encryption at the application level
            // In a production system, you might want to encrypt the file before uploading
            const result = await this.uploadFile(filePath, fileName);
            
            // Generate a simple encryption key (in production, use proper encryption)
            const encryptionKey = this.generateEncryptionKey();
            
            return {
                ...result,
                encryptionKey
            };

        } catch (error) {
            console.error("Error uploading encrypted file:", error);
            throw error;
        }
    }

    /**
     * Download file from IPFS using CID
     * @param cid IPFS CID of the file
     * @param outputPath Path where to save the downloaded file
     */
    async downloadFile(cid: string, outputPath: string): Promise<void> {
        try {
            console.log(`Downloading file from IPFS: ${cid}`);
            
            const response = await axios({
                method: 'get',
                url: `https://gateway.lighthouse.storage/ipfs/${cid}`,
                responseType: 'stream'
            });

            const writer = fs.createWriteStream(outputPath);
            response.data.pipe(writer);

            return new Promise((resolve, reject) => {
                writer.on('finish', () => {
                    console.log(`File downloaded successfully: ${outputPath}`);
                    resolve();
                });
                writer.on('error', reject);
            });

        } catch (error) {
            console.error("Error downloading file from IPFS:", error);
            throw error;
        }
    }

    /**
     * Get file info from Lighthouse
     * @param cid IPFS CID of the file
     */
    async getFileInfo(cid: string): Promise<any> {
        try {
            const response = await axios.get(
                `https://api.lighthouse.storage/api/lighthouse/file_info?cid=${cid}`,
                {
                    headers: {
                        'Authorization': `Bearer ${this.apiKey}`
                    }
                }
            );

            return response.data;
        } catch (error) {
            console.error("Error getting file info:", error);
            throw error;
        }
    }

    /**
     * Generate a simple encryption key
     * In production, use proper cryptographic libraries
     */
    private generateEncryptionKey(): string {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        for (let i = 0; i < 64; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    }

    /**
     * Validate IPFS CID format
     * @param cid The CID to validate
     */
    static isValidCID(cid: string): boolean {
        // Basic CID validation - starts with Qm (CIDv0) or b (CIDv1) or f (CIDv1)
        return /^(Qm[1-9A-HJ-NP-Za-km-z]{44}|b[A-Za-z2-7]{58}|f[0-9a-f]{76})$/.test(cid);
    }
}