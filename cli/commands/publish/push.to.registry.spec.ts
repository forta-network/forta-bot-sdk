import { Wallet } from "ethers"
import providePushToRegistry, { PushToRegistry } from "./push.to.registry"

describe("pushToRegistry", () => {
  let pushToRegistry: PushToRegistry
  const mockAppendToFile = jest.fn()
  const mockAgentRegistry = {
    agentExists: jest.fn(),
    createAgent: jest.fn(),
    updateAgent: jest.fn()
  } as any
  const mockAgentId = "0xagentId"
  const mockManifestRef = "abc123"
  const mockPrivateKey = "0xabcd"

  const resetMocks = () => {
    mockAppendToFile.mockReset()
    mockAgentRegistry.agentExists.mockReset()
    mockAgentRegistry.createAgent.mockReset()
    mockAgentRegistry.updateAgent.mockReset()
  }

  beforeAll(() => {
    pushToRegistry = providePushToRegistry(mockAppendToFile, mockAgentRegistry, mockAgentId)
  })

  beforeEach(() => resetMocks())

  it("adds agent to registry if it does not already exist", async () => {
    const systemTime = new Date()
    jest.useFakeTimers('modern').setSystemTime(systemTime)
    mockAgentRegistry.agentExists.mockReturnValueOnce(false)

    await pushToRegistry(mockManifestRef, mockPrivateKey)

    expect(mockAgentRegistry.agentExists).toHaveBeenCalledTimes(1)
    expect(mockAgentRegistry.agentExists).toHaveBeenCalledWith(mockAgentId)
    expect(mockAgentRegistry.agentExists).toHaveBeenCalledBefore(mockAgentRegistry.createAgent)
    expect(mockAgentRegistry.createAgent).toHaveBeenCalledTimes(1)
    const [fromWallet, agentId, manifestReference] = mockAgentRegistry.createAgent.mock.calls[0]
    expect(fromWallet).toBeInstanceOf(Wallet)
    expect(fromWallet.getAddress()).toEqual(new Wallet(mockPrivateKey).getAddress())
    expect(agentId).toEqual(mockAgentId)
    expect(manifestReference).toEqual(mockManifestRef)
    expect(mockAgentRegistry.updateAgent).toHaveBeenCalledTimes(0)
    expect(mockAppendToFile).toHaveBeenCalledTimes(1)
    expect(mockAppendToFile).toHaveBeenCalledWith(`${systemTime.toUTCString()}: successfully added agent id ${mockAgentId} with manifest ${mockManifestRef}`, 'publish.log')
    jest.useRealTimers()
  })

  it("updates agent in registry if it already exists", async () => {
    const systemTime = new Date()
    jest.useFakeTimers('modern').setSystemTime(systemTime)
    mockAgentRegistry.agentExists.mockReturnValueOnce(true)

    await pushToRegistry(mockManifestRef, mockPrivateKey)

    expect(mockAgentRegistry.agentExists).toHaveBeenCalledTimes(1)
    expect(mockAgentRegistry.agentExists).toHaveBeenCalledWith(mockAgentId)
    expect(mockAgentRegistry.agentExists).toHaveBeenCalledBefore(mockAgentRegistry.updateAgent)
    expect(mockAgentRegistry.updateAgent).toHaveBeenCalledTimes(1)
    const [fromWallet, agentId, manifestReference] = mockAgentRegistry.updateAgent.mock.calls[0]
    expect(fromWallet).toBeInstanceOf(Wallet)
    expect(fromWallet.getAddress()).toEqual(new Wallet(mockPrivateKey).getAddress())
    expect(agentId).toEqual(mockAgentId)
    expect(manifestReference).toEqual(mockManifestRef)
    expect(mockAgentRegistry.createAgent).toHaveBeenCalledTimes(0)
    expect(mockAppendToFile).toHaveBeenCalledTimes(1)
    expect(mockAppendToFile).toHaveBeenCalledWith(`${systemTime.toUTCString()}: successfully updated agent id ${mockAgentId} with manifest ${mockManifestRef}`, 'publish.log')
    jest.useRealTimers()
  })
})