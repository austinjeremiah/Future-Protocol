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
   * Download file content from IPFS by CID as text (for text files)
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

  /**
   * Download file as blob from IPFS by CID (for all file types including PDFs)
   * @param cid IPFS CID
   * @returns Promise with file info and download URL
   */
  async downloadFileAsBlob(cid: string): Promise<{
    blob: Blob;
    contentType: string;
    size: number;
    downloadUrl: string;
    gatewayUrl: string;
  }> {
    try {
      const url = this.getGatewayUrl(cid);
      console.log(`📥 Downloading file as blob from IPFS: ${url}`);

      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const blob = await response.blob();
      const contentType = response.headers.get('content-type') || 'application/octet-stream';
      const size = blob.size;
      
      // Create a download URL for the blob
      const downloadUrl = URL.createObjectURL(blob);
      
      console.log(`✅ File downloaded successfully from IPFS`);
      console.log(`   Content Type: ${contentType}`);
      console.log(`   File Size: ${size} bytes`);
      
      return {
        blob,
        contentType,
        size,
        downloadUrl,
        gatewayUrl: url
      };

    } catch (error) {
      console.error("❌ Error downloading file as blob from IPFS:", error);
      throw error;
    }
  }

  /**
   * Trigger file download in browser
   * @param cid IPFS CID
   * @param fileName Optional filename for download
   */
  async downloadFileForUser(cid: string, fileName?: string): Promise<void> {
    try {
      console.log(`🚀 Initiating file download for user: ${cid}`);
      
      const fileData = await this.downloadFileAsBlob(cid);
      
      // Determine file extension from content type
      let extension = '';
      if (fileData.contentType.includes('pdf')) extension = '.pdf';
      else if (fileData.contentType.includes('text')) extension = '.txt';
      else if (fileData.contentType.includes('image')) {
        if (fileData.contentType.includes('png')) extension = '.png';
        else if (fileData.contentType.includes('jpeg') || fileData.contentType.includes('jpg')) extension = '.jpg';
      }
      
      const downloadFileName = fileName || `timecapsule-${cid.slice(-8)}${extension}`;
      
      // Create download link and trigger download
      const link = document.createElement('a');
      link.href = fileData.downloadUrl;
      link.download = downloadFileName;
      link.style.display = 'none';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up the object URL after a delay
      setTimeout(() => {
        URL.revokeObjectURL(fileData.downloadUrl);
      }, 100);
      
      console.log(`✅ File download initiated: ${downloadFileName}`);
      
    } catch (error) {
      console.error("❌ Error initiating file download:", error);
      throw error;
    }
  }

  /**
   * Get file metadata from IPFS
   * @param cid IPFS CID
   * @returns Promise with file metadata
   */
  async getFileMetadata(cid: string): Promise<{
    contentType: string;
    size: number;
    isViewable: boolean;
    fileType: string;
  }> {
    try {
      const url = this.getGatewayUrl(cid);
      console.log(`🔍 Getting metadata for CID: ${cid}`);
      console.log(`🌐 Gateway URL: ${url}`);
      
      const response = await fetch(url, { method: 'HEAD' });
      console.log(`📡 Response Status: ${response.status} ${response.statusText}`);
      
      if (!response.ok) {
        console.log(`❌ HTTP error getting metadata for ${cid}:`, response.status, response.statusText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const contentType = response.headers.get('content-type') || 'application/octet-stream';
      const contentLength = response.headers.get('content-length');
      const size = contentLength ? parseInt(contentLength) : 0;
      
      console.log(`📝 Content-Type: ${contentType}`);
      console.log(`📊 Content-Length: ${contentLength} (${size} bytes)`);
      
      // Log all response headers for debugging
      console.log('📋 All Response Headers:');
      for (const [key, value] of response.headers.entries()) {
        console.log(`   ${key}: ${value}`);
      }
      
      // Determine if file can be viewed in browser
      const isViewable = contentType.startsWith('text/') || 
                        contentType.includes('pdf') ||
                        contentType.startsWith('image/');
      
      let fileType = 'Unknown';
      if (contentType.includes('pdf')) fileType = 'PDF';
      else if (contentType.includes('text')) fileType = 'Text';
      else if (contentType.includes('image')) fileType = 'Image';
      else if (contentType.includes('video')) fileType = 'Video';
      else if (contentType.includes('audio')) fileType = 'Audio';
      
      const metadata = {
        contentType,
        size,
        isViewable,
        fileType
      };
      
      console.log(`✅ File metadata retrieved successfully:`, metadata);
      return metadata;
      
    } catch (error) {
      console.error(`❌ Error getting file metadata for CID ${cid}:`, error);
      return {
        contentType: 'application/octet-stream',
        size: 0,
        isViewable: false,
        fileType: 'Unknown'
      };
    }
  }
}