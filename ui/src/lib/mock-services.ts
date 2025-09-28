// Mock services for Future Protocol - Browser-safe implementations

import { ethers } from 'ethers'
import QRCode from 'qrcode'
import { BrowserCrypto } from './browser-crypto'

// Types
export interface TimeCapsuleData {
  title: string
  content: string
  recipientEmail: string
  unlockTime: number
  fileType: 'text' | 'file'
  file?: File
}

export interface WorkflowResult {
  success: boolean
  timeCapsuleId: number
  transactionHash: string
  verificationId: string
  ipfsCid: string
  qrCodeUrl: string
  phases: string[]
  executionTime: number
}

// Mock IPFS Service
export class MockIPFSService {
  async uploadContent(content: string, filename: string): Promise<string> {
    // Simulate upload delay
    await new Promise(resolve => setTimeout(resolve, 1500))

    // Generate mock IPFS CID
    const contentHash = BrowserCrypto.createHash(content + filename + Date.now())
    return `bafkrei${contentHash.slice(2, 22)}`
  }

  async uploadFile(file: File): Promise<string> {
    // Simulate upload delay
    await new Promise(resolve => setTimeout(resolve, 2000))

    // Generate mock IPFS CID
    const fileHash = BrowserCrypto.createHash(file.name + file.size + Date.now())
    return `bafkrei${fileHash.slice(2, 22)}`
  }

  getGatewayUrl(cid: string): string {
    return `https://ipfs.io/ipfs/${cid}`
  }
}

// Mock Self Protocol Service
export class MockSelfProtocolService {
  async generateVerificationQR(userAddress: string): Promise<{
    qrCodeUrl: string
    verificationId: string
    universalLink: string
    sessionId: string
  }> {
    const sessionId = BrowserCrypto.generateUUID()
    const verificationId = BrowserCrypto.createHash(userAddress + sessionId)

    // Create mock universal link
    const universalLink = `https://self.xyz/verify?session=${sessionId}&user=${userAddress.slice(0, 10)}&requirements=age18,non-us`

    // Generate QR code
    const qrCodeUrl = await QRCode.toDataURL(universalLink, {
      errorCorrectionLevel: 'M',
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      },
      width: 256
    })

    return {
      qrCodeUrl,
      verificationId,
      universalLink,
      sessionId
    }
  }

  getRequirements(): string[] {
    return [
      'Must be 18 years or older',
      'Non-US residents only',
      'Valid government-issued ID required',
      'Self Protocol mobile app (Demo Mode)'
    ]
  }

  getInstructions(): string[] {
    return [
      'Open the Self Protocol mobile app',
      'Scan the QR code or use the universal link',
      'Complete identity verification process',
      'Return here - verification will auto-complete in 30 seconds',
      'Click "Mark as Verified" button as backup'
    ]
  }

  async waitForVerification(sessionId: string, timeoutMs: number = 30000): Promise<boolean> {
    // Auto-complete after timeout for demo
    return new Promise((resolve) => {
      setTimeout(() => resolve(true), timeoutMs)
    })
  }
}

// Mock Blocklock Service
export class MockBlocklockService {
  async encryptContent(content: string, targetBlock: number): Promise<{
    ciphertext: string
    targetBlock: number
    currentBlock: number
  }> {
    // Simulate encryption delay
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Mock encryption
    const encrypted = ethers.hexlify(ethers.toUtf8Bytes(content))
    const currentBlock = Math.floor(Math.random() * 1000000) + 50000000

    return {
      ciphertext: encrypted,
      targetBlock: currentBlock + targetBlock,
      currentBlock
    }
  }

  async getCurrentBlock(): Promise<number> {
    return Math.floor(Math.random() * 1000000) + 50000000
  }

  estimateUnlockTime(blocks: number): string {
    const minutes = blocks * 0.5 // 30 seconds per block for demo
    if (minutes < 60) return `~${Math.round(minutes)} minutes`
    const hours = Math.floor(minutes / 60)
    const mins = Math.round(minutes % 60)
    return `~${hours}h ${mins}m`
  }
}

// Mock TimeCapsule Contract Service
export class MockTimeCapsuleContract {
  constructor(private signer: ethers.Signer) {}

  async createTimeCapsule(data: TimeCapsuleData, ipfsCid: string, encryptionData: any): Promise<{
    transactionHash: string
    timeCapsuleId: number
    blockNumber: number
    gasUsed: string
  }> {
    // Simulate blockchain transaction
    await new Promise(resolve => setTimeout(resolve, 3000))

    const txHash = BrowserCrypto.randomHex(32)
    const timeCapsuleId = Math.floor(Math.random() * 10000) + 1
    const blockNumber = Math.floor(Math.random() * 1000) + 50000000
    const gasUsed = (Math.floor(Math.random() * 100000) + 200000).toString()

    return {
      transactionHash: txHash,
      timeCapsuleId,
      blockNumber,
      gasUsed
    }
  }

  async getTimeCapsule(id: number): Promise<{
    title: string
    creator: string
    recipient: string
    unlockTime: number
    isUnlocked: boolean
    ipfsCid: string
  }> {
    return {
      title: `TimeCapsule #${id}`,
      creator: await this.signer.getAddress(),
      recipient: 'demo@example.com',
      unlockTime: Date.now() + 86400000, // 24 hours from now
      isUnlocked: false,
      ipfsCid: 'bafkrei...'
    }
  }
}

// Mock zkTLS Service
export class MockZKTLSService {
  generateProof(): {
    protocol: string
    curve: string
    proofHash: string
    timestamp: number
  } {
    const proofData = {
      protocol: 'Groth16',
      curve: 'bn128',
      proof: {
        a: [BrowserCrypto.randomHex(32), BrowserCrypto.randomHex(32)],
        b: [[BrowserCrypto.randomHex(32), BrowserCrypto.randomHex(32)], [BrowserCrypto.randomHex(32), BrowserCrypto.randomHex(32)]],
        c: [BrowserCrypto.randomHex(32), BrowserCrypto.randomHex(32)]
      },
      publicSignals: [BrowserCrypto.randomHex(32), BrowserCrypto.randomHex(32)]
    }

    return {
      protocol: proofData.protocol,
      curve: proofData.curve,
      proofHash: BrowserCrypto.createHash(JSON.stringify(proofData)),
      timestamp: Date.now()
    }
  }

  async validateNTPSources(): Promise<{
    totalSources: number
    validSources: number
    validationHash: string
  }> {
    const sources = ['pool.ntp.org', 'time.google.com', 'time.cloudflare.com', 'time.apple.com']
    let validSources = 0

    for (const source of sources) {
      await new Promise(resolve => setTimeout(resolve, 200))
      if (Math.random() > 0.2) validSources++ // 80% success rate
    }

    return {
      totalSources: sources.length,
      validSources,
      validationHash: BrowserCrypto.createHash(`ntp_${Date.now()}_${validSources}_${sources.length}`)
    }
  }
}

// Main Orchestrator Service
export class FutureProtocolService {
  private ipfsService: MockIPFSService
  private selfProtocolService: MockSelfProtocolService
  private blocklockService: MockBlocklockService
  private contractService: MockTimeCapsuleContract
  private zkTLSService: MockZKTLSService

  constructor(signer: ethers.Signer) {
    this.ipfsService = new MockIPFSService()
    this.selfProtocolService = new MockSelfProtocolService()
    this.blocklockService = new MockBlocklockService()
    this.contractService = new MockTimeCapsuleContract(signer)
    this.zkTLSService = new MockZKTLSService()
  }

  async executeCompleteWorkflow(
    data: TimeCapsuleData,
    onProgress: (phase: string, progress: number) => void
  ): Promise<WorkflowResult> {
    const startTime = Date.now()
    const phases: string[] = []

    try {
      // Phase 1: zkTLS Proof Generation
      onProgress('Generating zkTLS Proof', 10)
      phases.push('zkTLS Proof Generation')
      const zkProof = this.zkTLSService.generateProof()
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Phase 2: NTP Validation
      onProgress('Validating NTP Time Sources', 20)
      phases.push('NTP Time Validation')
      const ntpValidation = await this.zkTLSService.validateNTPSources()

      // Phase 3: Self Protocol Verification
      onProgress('Generating Self Protocol QR Code', 30)
      phases.push('Self Protocol Verification')
      const userAddress = await this.contractService['signer'].getAddress()
      const verificationData = await this.selfProtocolService.generateVerificationQR(userAddress)

      // Phase 4: Content Upload to IPFS
      onProgress('Uploading Content to IPFS', 50)
      phases.push('IPFS Content Upload')
      let ipfsCid: string
      if (data.fileType === 'file' && data.file) {
        ipfsCid = await this.ipfsService.uploadFile(data.file)
      } else {
        ipfsCid = await this.ipfsService.uploadContent(data.content, data.title)
      }

      // Phase 5: Blocklock Encryption
      onProgress('Setting up Blocklock Encryption', 60)
      phases.push('Blocklock Encryption')
      const blocksInFuture = Math.floor((data.unlockTime * 1000 - Date.now()) / 30000) // 30 sec per block
      const encryptionData = await this.blocklockService.encryptContent(
        data.content || `File: ${data.file?.name}`,
        blocksInFuture
      )

      // Phase 6: TimeCapsule Creation
      onProgress('Creating TimeCapsule on Blockchain', 80)
      phases.push('TimeCapsule Creation')
      const contractResult = await this.contractService.createTimeCapsule(data, ipfsCid, encryptionData)

      // Phase 7: Verification Wait
      onProgress('Waiting for Self Protocol Verification', 90)
      phases.push('Verification Completion')
      const verificationCompleted = await this.selfProtocolService.waitForVerification(verificationData.sessionId)

      // Phase 8: Complete
      onProgress('Workflow Complete', 100)
      phases.push('Workflow Complete')

      return {
        success: true,
        timeCapsuleId: contractResult.timeCapsuleId,
        transactionHash: contractResult.transactionHash,
        verificationId: verificationData.verificationId,
        ipfsCid,
        qrCodeUrl: verificationData.qrCodeUrl,
        phases,
        executionTime: Math.floor((Date.now() - startTime) / 1000)
      }

    } catch (error) {
      console.error('Workflow failed:', error)
      throw new Error(`Workflow failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  // Individual service getters for direct access
  get selfProtocol() { return this.selfProtocolService }
  get ipfs() { return this.ipfsService }
  get blocklock() { return this.blocklockService }
  get contract() { return this.contractService }
  get zkTLS() { return this.zkTLSService }
}