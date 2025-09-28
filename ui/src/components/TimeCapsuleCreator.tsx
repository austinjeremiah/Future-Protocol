'use client'

import { useState } from 'react'
import { useAccount, useSigner } from 'wagmi'
import { ethers } from 'ethers'
import { Upload, Clock, User, FileText, Lock, Shield, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import { TimeCapsuleService, CompleteWorkflowResults } from '@/lib/services/TimeCapsuleService'

interface TimeCapsuleForm {
  title: string
  content: string
  recipientEmail: string
  recipientAddress: string
  unlockDate: string
  unlockTime: string
  fileType: 'text' | 'file'
  file: File | null
}

export function TimeCapsuleCreator() {
  const { address } = useAccount()
  const { data: signer } = useSigner()
  const [form, setForm] = useState<TimeCapsuleForm>({
    title: '',
    content: '',
    recipientEmail: '',
    recipientAddress: '',
    unlockDate: '',
    unlockTime: '12:00',
    fileType: 'text',
    file: null
  })
  const [isCreating, setIsCreating] = useState(false)
  const [currentPhase, setCurrentPhase] = useState('')
  const [progress, setProgress] = useState(0)
  const [workflowResult, setWorkflowResult] = useState<CompleteWorkflowResults | null>(null)
  const [showResult, setShowResult] = useState(false)

  const handleInputChange = (field: keyof TimeCapsuleForm, value: string | File | null) => {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setForm(prev => ({ ...prev, file, fileType: 'file' }))
    }
  }

  const validateForm = (): string | null => {
    if (!form.title.trim()) return 'Title is required'
    if (form.fileType === 'text' && !form.content.trim()) return 'Content is required'
    if (form.fileType === 'file' && !form.file) return 'File is required'
    if (!form.unlockDate) return 'Unlock date is required'
    if (form.recipientAddress && !ethers.isAddress(form.recipientAddress)) {
      return 'Invalid recipient address'
    }
    
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

    if (!signer) {
      toast.error('Please connect your wallet first')
      return
    }

    setIsCreating(true)
    setProgress(0)
    setCurrentPhase('Initializing...')

    try {
      // Initialize TimeCapsule service with Lighthouse API key
      const lighthouseApiKey = process.env.NEXT_PUBLIC_LIGHTHOUSE_API_KEY || 'demo-api-key'
      const timeCapsuleService = new TimeCapsuleService(signer, lighthouseApiKey)

      const unlockTimestamp = Math.floor(new Date(`${form.unlockDate}T${form.unlockTime}`).getTime() / 1000)

      // Prepare TimeCapsule data
      const timeCapsuleData = {
        title: form.title,
        content: form.content,
        recipientEmail: form.recipientEmail,
        recipientAddress: form.recipientAddress,
        unlockTime: unlockTimestamp,
        fileType: form.fileType,
        file: form.file || undefined
      }

      toast.success('Starting complete TimeCapsule workflow...')

      // Execute the complete workflow from finalWorkingDemo.ts
      const result = await timeCapsuleService.createCompleteTimeCapsule(
        timeCapsuleData,
        (phase: string, progressValue: number) => {
          setCurrentPhase(phase)
          setProgress(progressValue)

          // Show progress toasts for major milestones
          if (progressValue === 30) {
            toast.success('✅ Self Protocol verification initiated')
          } else if (progressValue === 50) {
            toast.success('✅ Content uploaded to IPFS')
          } else if (progressValue === 70) {
            toast.success('✅ TimeCapsule deployed to blockchain')
          }
        }
      )

      setWorkflowResult(result)
      setShowResult(true)

      toast.success('🎉 Complete TimeCapsule workflow executed successfully!')

      // Reset form after successful creation
      setTimeout(() => {
        setForm({
          title: '',
          content: '',
          recipientEmail: '',
          recipientAddress: '',
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

  if (showResult && workflowResult) {
    return (
      <div className="space-y-6">
        {/* Workflow Result Display */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <div className="flex items-center mb-4">
            <CheckCircle className="h-8 w-8 text-green-600 mr-3" />
            <div>
              <h2 className="text-xl font-bold text-green-900">TimeCapsule Created Successfully!</h2>
              <p className="text-green-700">Complete workflow executed in {workflowResult.execution.totalDurationSeconds}s</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* TimeCapsule Info */}
            <div className="bg-white rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-2">TimeCapsule Details</h3>
              <div className="text-sm space-y-1">
                <p><strong>ID:</strong> {workflowResult.timeCapsule.id}</p>
                <p><strong>Title:</strong> {workflowResult.timeCapsule.title}</p>
                <p><strong>Unlock Time:</strong> {new Date(workflowResult.timeCapsule.unlockTime).toLocaleString()}</p>
                <p><strong>Status:</strong> {workflowResult.timeCapsule.isUnlocked ? 'Unlocked' : 'Locked'}</p>
              </div>
            </div>

            {/* Self Protocol */}
            <div className="bg-white rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-2">Identity Verification</h3>
              <div className="text-sm space-y-1">
                <p><strong>Status:</strong> {workflowResult.selfProtocol.verificationCompleted ? '✅ Verified' : '⏳ Pending'}</p>
                <p><strong>User:</strong> {workflowResult.selfProtocol.userAddress.slice(0, 10)}...</p>
                <p><strong>Config ID:</strong> {workflowResult.selfProtocol.configId.slice(0, 16)}...</p>
              </div>
            </div>

            {/* Storage */}
            <div className="bg-white rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-2">IPFS Storage</h3>
              <div className="text-sm space-y-1">
                <p><strong>Provider:</strong> {workflowResult.storage.provider}</p>
                <p><strong>CID:</strong> {workflowResult.storage.ipfsCid.slice(0, 20)}...</p>
                <p><strong>Size:</strong> {workflowResult.storage.contentLength} bytes</p>
              </div>
            </div>
          </div>

          {/* Blockchain Transaction */}
          <div className="mt-4 bg-blue-50 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-2">Blockchain Transaction</h3>
            <div className="text-sm text-blue-800 space-y-1">
              <p><strong>Network:</strong> {workflowResult.blockchain.network}</p>
              <p><strong>Transaction:</strong> {workflowResult.timeCapsule.transactionHash}</p>
              <p><strong>Block:</strong> {workflowResult.timeCapsule.blockNumber}</p>
              <p><strong>Gas Used:</strong> {workflowResult.timeCapsule.gasUsed}</p>
            </div>
          </div>

          {/* Self Protocol QR Code (if available) */}
          {workflowResult.selfProtocol.qrCodeDataUrl && (
            <div className="mt-4 text-center">
              <h3 className="font-semibold text-gray-900 mb-2">Self Protocol Verification QR</h3>
              <img
                src={workflowResult.selfProtocol.qrCodeDataUrl}
                alt="Self Protocol QR Code"
                className="mx-auto w-32 h-32 border rounded"
              />
              <p className="text-xs text-gray-500 mt-1">QR Code for mobile verification</p>
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
            <ul className="space-y-1">
              <li className={progress >= 10 ? 'text-green-700 font-medium' : ''}>• zkTLS Proof Generation</li>
              <li className={progress >= 20 ? 'text-green-700 font-medium' : ''}>• NTP Time Validation</li>
              <li className={progress >= 30 ? 'text-green-700 font-medium' : ''}>• Self Protocol Verification</li>
              <li className={progress >= 50 ? 'text-green-700 font-medium' : ''}>• IPFS Content Upload</li>
              <li className={progress >= 60 ? 'text-green-700 font-medium' : ''}>• Blocklock Encryption</li>
              <li className={progress >= 70 ? 'text-green-700 font-medium' : ''}>• Blockchain Deployment</li>
              <li className={progress >= 100 ? 'text-green-700 font-medium' : ''}>• Workflow Completion</li>
            </ul>
          </div>
        </div>
      )}

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
              {form.file && (
                <p className="text-sm text-primary-600 mt-2">{form.file.name}</p>
              )}
            </label>
          </div>
        </div>
      )}

      {/* Recipient */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <User className="inline h-4 w-4 mr-1" />
            Recipient Email (Optional)
          </label>
          <input
            type="email"
            value={form.recipientEmail}
            onChange={(e) => handleInputChange('recipientEmail', e.target.value)}
            placeholder="recipient@example.com"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Recipient Wallet Address (Optional)
          </label>
          <input
            type="text"
            value={form.recipientAddress}
            onChange={(e) => handleInputChange('recipientAddress', e.target.value)}
            placeholder="0x..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
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
      
      <div className="bg-blue-50 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-2">How it works:</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Content is encrypted with Blocklock time-based encryption</li>
          <li>• Files are stored securely on IPFS via Lighthouse</li>
          <li>• Self Protocol verification ensures identity authenticity</li>
          <li>• Automatic unlock when the specified time is reached</li>
        </ul>
      </div>
    </div>
  )
}