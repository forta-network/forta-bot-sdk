import { Wallet } from "ethers"
import provideEnable from "."
import { CommandHandler } from "../.."

describe("enable", () => {
  let enable: CommandHandler
  const mockAppendToFile = jest.fn()
  const mockGetCredentials = jest.fn()
  const mockAgentRegistry = {
    agentExists: jest.fn(),
    isEnabled: jest.fn(),
    enableAgent: jest.fn()
  } as any
  const mockAgentId = "0xagentid"

  const resetMocks = () => {
    mockAgentRegistry.agentExists.mockReset()
    mockAgentRegistry.isEnabled.mockReset()
    mockAgentRegistry.enableAgent.mockReset()
  }

  beforeAll(() => {
    enable = provideEnable(
      mockAppendToFile, mockGetCredentials, mockAgentRegistry, mockAgentId
    )
  })

  beforeEach(() => {
    resetMocks()
  })

  it("throws error if agent does not exist", async () => {
    mockAgentRegistry.agentExists.mockReturnValueOnce(false)

    try {
      await enable({})
    } catch (e) {
      expect(e.message).toBe(`agent id ${mockAgentId} does not exist`)
    }

    expect(mockAgentRegistry.agentExists).toHaveBeenCalledTimes(1)
    expect(mockAgentRegistry.agentExists).toHaveBeenCalledWith(mockAgentId)
  })

  it("does nothing if agent already enabled", async () => {
    mockAgentRegistry.agentExists.mockReturnValueOnce(true)
    mockAgentRegistry.isEnabled.mockReturnValueOnce(true)

    await enable({})

    expect(mockAgentRegistry.agentExists).toHaveBeenCalledTimes(1)
    expect(mockAgentRegistry.agentExists).toHaveBeenCalledWith(mockAgentId)
    expect(mockAgentRegistry.isEnabled).toHaveBeenCalledTimes(1)
    expect(mockAgentRegistry.isEnabled).toHaveBeenCalledWith(mockAgentId)
    expect(mockAgentRegistry.enableAgent).toHaveBeenCalledTimes(0)
  })

  it("enables agent in agent registry contract", async () => {
    const systemTime = new Date()
    jest.useFakeTimers('modern').setSystemTime(systemTime)
    mockAgentRegistry.agentExists.mockReturnValueOnce(true)
    mockAgentRegistry.isEnabled.mockReturnValueOnce(false)
    const mockPrivateKey = "0x4567"
    mockGetCredentials.mockReturnValueOnce({ privateKey: mockPrivateKey })

    await enable({})

    expect(mockAgentRegistry.agentExists).toHaveBeenCalledTimes(1)
    expect(mockAgentRegistry.agentExists).toHaveBeenCalledWith(mockAgentId)
    expect(mockAgentRegistry.isEnabled).toHaveBeenCalledTimes(1)
    expect(mockAgentRegistry.isEnabled).toHaveBeenCalledWith(mockAgentId)
    expect(mockGetCredentials).toHaveBeenCalledTimes(1)
    expect(mockGetCredentials).toHaveBeenCalledWith()
    expect(mockAgentRegistry.enableAgent).toHaveBeenCalledTimes(1)
    const [fromWallet, agentId] = mockAgentRegistry.enableAgent.mock.calls[0]
    expect(fromWallet).toBeInstanceOf(Wallet)
    expect(fromWallet.getAddress()).toEqual(new Wallet(mockPrivateKey).getAddress())
    expect(agentId).toEqual(mockAgentId)
    expect(mockAppendToFile).toHaveBeenCalledTimes(1)
    expect(mockAppendToFile).toHaveBeenCalledWith(`${systemTime.toUTCString()}: successfully enabled agent id ${mockAgentId}`, 'publish.log')
    jest.useRealTimers()
  })
})