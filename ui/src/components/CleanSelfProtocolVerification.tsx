'use client'

import { useState } from 'react'
import { Shield, QrCode, CheckCircle, AlertCircle, Smartphone, Copy, ExternalLink } from 'lucide-react'
import toast from 'react-hot-toast'
import { MockSelfProtocolService } from '@/lib/mock-services'

interface Props {
  onVerified: (verificationId: string) => void
  userAddress: string
}

export function CleanSelfProtocolVerification({ onVerified, userAddress }: Props) {
  const [verificationData, setVerificationData] = useState<{
    qrCodeUrl: string
    verificationId: string
    universalLink: string
    sessionId: string
  } | null>(null)

  const [isVerified, setIsVerified] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [verificationStatus, setVerificationStatus] = useState<'idle' | 'waiting' | 'success' | 'failed'>('idle')

  const selfProtocolService = new MockSelfProtocolService()

  const generateQRCode = async () => {
    if (!userAddress) {
      toast.error('Wallet not connected')
      return
    }

    setIsGenerating(true)
    try {
      toast.loading('Generating Self Protocol QR code...', { duration: 1500 })

      const result = await selfProtocolService.generateVerificationQR(userAddress)
      setVerificationData(result)
      setVerificationStatus('waiting')

      toast.success('QR Code generated! Scan with Self Protocol mobile app (Demo mode)')

      // Start auto-verification countdown
      const verificationPromise = selfProtocolService.waitForVerification(result.sessionId, 30000)

      verificationPromise.then(() => {
        setIsVerified(true)
        setVerificationStatus('success')
        onVerified(result.verificationId)
        toast.success('Identity verified successfully! (Demo mode)')
      })

    } catch (error) {
      console.error('QR generation failed:', error)
      toast.error('Failed to generate QR code')
      setVerificationStatus('failed')
    } finally {
      setIsGenerating(false)
    }
  }

  const manualVerificationComplete = () => {
    if (verificationData) {
      setIsVerified(true)
      setVerificationStatus('success')
      onVerified(verificationData.verificationId)
      toast.success('Verification marked as complete!')
    }
  }

  const copyUniversalLink = () => {
    if (verificationData) {
      navigator.clipboard.writeText(verificationData.universalLink)
      toast.success('Universal link copied to clipboard!')
    }
  }

  return (
    <div className="space-y-6">
      {!isVerified ? (
        <>
          {/* Requirements */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start">
              <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 mr-3" />
              <div>
                <h3 className="text-sm font-medium text-yellow-800">Verification Requirements</h3>
                <ul className="mt-2 text-sm text-yellow-700 list-disc list-inside space-y-1">
                  {selfProtocolService.getRequirements().map((req, index) => (
                    <li key={index}>{req}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Generate QR Code */}
          {!verificationData ? (
            <div className="text-center">
              <button
                onClick={generateQRCode}
                disabled={isGenerating}
                className="inline-flex items-center space-x-2 bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700 disabled:opacity-50"
              >
                <QrCode className="h-5 w-5" />
                <span>{isGenerating ? 'Generating QR Code...' : 'Generate Verification QR Code'}</span>
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* QR Code Display */}
              <div className="text-center">
                <div className="inline-block p-4 bg-white rounded-lg shadow-lg border">
                  <img src={verificationData.qrCodeUrl} alt="Self Protocol QR Code" className="w-64 h-64 mx-auto" />
                </div>
                <div className="mt-2 space-y-1">
                  <p className="text-sm text-gray-500">Session: {verificationData.sessionId.slice(0, 8)}...</p>
                  <p className="text-xs text-blue-600">Scan with Self Protocol mobile app</p>
                </div>
              </div>

              {/* Instructions */}
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-start">
                  <Smartphone className="h-5 w-5 text-blue-600 mt-0.5 mr-3" />
                  <div>
                    <h3 className="text-sm font-medium text-blue-800">How to Verify (Demo Mode)</h3>
                    <ol className="mt-2 text-sm text-blue-700 list-decimal list-inside space-y-1">
                      {selfProtocolService.getInstructions().map((instruction, index) => (
                        <li key={index}>{instruction}</li>
                      ))}
                    </ol>
                  </div>
                </div>
              </div>

              {/* Universal Link */}
              <div className="bg-gray-50 rounded-lg p-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Universal Link (Alternative)
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={verificationData.universalLink}
                    readOnly
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md bg-white text-sm"
                  />
                  <button
                    onClick={copyUniversalLink}
                    className="flex items-center px-3 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 text-sm"
                  >
                    <Copy className="h-4 w-4 mr-1" />
                    Copy
                  </button>
                  <a
                    href={verificationData.universalLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                  >
                    <ExternalLink className="h-4 w-4 mr-1" />
                    Open
                  </a>
                </div>
              </div>

              {/* Verification Details */}
              <div className="bg-purple-50 rounded-lg p-4">
                <h3 className="text-sm font-medium text-purple-800 mb-2">Verification Details</h3>
                <div className="text-sm text-purple-700 space-y-1">
                  <p><strong>Session ID:</strong> {verificationData.sessionId}</p>
                  <p><strong>Verification ID:</strong> {verificationData.verificationId.slice(0, 20)}...</p>
                  <p><strong>User Address:</strong> {userAddress}</p>
                  <p><strong>Requirements:</strong> Age 18+, Non-US, Valid ID</p>
                </div>
              </div>

              {/* Status Display */}
              {verificationStatus === 'waiting' && (
                <div className="text-center">
                  <div className="inline-flex items-center space-x-2 bg-blue-100 text-blue-800 px-4 py-2 rounded-lg mb-4">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    <span>Waiting for mobile verification... (Auto-completes in 30 seconds)</span>
                  </div>

                  {/* Manual completion button */}
                  <div>
                    <button
                      onClick={manualVerificationComplete}
                      className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700"
                    >
                      ✅ Mark as Verified (Demo)
                    </button>
                    <p className="text-xs text-gray-500 mt-2">
                      Click if you've completed verification in the mobile app
                    </p>
                  </div>
                </div>
              )}

              {verificationStatus === 'failed' && (
                <div className="text-center">
                  <div className="inline-flex items-center space-x-2 bg-red-100 text-red-800 px-4 py-2 rounded-lg">
                    <AlertCircle className="h-4 w-4" />
                    <span>Verification failed. Please try again.</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      ) : (
        /* Verification Success */
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Identity Verified!</h3>
            <p className="text-gray-600">Your Self Protocol identity verification is complete</p>
          </div>
          <div className="bg-green-50 rounded-lg p-4">
            <div className="text-sm text-green-800 space-y-1">
              <p><strong>Verified Address:</strong> {userAddress}</p>
              <p><strong>Verification Time:</strong> {new Date().toLocaleString()}</p>
              <p><strong>Status:</strong> Age 18+, Non-US Resident Confirmed</p>
              <p><strong>Method:</strong> Self Protocol (Demo Mode)</p>
            </div>
          </div>
        </div>
      )}

      {/* Information */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="font-semibold text-gray-900 mb-2">About Self Protocol Verification</h3>
        <div className="text-sm text-gray-600 space-y-2">
          <p>Self Protocol provides decentralized identity verification using zero-knowledge proofs.</p>
          <p>Your personal information is never shared - only proof of meeting requirements (age, nationality) is stored on-chain.</p>
          <p>This verification enables access to age-restricted features while maintaining privacy.</p>
          <p className="text-blue-600 font-medium">Demo Mode: This interface simulates the full Self Protocol workflow for development purposes.</p>
        </div>
      </div>
    </div>
  )
}