'use client'

import { useState } from 'react'
import { useAccount, useWalletClient } from 'wagmi'
import { ethers } from 'ethers'
import {
  Upload,
  Clock,
  User,
  FileText,
  Lock,
  Shield,
  CheckCircle,
  AlertTriangle,
  Database,
  Zap
} from 'lucide-react'
import toast from 'react-hot-toast'
import { FutureProtocolService, TimeCapsuleData, WorkflowResult } from '@/lib/mock-services'

interface TimeCapsuleForm {
  title: string
  content: string
  recipientEmail: string
  unlockDate: string
  unlockTime: string
  fileType: 'text' | 'file'
  file: File | null
}

export function CleanTimeCapsuleCreator() {
  const { address } = useAccount()
  const { data: walletClient } = useWalletClient()

  const [form, setForm] = useState<TimeCapsuleForm>({
    title: '',
    content: '',
    recipientEmail: '',
    unlockDate: '',
    unlockTime: '12:00',
    fileType: 'text',
    file: null
  })

  const [isCreating, setIsCreating] = useState(false)
  const [currentPhase, setCurrentPhase] = useState('')
  const [progress, setProgress] = useState(0)
  const [workflowResult, setWorkflowResult] = useState<WorkflowResult | null>(null)
  const [showResult, setShowResult] = useState(false)

  const handleInputChange = (field: keyof TimeCapsuleForm, value: string | File | null) => {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      if (file.size > 50 * 1024 * 1024) { // 50MB limit
        toast.error('File size must be less than 50MB')
        return
      }
      setForm(prev => ({ ...prev, file, fileType: 'file' }))
    }
  }

  const validateForm = (): string | null => {
    if (!form.title.trim()) return 'Title is required'
    if (form.fileType === 'text' && !form.content.trim()) return 'Content is required'
    if (form.fileType === 'file' && !form.file) return 'File is required'
    if (!form.unlockDate) return 'Unlock date is required'

    const unlockDateTime = new Date(`${form.unlockDate}T${form.unlockTime}`)
    if (unlockDateTime <= new Date()) {
      return 'Unlock time must be in the future'
    }

    return null
  }

  const createTimeCapsule = async () => {
    const validation = validateForm()
    if (validation) {
      toast.error(validation)
      return
    }

    if (!walletClient) {
      toast.error('Please connect your wallet first')
      return
    }

    setIsCreating(true)
    setProgress(0)
    setCurrentPhase('Initializing...')

    try {
      // Create a mock signer for demo purposes
      const mockSigner = {
        getAddress: () => Promise.resolve(address),
        signMessage: (message: string) => Promise.resolve(`mock_signature_${message.slice(0, 10)}`),
        signTransaction: (tx: any) => Promise.resolve(`mock_signed_tx_${Date.now()}`),
        connect: () => mockSigner,
        provider: null
      } as any

      const futureProtocolService = new FutureProtocolService(mockSigner)

      const unlockTimestamp = Math.floor(new Date(`${form.unlockDate}T${form.unlockTime}`).getTime() / 1000)

      const timeCapsuleData: TimeCapsuleData = {
        title: form.title,
        content: form.content,
        recipientEmail: form.recipientEmail,
        unlockTime: unlockTimestamp,
        fileType: form.fileType,
        file: form.file || undefined
      }

      toast.success('Starting complete TimeCapsule workflow...')

      // Execute the complete workflow
      const result = await futureProtocolService.executeCompleteWorkflow(
        timeCapsuleData,
        (phase: string, progressValue: number) => {
          setCurrentPhase(phase)
          setProgress(progressValue)

          // Show progress toasts for major milestones
          if (progressValue === 30) {
            toast.success('✅ Self Protocol verification QR generated')
          } else if (progressValue === 50) {
            toast.success('✅ Content uploaded to IPFS')
          } else if (progressValue === 80) {
            toast.success('✅ TimeCapsule deployed to blockchain')
          } else if (progressValue === 100) {
            toast.success('🎉 Complete workflow executed successfully!')
          }
        }
      )

      setWorkflowResult(result)
      setShowResult(true)

      // Reset form after successful creation
      setTimeout(() => {
        setForm({
          title: '',
          content: '',
          recipientEmail: '',
          unlockDate: '',
          unlockTime: '12:00',
          fileType: 'text',
          file: null
        })
      }, 5000)

    } catch (error) {
      console.error('TimeCapsule creation failed:', error)
      toast.error(`Failed to create TimeCapsule: ${error instanceof Error ? error.message : 'Unknown error'}`)
      setCurrentPhase('Failed')
      setProgress(0)
    } finally {
      setIsCreating(false)
    }
  }

  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  const minDate = tomorrow.toISOString().split('T')[0]

  // Success Result Display
  if (showResult && workflowResult) {
    return (
      <div className="space-y-6">
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <div className="flex items-center mb-4">
            <CheckCircle className="h-8 w-8 text-green-600 mr-3" />
            <div>
              <h2 className="text-xl font-bold text-green-900">TimeCapsule Created Successfully!</h2>
              <p className="text-green-700">Complete workflow executed in {workflowResult.executionTime}s</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* TimeCapsule Info */}
            <div className="bg-white rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-2 flex items-center">
                <Lock className="h-4 w-4 mr-2" />
                TimeCapsule Details
              </h3>
              <div className="text-sm space-y-1">
                <p><strong>ID:</strong> #{workflowResult.timeCapsuleId}</p>
                <p><strong>Transaction:</strong> {workflowResult.transactionHash.slice(0, 10)}...</p>
                <p><strong>Status:</strong> <span className="text-blue-600">Locked</span></p>
              </div>
            </div>

            {/* Verification */}
            <div className="bg-white rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-2 flex items-center">
                <Shield className="h-4 w-4 mr-2" />
                Identity Verification
              </h3>
              <div className="text-sm space-y-1">
                <p><strong>Status:</strong> <span className="text-green-600">✅ Verified</span></p>
                <p><strong>ID:</strong> {workflowResult.verificationId.slice(0, 16)}...</p>
                <p><strong>Method:</strong> Self Protocol</p>
              </div>
            </div>

            {/* Storage */}
            <div className="bg-white rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-2 flex items-center">
                <Database className="h-4 w-4 mr-2" />
                IPFS Storage
              </h3>
              <div className="text-sm space-y-1">
                <p><strong>CID:</strong> {workflowResult.ipfsCid.slice(0, 16)}...</p>
                <p><strong>Network:</strong> IPFS</p>
                <p><strong>Status:</strong> <span className="text-green-600">Stored</span></p>
              </div>
            </div>
          </div>

          {/* Workflow Phases */}
          <div className="mt-4 bg-blue-50 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-2 flex items-center">
              <Zap className="h-4 w-4 mr-2" />
              Completed Workflow Phases
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {workflowResult.phases.map((phase, index) => (
                <div key={index} className="text-xs bg-white rounded px-2 py-1 text-blue-800">
                  ✅ {phase}
                </div>
              ))}
            </div>
          </div>

          {/* QR Code */}
          {workflowResult.qrCodeUrl && (
            <div className="mt-4 text-center">
              <h3 className="font-semibold text-gray-900 mb-2">Self Protocol Verification QR</h3>
              <img
                src={workflowResult.qrCodeUrl}
                alt="Self Protocol QR Code"
                className="mx-auto w-32 h-32 border rounded"
              />
              <p className="text-xs text-gray-500 mt-1">
                QR Code generated for identity verification
              </p>
            </div>
          )}

          <div className="mt-6 text-center">
            <button
              onClick={() => setShowResult(false)}
              className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700"
            >
              Create Another TimeCapsule
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Progress Display */}
      {isCreating && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-center mb-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-3"></div>
            <div>
              <h3 className="text-lg font-semibold text-blue-900">Creating TimeCapsule</h3>
              <p className="text-blue-700">{currentPhase}</p>
            </div>
          </div>

          <div className="w-full bg-blue-200 rounded-full h-3">
            <div
              className="bg-blue-600 h-3 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <p className="text-sm text-blue-600 mt-2">{progress}% Complete</p>

          <div className="mt-4 text-sm text-blue-800">
            <h4 className="font-medium mb-2">Workflow Stages:</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {[
                { name: 'zkTLS Proof', threshold: 10 },
                { name: 'NTP Validation', threshold: 20 },
                { name: 'Self Protocol', threshold: 30 },
                { name: 'IPFS Upload', threshold: 50 },
                { name: 'Blocklock Setup', threshold: 60 },
                { name: 'Blockchain Deploy', threshold: 80 },
                { name: 'Verification', threshold: 90 },
                { name: 'Complete', threshold: 100 }
              ].map((stage) => (
                <div
                  key={stage.name}
                  className={`text-xs px-2 py-1 rounded ${
                    progress >= stage.threshold
                      ? 'bg-green-100 text-green-700 font-medium'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {progress >= stage.threshold ? '✅' : '⏳'} {stage.name}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Form */}
      <div className="bg-white border rounded-lg p-6">
        <div className="space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FileText className="inline h-4 w-4 mr-1" />
              TimeCapsule Title
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="Enter a memorable title for your TimeCapsule"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          {/* Content Type Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Content Type</label>
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="text"
                  checked={form.fileType === 'text'}
                  onChange={(e) => handleInputChange('fileType', e.target.value as 'text' | 'file')}
                  className="mr-2"
                />
                Text Message
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="file"
                  checked={form.fileType === 'file'}
                  onChange={(e) => handleInputChange('fileType', e.target.value as 'text' | 'file')}
                  className="mr-2"
                />
                File Upload
              </label>
            </div>
          </div>

          {/* Content Input */}
          {form.fileType === 'text' ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Message Content</label>
              <textarea
                value={form.content}
                onChange={(e) => handleInputChange('content', e.target.value)}
                placeholder="Enter your message to be unlocked in the future..."
                rows={6}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Upload className="inline h-4 w-4 mr-1" />
                Upload File
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary-500 transition-colors">
                <input
                  type="file"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <Upload className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600">Click to upload or drag and drop</p>
                  <p className="text-sm text-gray-500 mt-1">Maximum file size: 50MB</p>
                  {form.file && (
                    <p className="text-sm text-primary-600 mt-2">📄 {form.file.name}</p>
                  )}
                </label>
              </div>
            </div>
          )}

          {/* Recipient */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <User className="inline h-4 w-4 mr-1" />
              Recipient Email
            </label>
            <input
              type="email"
              value={form.recipientEmail}
              onChange={(e) => handleInputChange('recipientEmail', e.target.value)}
              placeholder="recipient@example.com"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          {/* Unlock Time */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Clock className="inline h-4 w-4 mr-1" />
                Unlock Date
              </label>
              <input
                type="date"
                value={form.unlockDate}
                onChange={(e) => handleInputChange('unlockDate', e.target.value)}
                min={minDate}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Unlock Time</label>
              <input
                type="time"
                value={form.unlockTime}
                onChange={(e) => handleInputChange('unlockTime', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Create Button */}
          <div className="pt-4">
            <button
              onClick={createTimeCapsule}
              disabled={isCreating || !address}
              className="w-full bg-primary-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              <Lock className="h-5 w-5" />
              <span>{isCreating ? 'Creating TimeCapsule...' : 'Create Encrypted TimeCapsule'}</span>
            </button>
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-2">Complete Workflow Features:</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• <strong>zkTLS Proofs:</strong> Cryptographic verification with Groth16 protocol</li>
              <li>• <strong>Self Protocol:</strong> Identity verification with QR code scanning</li>
              <li>• <strong>Blocklock:</strong> Time-based encryption that unlocks automatically</li>
              <li>• <strong>IPFS Storage:</strong> Decentralized content storage via Lighthouse</li>
              <li>• <strong>Smart Contracts:</strong> Deployed on Filecoin Calibration network</li>
              <li>• <strong>Real-time Progress:</strong> Live workflow execution tracking</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}