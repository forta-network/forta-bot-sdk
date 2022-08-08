import { Wallet } from "ethers"
import provideEnable from "."
import { CommandHandler } from "../.."

describe("enable", () => {
  let enable: CommandHandler
  const mockAppendToFile = jest.fn()
  const mockGetCredentials = jest.fn()
  const mockBotRegistry = {
    agentExists: jest.fn(),
    isEnabled: jest.fn(),
    enableAgent: jest.fn()
  } as any
  const mockAgentId = "0xagentid"

  const resetMocks = () => {
    mockBotRegistry.agentExists.mockReset()
    mockBotRegistry.isEnabled.mockReset()
    mockBotRegistry.enableAgent.mockReset()
  }

  beforeAll(() => {
    enable = provideEnable(
      mockAppendToFile, mockGetCredentials, mockBotRegistry, mockAgentId
    )
  })

  beforeEach(() => {
    resetMocks()
  })

  it("throws error if agent does not exist", async () => {
    mockBotRegistry.agentExists.mockReturnValueOnce(false)

    try {
      await enable()
    } catch (e) {
      expect(e.message).toBe(`bot id ${mockAgentId} does not exist`)
    }

    expect(mockBotRegistry.agentExists).toHaveBeenCalledTimes(1)
    expect(mockBotRegistry.agentExists).toHaveBeenCalledWith(mockAgentId)
  })

  it("does nothing if agent already enabled", async () => {
    mockBotRegistry.agentExists.mockReturnValueOnce(true)
    mockBotRegistry.isEnabled.mockReturnValueOnce(true)

    await enable()

    expect(mockBotRegistry.agentExists).toHaveBeenCalledTimes(1)
    expect(mockBotRegistry.agentExists).toHaveBeenCalledWith(mockAgentId)
    expect(mockBotRegistry.isEnabled).toHaveBeenCalledTimes(1)
    expect(mockBotRegistry.isEnabled).toHaveBeenCalledWith(mockAgentId)
    expect(mockBotRegistry.enableAgent).toHaveBeenCalledTimes(0)
  })

  it("enables agent in agent registry contract", async () => {
    const systemTime = new Date()
    jest.useFakeTimers('modern').setSystemTime(systemTime)
    mockBotRegistry.agentExists.mockReturnValueOnce(true)
    mockBotRegistry.isEnabled.mockReturnValueOnce(false)
    const mockPrivateKey = "0x4567"
    mockGetCredentials.mockReturnValueOnce({ privateKey: mockPrivateKey })

    await enable()

    expect(mockBotRegistry.agentExists).toHaveBeenCalledTimes(1)
    expect(mockBotRegistry.agentExists).toHaveBeenCalledWith(mockAgentId)
    expect(mockBotRegistry.isEnabled).toHaveBeenCalledTimes(1)
    expect(mockBotRegistry.isEnabled).toHaveBeenCalledWith(mockAgentId)
    expect(mockGetCredentials).toHaveBeenCalledTimes(1)
    expect(mockGetCredentials).toHaveBeenCalledWith()
    expect(mockBotRegistry.enableAgent).toHaveBeenCalledTimes(1)
    const [fromWallet, agentId] = mockBotRegistry.enableAgent.mock.calls[0]
    expect(fromWallet).toBeInstanceOf(Wallet)
    expect(fromWallet.getAddress()).toEqual(new Wallet(mockPrivateKey).getAddress())
    expect(agentId).toEqual(mockAgentId)
    expect(mockAppendToFile).toHaveBeenCalledTimes(1)
    expect(mockAppendToFile).toHaveBeenCalledWith(`${systemTime.toUTCString()}: successfully enabled bot id ${mockAgentId}`, 'publish.log')
    jest.useRealTimers()
  })
})