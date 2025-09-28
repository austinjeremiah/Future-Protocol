import QRCode from 'qrcode'
import { ethers } from 'ethers'
import { randomUUID } from '@/lib/utils/crypto'

export interface SimplifiedVerificationResult {
  verified: boolean
  userAddress: string
  verificationHash: string
  universalLink: string
  configId: string
  qrCodeDataUrl: string
  sessionId: string
}

export class SimplifiedSelfProtocol {
  async generateMockVerificationQR(userAddress: string): Promise<SimplifiedVerificationResult> {
    try {
      const sessionId = randomUUID()

      // Create a simplified universal link for demonstration
      const universalLink = `https://self.xyz/verify?session=${sessionId}&user=${userAddress}&demo=true`

      // Generate QR code from universal link
      const qrCodeDataUrl = await QRCode.toDataURL(universalLink, {
        errorCorrectionLevel: 'M',
        margin: 1,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        },
        width: 256,
        scale: 1
      })

      // Create configuration ID
      const configId = ethers.keccak256(
        ethers.toUtf8Bytes(`test-scope-${sessionId}`)
      )

      const verificationHash = ethers.keccak256(
        ethers.toUtf8Bytes(`${userAddress}-${sessionId}-${Date.now()}`)
      )

      return {
        verified: false,
        userAddress,
        verificationHash,
        universalLink,
        configId,
        qrCodeDataUrl,
        sessionId
      }
    } catch (error) {
      console.error('Failed to generate mock verification QR:', error)
      throw new Error('Failed to generate verification QR code')
    }
  }

  getRequirements(): string[] {
    return [
      'Must be 18 years or older',
      'Non-US residents only',
      'Valid government-issued ID required',
      'Self Protocol mobile app installed'
    ]
  }

  getInstructions(): string[] {
    return [
      'Open the Self Protocol mobile app',
      'Tap the QR scanner feature',
      'Point your camera at the QR code above',
      'Complete identity verification (Age 18+, Non-US)',
      'Return here - the system will detect completion'
    ]
  }
}