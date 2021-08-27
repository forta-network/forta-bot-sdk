import { keccak256 } from "../../utils"
import providePushToRegistry, { PushToRegistry } from "./push.to.registry"

describe("pushToRegistry", () => {
  let pushToRegistry: PushToRegistry
  const mockWeb3 = {
    eth: { accounts: { wallet: { add: jest.fn() } } }
  } as any
  const mockAgentRegistry = {
    agentExists: jest.fn(),
    createAgent: jest.fn(),
    updateAgent: jest.fn()
  } as any
  const mockAgentId = "agentId"
  const mockAgentIdHash = keccak256(mockAgentId)
  const mockManifestRef = "abc123"
  const mockPublicKey = "0x123"
  const mockPrivateKey = "0xabc"

  const resetMocks = () => {
    mockWeb3.eth.accounts.wallet.add.mockReset()
    mockAgentRegistry.agentExists.mockReset()
    mockAgentRegistry.createAgent.mockReset()
    mockAgentRegistry.updateAgent.mockReset()
  }

  beforeAll(() => {
    pushToRegistry = providePushToRegistry(mockWeb3, mockAgentRegistry, mockAgentId)
  })

  beforeEach(() => resetMocks())

  it("adds agent to registry if it does not already exist", async () => {
    mockAgentRegistry.agentExists.mockReturnValueOnce(false)

    await pushToRegistry(mockManifestRef, mockPublicKey, mockPrivateKey)

    expect(mockWeb3.eth.accounts.wallet.add).toHaveBeenCalledTimes(1)
    expect(mockWeb3.eth.accounts.wallet.add).toHaveBeenCalledWith(mockPrivateKey)
    expect(mockWeb3.eth.accounts.wallet.add).toHaveBeenCalledBefore(mockAgentRegistry.agentExists)
    expect(mockAgentRegistry.agentExists).toHaveBeenCalledTimes(1)
    expect(mockAgentRegistry.agentExists).toHaveBeenCalledWith(mockAgentIdHash)
    expect(mockAgentRegistry.agentExists).toHaveBeenCalledBefore(mockAgentRegistry.createAgent)
    expect(mockAgentRegistry.createAgent).toHaveBeenCalledTimes(1)
    expect(mockAgentRegistry.createAgent).toHaveBeenCalledWith(mockPublicKey, mockAgentIdHash, mockManifestRef)
    expect(mockAgentRegistry.updateAgent).toHaveBeenCalledTimes(0)
  })

  it("updates agent in registry if it already exists", async () => {
    mockAgentRegistry.agentExists.mockReturnValueOnce(true)

    await pushToRegistry(mockManifestRef, mockPublicKey, mockPrivateKey)

    expect(mockWeb3.eth.accounts.wallet.add).toHaveBeenCalledTimes(1)
    expect(mockWeb3.eth.accounts.wallet.add).toHaveBeenCalledWith(mockPrivateKey)
    expect(mockWeb3.eth.accounts.wallet.add).toHaveBeenCalledBefore(mockAgentRegistry.agentExists)
    expect(mockAgentRegistry.agentExists).toHaveBeenCalledTimes(1)
    expect(mockAgentRegistry.agentExists).toHaveBeenCalledWith(mockAgentIdHash)
    expect(mockAgentRegistry.agentExists).toHaveBeenCalledBefore(mockAgentRegistry.updateAgent)
    expect(mockAgentRegistry.updateAgent).toHaveBeenCalledTimes(1)
    expect(mockAgentRegistry.updateAgent).toHaveBeenCalledWith(mockPublicKey, mockAgentIdHash, mockManifestRef)
    expect(mockAgentRegistry.createAgent).toHaveBeenCalledTimes(0)
  })
})