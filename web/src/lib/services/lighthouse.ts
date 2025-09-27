// lib/services/lighthouse.ts - Lighthouse IPFS service for file uploads
import { LIGHTHOUSE_CONFIG } from '../config';
import { UploadResponse } from '../types';

export class LighthouseService {
  private apiKey: string;

  constructor() {
    this.apiKey = LIGHTHOUSE_CONFIG.apiKey;
    if (!this.apiKey) {
      console.warn("Lighthouse API key not found in environment variables. File uploads will not work.");
    }
  }

  /**
   * Upload file to Lighthouse IPFS
   * @param file File to upload
   * @param fileName Optional custom filename
   * @returns Promise with upload response containing CID
   */
  async uploadFile(file: File, fileName?: string): Promise<UploadResponse> {
    try {
      if (!this.apiKey) {
        throw new Error("Lighthouse API key is required. Please add NEXT_PUBLIC_LIGHTHOUSE_API_KEY to your .env.local file. Get a free API key from https://lighthouse.storage");
      }

      console.log(`Uploading file to Lighthouse IPFS: ${file.name}`);
      console.log(`File size: ${file.size} bytes`);

      const formData = new FormData();
      formData.append('file', file, fileName || file.name);

      const response = await fetch('https://node.lighthouse.storage/api/v0/add', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data || !data.Hash) {
        throw new Error("Failed to upload file to Lighthouse");
      }

      console.log(`File uploaded successfully to IPFS`);
      console.log(`CID: ${data.Hash}`);
      console.log(`Gateway URL: ${LIGHTHOUSE_CONFIG.gateway}${data.Hash}`);

      return {
        Hash: data.Hash,
        Name: data.Name || file.name,
        Size: data.Size || file.size.toString()
      };

    } catch (error) {
      console.error("Error uploading to Lighthouse:", error);
      throw error;
    }
  }

  /**
   * Upload text content to Lighthouse IPFS
   * @param content Text content to upload
   * @param fileName Name for the file
   * @returns Promise with upload response containing CID
   */
  async uploadText(content: string, fileName: string): Promise<UploadResponse> {
    const blob = new Blob([content], { type: 'text/plain' });
    const file = new File([blob], fileName, { type: 'text/plain' });
    return this.uploadFile(file, fileName);
  }

  /**
   * Get the gateway URL for accessing a file by CID
   * @param cid IPFS CID
   * @returns Gateway URL
   */
  getGatewayUrl(cid: string): string {
    return `${LIGHTHOUSE_CONFIG.gateway}${cid}`;
  }

  /**
   * Download file content from IPFS by CID
   * @param cid IPFS CID
   * @returns Promise with file content as text
   */
  async downloadFile(cid: string): Promise<string> {
    try {
      const url = this.getGatewayUrl(cid);
      console.log(`Downloading file from IPFS: ${url}`);

      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const content = await response.text();
      console.log(`File downloaded successfully from IPFS`);
      
      return content;

    } catch (error) {
      console.error("Error downloading from IPFS:", error);
      throw error;
    }
  }
}