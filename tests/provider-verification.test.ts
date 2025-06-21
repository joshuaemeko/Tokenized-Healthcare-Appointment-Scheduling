import { describe, it, expect, beforeEach } from "vitest"

describe("Provider Verification Contract", () => {
  let contractState
  
  beforeEach(() => {
    // Reset contract state for each test
    contractState = {
      providers: new Map(),
      providerByAddress: new Map(),
      nextProviderId: 1,
      contractOwner: "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM",
    }
  })
  
  describe("Provider Registration", () => {
    it("should register a new provider successfully", () => {
      const providerData = {
        name: "Dr. John Smith",
        specialty: "Cardiology",
        licenseNumber: "MD123456",
      }
      
      const result = registerProvider(contractState, providerData)
      
      expect(result.success).toBe(true)
      expect(result.providerId).toBe(1)
      expect(contractState.providers.size).toBe(1)
      expect(contractState.nextProviderId).toBe(2)
    })
    
    it("should store provider data correctly", () => {
      const providerData = {
        name: "Dr. Jane Doe",
        specialty: "Pediatrics",
        licenseNumber: "MD789012",
      }
      
      registerProvider(contractState, providerData)
      
      const storedProvider = contractState.providers.get(1)
      expect(storedProvider.name).toBe(providerData.name)
      expect(storedProvider.specialty).toBe(providerData.specialty)
      expect(storedProvider.licenseNumber).toBe(providerData.licenseNumber)
      expect(storedProvider.verified).toBe(false)
    })
  })
  
  describe("Provider Verification", () => {
    beforeEach(() => {
      // Register a provider for verification tests
      registerProvider(contractState, {
        name: "Dr. Test Provider",
        specialty: "General Medicine",
        licenseNumber: "MD999999",
      })
    })
    
    it("should verify provider successfully by contract owner", () => {
      const result = verifyProvider(contractState, 1, contractState.contractOwner)
      
      expect(result.success).toBe(true)
      expect(contractState.providers.get(1).verified).toBe(true)
    })
    
    it("should reject verification by non-owner", () => {
      const nonOwner = "ST2PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM"
      const result = verifyProvider(contractState, 1, nonOwner)
      
      expect(result.success).toBe(false)
      expect(result.error).toBe("ERR_UNAUTHORIZED")
    })
    
    it("should reject verification of non-existent provider", () => {
      const result = verifyProvider(contractState, 999, contractState.contractOwner)
      
      expect(result.success).toBe(false)
      expect(result.error).toBe("ERR_PROVIDER_NOT_FOUND")
    })
  })
  
  describe("Provider Queries", () => {
    beforeEach(() => {
      // Register and verify a provider
      registerProvider(contractState, {
        name: "Dr. Query Test",
        specialty: "Dermatology",
        licenseNumber: "MD555555",
      })
      verifyProvider(contractState, 1, contractState.contractOwner)
    })
    
    it("should retrieve provider by ID", () => {
      const provider = getProvider(contractState, 1)
      
      expect(provider).toBeDefined()
      expect(provider.name).toBe("Dr. Query Test")
      expect(provider.verified).toBe(true)
    })
    
    it("should return null for non-existent provider", () => {
      const provider = getProvider(contractState, 999)
      
      expect(provider).toBeNull()
    })
    
    it("should check provider verification status", () => {
      const isVerified = isProviderVerified(contractState, 1)
      const isNotVerified = isProviderVerified(contractState, 999)
      
      expect(isVerified).toBe(true)
      expect(isNotVerified).toBe(false)
    })
    
    it("should return correct total provider count", () => {
      // Register additional providers
      registerProvider(contractState, {
        name: "Dr. Second Provider",
        specialty: "Orthopedics",
        licenseNumber: "MD666666",
      })
      
      const totalProviders = getTotalProviders(contractState)
      
      expect(totalProviders).toBe(2)
    })
  })
})

// Helper functions to simulate contract behavior
function registerProvider(state, providerData) {
  const walletAddress = `ST${Math.random().toString(36).substr(2, 9).toUpperCase()}`
  
  // Check if provider already exists
  if (state.providerByAddress.has(walletAddress)) {
    return { success: false, error: "ERR_PROVIDER_EXISTS" }
  }
  
  const providerId = state.nextProviderId
  
  // Store provider data
  state.providers.set(providerId, {
    walletAddress,
    name: providerData.name,
    specialty: providerData.specialty,
    licenseNumber: providerData.licenseNumber,
    verified: false,
    registrationBlock: Math.floor(Math.random() * 1000000),
  })
  
  // Store address mapping
  state.providerByAddress.set(walletAddress, providerId)
  
  // Increment next provider ID
  state.nextProviderId += 1
  
  return { success: true, providerId }
}

function verifyProvider(state, providerId, caller) {
  // Check authorization
  if (caller !== state.contractOwner) {
    return { success: false, error: "ERR_UNAUTHORIZED" }
  }
  
  // Check if provider exists
  const provider = state.providers.get(providerId)
  if (!provider) {
    return { success: false, error: "ERR_PROVIDER_NOT_FOUND" }
  }
  
  // Update verification status
  provider.verified = true
  state.providers.set(providerId, provider)
  
  return { success: true }
}

function getProvider(state, providerId) {
  return state.providers.get(providerId) || null
}

function isProviderVerified(state, providerId) {
  const provider = state.providers.get(providerId)
  return provider ? provider.verified : false
}

function getTotalProviders(state) {
  return state.nextProviderId - 1
}
