'use client'

import { useState } from 'react'
import { useAccount, useSigner } from 'wagmi'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import {
  Clock,
  Shield,
  Upload,
  FileText,
  Layers,
  Database,
  Lock,
  Unlock,
  CheckCircle,
  AlertTriangle,
  Wallet,
  Zap
} from 'lucide-react'
import toast from 'react-hot-toast'
import { TimeCapsuleCreator } from './TimeCapsuleCreator'
import { SelfProtocolVerification } from './SelfProtocolVerification'
import { BlocklockManager } from './BlocklockManager'
import { LighthouseUploader } from './LighthouseUploader'

type WorkflowStep = 'connect' | 'verify' | 'create' | 'manage' | 'upload'

export function FutureProtocolWorkflow() {
  const { address, isConnected } = useAccount()
  const { data: signer } = useSigner()
  const [currentStep, setCurrentStep] = useState<WorkflowStep>('connect')
  const [completedSteps, setCompletedSteps] = useState<Set<WorkflowStep>>(new Set())

  const handleStepComplete = (step: WorkflowStep) => {
    setCompletedSteps(prev => new Set([...prev, step]))
    toast.success(`✅ ${getStepTitle(step)} completed!`)

    // Auto-advance to next step
    if (step === 'connect' && isConnected) {
      setCurrentStep('verify')
    } else if (step === 'verify') {
      setCurrentStep('create')
    }
  }

  const getStepTitle = (step: WorkflowStep): string => {
    const titles = {
      connect: 'Wallet Connection',
      verify: 'Identity Verification',
      create: 'TimeCapsule Creation',
      manage: 'Blocklock Management',
      upload: 'IPFS Upload'
    }
    return titles[step]
  }

  const getStepIcon = (step: WorkflowStep) => {
    const icons = {
      connect: Wallet,
      verify: Shield,
      create: Clock,
      manage: Lock,
      upload: Upload
    }
    return icons[step]
  }

  const isStepCompleted = (step: WorkflowStep): boolean => {
    if (step === 'connect') return isConnected
    return completedSteps.has(step)
  }

  const isStepActive = (step: WorkflowStep): boolean => {
    return currentStep === step
  }

  const canAccessStep = (step: WorkflowStep): boolean => {
    if (step === 'connect') return true
    if (step === 'verify') return isConnected
    if (step === 'create') return isConnected && completedSteps.has('verify')
    if (step === 'manage') return isConnected
    if (step === 'upload') return isConnected
    return false
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <div className="flex items-center space-x-3">
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-lg">
                  <Zap className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Future Protocol</h1>
                  <p className="text-sm text-gray-600">Complete TimeCapsule Workflow</p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {isConnected && (
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>TFIL Network Connected</span>
                </div>
              )}
              <ConnectButton />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Workflow Steps Progress */}
        <div className="mb-8">
          <div className="bg-white rounded-lg border p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Workflow Progress</h2>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {(['connect', 'verify', 'create', 'manage', 'upload'] as WorkflowStep[]).map((step, index) => {
                const Icon = getStepIcon(step)
                const completed = isStepCompleted(step)
                const active = isStepActive(step)
                const accessible = canAccessStep(step)

                return (
                  <div key={step} className="relative">
                    <button
                      onClick={() => accessible ? setCurrentStep(step) : null}
                      disabled={!accessible}
                      className={`w-full p-4 rounded-lg border-2 transition-all duration-200 ${
                        completed
                          ? 'border-green-500 bg-green-50 text-green-700 hover:bg-green-100'
                          : active
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : accessible
                          ? 'border-gray-300 bg-white hover:bg-gray-50'
                          : 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      <div className="flex items-center justify-center mb-2">
                        {completed ? (
                          <CheckCircle className="h-8 w-8 text-green-600" />
                        ) : (
                          <Icon className={`h-8 w-8 ${active ? 'text-blue-600' : accessible ? 'text-gray-600' : 'text-gray-400'}`} />
                        )}
                      </div>
                      <h3 className="font-medium text-sm">{getStepTitle(step)}</h3>
                      <div className="mt-1">
                        {completed && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                            Complete
                          </span>
                        )}
                        {active && !completed && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                            Active
                          </span>
                        )}
                        {!accessible && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-600">
                            Locked
                          </span>
                        )}
                      </div>
                    </button>

                    {/* Progress connector */}
                    {index < 4 && (
                      <div className="hidden md:block absolute top-1/2 -right-2 w-4 h-0.5 bg-gray-300 transform -translate-y-1/2">
                        <div
                          className={`h-full transition-all duration-300 ${
                            completed ? 'bg-green-500' : 'bg-gray-300'
                          }`}
                          style={{ width: completed ? '100%' : '0%' }}
                        />
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar - Feature Overview */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg border p-6 sticky top-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Features</h3>

              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-gray-900">Self Protocol</h4>
                    <p className="text-sm text-gray-600">Zero-knowledge identity verification</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Lock className="h-5 w-5 text-purple-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-gray-900">Blocklock</h4>
                    <p className="text-sm text-gray-600">Time-based encryption & decryption</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Database className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-gray-900">IPFS Storage</h4>
                    <p className="text-sm text-gray-600">Decentralized content storage</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Layers className="h-5 w-5 text-orange-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-gray-900">zkTLS Proofs</h4>
                    <p className="text-sm text-gray-600">Cryptographic verification</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Clock className="h-5 w-5 text-red-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-gray-900">TimeCapsules</h4>
                    <p className="text-sm text-gray-600">Future message delivery</p>
                  </div>
                </div>
              </div>

              {/* Network Info */}
              <div className="mt-6 pt-4 border-t">
                <div className="text-sm text-gray-600 space-y-2">
                  <div className="flex justify-between">
                    <span>Network:</span>
                    <span className="font-medium">Filecoin Calibration</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Token:</span>
                    <span className="font-medium">TFIL</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Wallet:</span>
                    <span className="font-medium">MetaMask</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg border">
              <div className="p-6 border-b">
                <h2 className="text-xl font-semibold text-gray-900">
                  {getStepTitle(currentStep)}
                </h2>
                <p className="text-gray-600 mt-1">
                  {currentStep === 'connect' && 'Connect your MetaMask wallet to get started with Future Protocol'}
                  {currentStep === 'verify' && 'Verify your identity using Self Protocol for secure access'}
                  {currentStep === 'create' && 'Create encrypted TimeCapsules with Blocklock and IPFS storage'}
                  {currentStep === 'manage' && 'Manage Blocklock time-based encryption for your messages'}
                  {currentStep === 'upload' && 'Upload files to IPFS using Lighthouse for decentralized storage'}
                </p>
              </div>

              <div className="p-6">
                {/* Wallet Connection */}
                {currentStep === 'connect' && (
                  <div className="text-center py-12">
                    {!isConnected ? (
                      <div className="space-y-6">
                        <div className="flex justify-center">
                          <div className="bg-blue-100 p-4 rounded-full">
                            <Wallet className="h-12 w-12 text-blue-600" />
                          </div>
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">Connect Your Wallet</h3>
                          <p className="text-gray-600 mb-6">
                            Connect your MetaMask wallet to access the complete Future Protocol workflow
                          </p>
                          <ConnectButton />
                        </div>
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                          <div className="flex items-start">
                            <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5 mr-3" />
                            <div className="text-left">
                              <h4 className="font-medium text-yellow-800">Network Requirements</h4>
                              <ul className="mt-2 text-sm text-yellow-700 list-disc list-inside">
                                <li>Switch to Filecoin Calibration network</li>
                                <li>Ensure you have TFIL tokens for transactions</li>
                                <li>MetaMask browser extension required</li>
                              </ul>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        <div className="flex justify-center">
                          <div className="bg-green-100 p-4 rounded-full">
                            <CheckCircle className="h-12 w-12 text-green-600" />
                          </div>
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">Wallet Connected!</h3>
                          <p className="text-gray-600">
                            Successfully connected to {address?.slice(0, 6)}...{address?.slice(-4)}
                          </p>
                          <button
                            onClick={() => handleStepComplete('connect')}
                            className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                          >
                            Continue to Identity Verification
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Identity Verification */}
                {currentStep === 'verify' && address && (
                  <SelfProtocolVerification
                    userAddress={address}
                    onVerified={() => handleStepComplete('verify')}
                  />
                )}

                {/* TimeCapsule Creation */}
                {currentStep === 'create' && (
                  <TimeCapsuleCreator />
                )}

                {/* Blocklock Management */}
                {currentStep === 'manage' && (
                  <BlocklockManager />
                )}

                {/* IPFS Upload */}
                {currentStep === 'upload' && (
                  <LighthouseUploader />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}