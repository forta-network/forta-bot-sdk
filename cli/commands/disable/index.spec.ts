import { Wallet } from "ethers"
import provideDisable from "."
import { CommandHandler } from "../.."

describe("disable", () => {
  let disable: CommandHandler
  const mockAppendToFile = jest.fn()
  const mockGetCredentials = jest.fn()
  const mockBotRegistry = {
    agentExists: jest.fn(),
    isEnabled: jest.fn(),
    disableAgent: jest.fn()
  } as any
  const mockAgentId = "0xagentid"

  const resetMocks = () => {
    mockBotRegistry.agentExists.mockReset()
    mockBotRegistry.isEnabled.mockReset()
    mockBotRegistry.disableAgent.mockReset()
  }

  beforeAll(() => {
    disable = provideDisable(
      mockAppendToFile, mockGetCredentials, mockBotRegistry, mockAgentId
    )
  })

  beforeEach(() => {
    resetMocks()
  })

  it("throws error if agent does not exist", async () => {
    mockBotRegistry.agentExists.mockReturnValueOnce(false)

    try {
      await disable()
    } catch (e) {
      expect(e.message).toBe(`bot id ${mockAgentId} does not exist`)
    }

    expect(mockBotRegistry.agentExists).toHaveBeenCalledTimes(1)
    expect(mockBotRegistry.agentExists).toHaveBeenCalledWith(mockAgentId)
  })

  it("does nothing if agent already disabled", async () => {
    mockBotRegistry.agentExists.mockReturnValueOnce(true)
    mockBotRegistry.isEnabled.mockReturnValueOnce(false)

    await disable()

    expect(mockBotRegistry.agentExists).toHaveBeenCalledTimes(1)
    expect(mockBotRegistry.agentExists).toHaveBeenCalledWith(mockAgentId)
    expect(mockBotRegistry.isEnabled).toHaveBeenCalledTimes(1)
    expect(mockBotRegistry.isEnabled).toHaveBeenCalledWith(mockAgentId)
    expect(mockBotRegistry.disableAgent).toHaveBeenCalledTimes(0)
  })

  it("disables agent in agent registry contract", async () => {
    const systemTime = new Date()
    jest.useFakeTimers('modern').setSystemTime(systemTime)
    mockBotRegistry.agentExists.mockReturnValueOnce(true)
    mockBotRegistry.isEnabled.mockReturnValueOnce(true)
    const mockPrivateKey = "0x4567"
    mockGetCredentials.mockReturnValueOnce({ privateKey: mockPrivateKey })

    await disable()

    expect(mockBotRegistry.agentExists).toHaveBeenCalledTimes(1)
    expect(mockBotRegistry.agentExists).toHaveBeenCalledWith(mockAgentId)
    expect(mockBotRegistry.isEnabled).toHaveBeenCalledTimes(1)
    expect(mockBotRegistry.isEnabled).toHaveBeenCalledWith(mockAgentId)
    expect(mockGetCredentials).toHaveBeenCalledTimes(1)
    expect(mockGetCredentials).toHaveBeenCalledWith()
    expect(mockBotRegistry.disableAgent).toHaveBeenCalledTimes(1)
    const [fromWallet, agentId] = mockBotRegistry.disableAgent.mock.calls[0]
    expect(fromWallet).toBeInstanceOf(Wallet)
    expect(fromWallet.getAddress()).toEqual(new Wallet(mockPrivateKey).getAddress())
    expect(agentId).toEqual(mockAgentId)
    expect(mockAppendToFile).toHaveBeenCalledTimes(1)
    expect(mockAppendToFile).toHaveBeenCalledWith(`${systemTime.toUTCString()}: successfully disabled bot id ${mockAgentId}`, 'publish.log')
    jest.useRealTimers()
  })
})