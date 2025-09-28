import { SelfAppBuilder, getUniversalLink, countries } from '@selfxyz/qrcode'
import QRCode from 'qrcode'
import { ethers } from 'ethers'
import { randomUUID } from '@/lib/utils/crypto'

export interface SelfProtocolConfig {
  userAddress: string
  sessionId?: string
  webhookUrl?: string
}

export interface VerificationResult {
  verified: boolean
  userAddress: string
  verificationHash: string
  universalLink: string
  configId: string
  qrCodeDataUrl: string
  sessionId: string
}

export interface VerificationEventData {
  userIdentifier: string
  configId: string
  timestamp: number
  transactionHash: string
  blockNumber: number
  txHash: string
}

export class SelfProtocolService {
  private hubAddress = "0x16ECBA51e18a4a7e61fdC417f0d47AFEeDfbed74"
  private scope = "test-scope"
  private endpoint = "0xe355eb8ddc5ae5a1fb8265b5394c5b4e47604d2e"

  async generateVerificationQR(config: SelfProtocolConfig): Promise<VerificationResult> {
    const sessionId = config.sessionId || randomUUID()

    try {
      // Build Self Protocol verification app exactly like finalWorkingDemo.ts
      const selfApp = new SelfAppBuilder({
        version: 2,
        appName: "Future Protocol",
        scope: this.scope,
        endpoint: this.endpoint,
        logoBase64: "https://i.postimg.cc/mrmVf9hm/self.png",
        userId: ethers.ZeroAddress,
        endpointType: "staging_celo",
        userIdType: "hex",
        userDefinedData: "Hello welcome to Future Protocol!",
        disclosures: {
          name: true,
          minimumAge: 18,
          nationality: true,
          date_of_birth: true,
          excludedCountries: [countries.UNITED_STATES]
        }
      }).build()

      // Generate universal link for mobile verification
      const universalLink = getUniversalLink(selfApp)

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

      // Create verification configuration ID using Self Protocol format
      const configId = ethers.keccak256(
        ethers.toUtf8Bytes(`${this.scope}-${this.endpoint}-${sessionId}`)
      )

      const verificationHash = ethers.keccak256(
        ethers.toUtf8Bytes(`${config.userAddress}-${sessionId}-${Date.now()}-${configId}`)
      )

      return {
        verified: false, // Will be updated when verification completes
        userAddress: config.userAddress,
        verificationHash,
        universalLink,
        configId,
        qrCodeDataUrl,
        sessionId
      }
    } catch (error) {
      console.error('Failed to generate Self Protocol QR:', error)
      throw new Error('Failed to generate verification QR code')
    }
  }

  async checkVerificationStatus(sessionId: string): Promise<boolean> {
    try {
      // In a real implementation, this would check the Self Protocol API
      // For now, we'll simulate the verification check
      console.log(`Checking verification status for session: ${sessionId}`)

      // This would normally call the Self Protocol verification endpoints
      // as implemented in finalWorkingDemo.ts
      return false // Return false until real verification is implemented
    } catch (error) {
      console.error('Failed to check verification status:', error)
      return false
    }
  }

  async waitForVerification(
    sessionId: string,
    onSuccess: (data: VerificationEventData) => void,
    onError: (error: Error) => void,
    timeoutMs: number = 300000 // 5 minutes
  ): Promise<void> {
    let polling = true
    let pollCount = 0

    const timeout = setTimeout(() => {
      polling = false
      onError(new Error('Verification timeout - please try again'))
    }, timeoutMs)

    const pollInterval = setInterval(async () => {
      if (!polling) {
        clearInterval(pollInterval)
        return
      }

      try {
        pollCount++
        console.log(`[Poll ${pollCount}] Checking Self Protocol verification...`)

        const isVerified = await this.checkVerificationStatus(sessionId)

        if (isVerified) {
          polling = false
          clearTimeout(timeout)
          clearInterval(pollInterval)

          onSuccess({
            userIdentifier: 'verified_user',
            configId: sessionId,
            timestamp: Date.now(),
            transactionHash: 'self_protocol_verified',
            blockNumber: 0,
            txHash: 'self_protocol_verified'
          })
        } else {
          console.log(`Still waiting for mobile verification... (Poll ${pollCount})`)
        }
      } catch (error) {
        console.log(`Poll ${pollCount}: Verification check error -`, error)
      }
    }, 15000) // Poll every 15 seconds
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