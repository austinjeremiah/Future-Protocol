import axios from 'axios'

export interface UploadResult {
  Hash: string
  Name: string
  Size: string
}

export class LighthouseService {
  private apiKey: string
  private baseUrl = 'https://node.lighthouse.storage'

  constructor(apiKey: string) {
    this.apiKey = apiKey
  }

  async uploadFile(file: File): Promise<UploadResult> {
    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await axios.post(
        `${this.baseUrl}/api/v0/add`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      )

      return response.data
    } catch (error) {
      console.error('Lighthouse upload failed:', error)
      throw new Error('Failed to upload file to IPFS')
    }
  }

  async uploadText(content: string, fileName: string = 'content.txt'): Promise<UploadResult> {
    const blob = new Blob([content], { type: 'text/plain' })
    const file = new File([blob], fileName, { type: 'text/plain' })

    return this.uploadFile(file)
  }

  async retrieveFile(cid: string): Promise<string> {
    try {
      const response = await axios.get(`https://gateway.lighthouse.storage/ipfs/${cid}`)
      return response.data
    } catch (error) {
      console.error('Failed to retrieve file from IPFS:', error)
      throw new Error('Failed to retrieve file from IPFS')
    }
  }

  getGatewayUrl(cid: string): string {
    return `https://gateway.lighthouse.storage/ipfs/${cid}`
  }
}