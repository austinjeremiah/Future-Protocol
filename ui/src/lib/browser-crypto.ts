// Browser-safe crypto utilities using Web Crypto API and ethers.js

import { ethers } from 'ethers'

export class BrowserCrypto {
  static generateUUID(): string {
    if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
      const array = new Uint8Array(16)
      crypto.getRandomValues(array)

      // Set version (4) and variant bits
      array[6] = (array[6] & 0x0f) | 0x40
      array[8] = (array[8] & 0x3f) | 0x80

      const hex = Array.from(array)
        .map(b => b.toString(16).padStart(2, '0'))
        .join('')

      return [
        hex.slice(0, 8),
        hex.slice(8, 12),
        hex.slice(12, 16),
        hex.slice(16, 20),
        hex.slice(20, 32)
      ].join('-')
    }

    // Fallback
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0
      const v = c === 'x' ? r : (r & 0x3 | 0x8)
      return v.toString(16)
    })
  }

  static createHash(data: string): string {
    return ethers.keccak256(ethers.toUtf8Bytes(data))
  }

  static randomHex(length: number): string {
    return ethers.hexlify(ethers.randomBytes(length))
  }

  static randomBytes(length: number): Uint8Array {
    return ethers.randomBytes(length)
  }
}