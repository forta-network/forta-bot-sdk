import { BigNumber } from "ethers"
import providePushToRegistry, { PushToRegistry } from "./push.to.registry"

describe("pushToRegistry", () => {
  let pushToRegistry: PushToRegistry
  const mockAppendToFile = jest.fn()
  const mockAgentRegistry = {
    getAgent: jest.fn(),
    createAgent: jest.fn(),
    updateAgent: jest.fn()
  }
  const mockAgentId = "0xagentId"
  const mockManifestRef = "abc123"
  const mockFromAddress = "0x123"
  const mockChainIds = [1]
  const mockEthersProvider = {
    
  }
  const mockFromWallet = {
    getAddress: jest.fn(),
    getBalance: jest.fn(),
    connect: jest.fn().mockReturnThis(),
    address: mockFromAddress
  }

  const resetMocks = () => {
    mockAppendToFile.mockReset()
    mockAgentRegistry.getAgent.mockReset()
    mockAgentRegistry.createAgent.mockReset()
    mockAgentRegistry.updateAgent.mockReset()
  }

  beforeAll(() => {
    pushToRegistry = providePushToRegistry(mockAppendToFile, mockAgentRegistry as any, mockAgentId, mockChainIds, mockEthersProvider as any)
  })

  beforeEach(() => resetMocks())

  it("throws error if insufficient funds to deploy", async () => {
    mockAgentRegistry.getAgent.mockReturnValueOnce({created: false})
    mockFromWallet.getAddress.mockReturnValue('0x123')
    mockFromWallet.getBalance.mockReturnValueOnce(BigNumber.from(0))

    try {
      await pushToRegistry(mockManifestRef, mockFromWallet as any)
    } catch (e) {
      expect(e.message).toBe(`${mockFromWallet.address} has insufficient MATIC balance to deploy agent`)
      expect(mockFromWallet.connect).toHaveBeenCalledTimes(1)
      expect(mockFromWallet.connect).toHaveBeenCalledWith(mockEthersProvider)
    }
  })

  it("throws error if updating agent from address which is not owner", async () => {
    const mockOwner = "0xabc"
    mockAgentRegistry.getAgent.mockReturnValueOnce({created: true, owner: mockOwner})
    mockFromWallet.getBalance.mockReturnValueOnce(BigNumber.from(1))

    try {
      await pushToRegistry(mockManifestRef, mockFromWallet as any)
    } catch (e) {
      expect(e.message).toBe(`agent can only be updated by owner (${mockOwner})`)
    }
  })

  it("adds agent to registry if it does not already exist", async () => {
    const systemTime = new Date()
    jest.useFakeTimers('modern').setSystemTime(systemTime)
    mockAgentRegistry.getAgent.mockReturnValueOnce({created: false})
    mockFromWallet.getAddress.mockReturnValue('0x123')
    mockFromWallet.getBalance.mockReturnValueOnce(BigNumber.from(1))

    await pushToRegistry(mockManifestRef, mockFromWallet as any)

    expect(mockAgentRegistry.getAgent).toHaveBeenCalledTimes(1)
    expect(mockAgentRegistry.getAgent).toHaveBeenCalledWith(mockAgentId)
    expect(mockAgentRegistry.getAgent).toHaveBeenCalledBefore(mockAgentRegistry.createAgent)
    expect(mockAgentRegistry.createAgent).toHaveBeenCalledTimes(1)
    const [fromWallet, agentId, manifestReference, chainIds] = mockAgentRegistry.createAgent.mock.calls[0]
    expect(fromWallet).toEqual(mockFromWallet)
    expect(agentId).toEqual(mockAgentId)
    expect(manifestReference).toEqual(mockManifestRef)
    expect(chainIds).toEqual(mockChainIds)
    expect(mockAgentRegistry.updateAgent).toHaveBeenCalledTimes(0)
    expect(mockAppendToFile).toHaveBeenCalledTimes(1)
    expect(mockAppendToFile).toHaveBeenCalledWith(`${systemTime.toUTCString()}: successfully added agent id ${mockAgentId} with manifest ${mockManifestRef}`, 'publish.log')
    jest.useRealTimers()
  })

  it("updates agent in registry if it already exists", async () => {
    const systemTime = new Date()
    jest.useFakeTimers('modern').setSystemTime(systemTime)
    mockAgentRegistry.getAgent.mockReturnValueOnce({created: true, owner: mockFromAddress})
    mockFromWallet.getAddress.mockReturnValue('0x123')
    mockFromWallet.getBalance.mockReturnValueOnce(BigNumber.from(1))

    await pushToRegistry(mockManifestRef,  mockFromWallet as any)

    expect(mockAgentRegistry.getAgent).toHaveBeenCalledTimes(1)
    expect(mockAgentRegistry.getAgent).toHaveBeenCalledWith(mockAgentId)
    expect(mockAgentRegistry.getAgent).toHaveBeenCalledBefore(mockAgentRegistry.updateAgent)
    expect(mockAgentRegistry.updateAgent).toHaveBeenCalledTimes(1)
    const [fromWallet, agentId, manifestReference, chainIds] = mockAgentRegistry.updateAgent.mock.calls[0]
    expect(fromWallet).toEqual(mockFromWallet)
    expect(agentId).toEqual(mockAgentId)
    expect(manifestReference).toEqual(mockManifestRef)
    expect(chainIds).toEqual(mockChainIds)
    expect(mockAgentRegistry.createAgent).toHaveBeenCalledTimes(0)
    expect(mockAppendToFile).toHaveBeenCalledTimes(1)
    expect(mockAppendToFile).toHaveBeenCalledWith(`${systemTime.toUTCString()}: successfully updated agent id ${mockAgentId} with manifest ${mockManifestRef}`, 'publish.log')
    jest.useRealTimers()
  })
})
