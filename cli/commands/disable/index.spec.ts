import { Wallet } from "ethers"
import provideDisable from "."
import { CommandHandler } from "../.."

describe("disable", () => {
  let disable: CommandHandler
  const mockAppendToFile = jest.fn()
  const mockGetCredentials = jest.fn()
  const mockAgentRegistry = {
    agentExists: jest.fn(),
    isEnabled: jest.fn(),
    disableAgent: jest.fn()
  } as any
  const mockAgentId = "0xagentid"

  const resetMocks = () => {
    mockAgentRegistry.agentExists.mockReset()
    mockAgentRegistry.isEnabled.mockReset()
    mockAgentRegistry.disableAgent.mockReset()
  }

  beforeAll(() => {
    disable = provideDisable(
      mockAppendToFile, mockGetCredentials, mockAgentRegistry, mockAgentId
    )
  })

  beforeEach(() => {
    resetMocks()
  })

  it("throws error if agent does not exist", async () => {
    mockAgentRegistry.agentExists.mockReturnValueOnce(false)

    try {
      await disable({})
    } catch (e) {
      expect(e.message).toBe(`agent id ${mockAgentId} does not exist`)
    }

    expect(mockAgentRegistry.agentExists).toHaveBeenCalledTimes(1)
    expect(mockAgentRegistry.agentExists).toHaveBeenCalledWith(mockAgentId)
  })

  it("does nothing if agent already disabled", async () => {
    mockAgentRegistry.agentExists.mockReturnValueOnce(true)
    mockAgentRegistry.isEnabled.mockReturnValueOnce(false)

    await disable({})

    expect(mockAgentRegistry.agentExists).toHaveBeenCalledTimes(1)
    expect(mockAgentRegistry.agentExists).toHaveBeenCalledWith(mockAgentId)
    expect(mockAgentRegistry.isEnabled).toHaveBeenCalledTimes(1)
    expect(mockAgentRegistry.isEnabled).toHaveBeenCalledWith(mockAgentId)
    expect(mockAgentRegistry.disableAgent).toHaveBeenCalledTimes(0)
  })

  it("disables agent in agent registry contract", async () => {
    const systemTime = new Date()
    jest.useFakeTimers('modern').setSystemTime(systemTime)
    mockAgentRegistry.agentExists.mockReturnValueOnce(true)
    mockAgentRegistry.isEnabled.mockReturnValueOnce(true)
    const mockPrivateKey = "0x4567"
    mockGetCredentials.mockReturnValueOnce({ privateKey: mockPrivateKey })

    await disable({})

    expect(mockAgentRegistry.agentExists).toHaveBeenCalledTimes(1)
    expect(mockAgentRegistry.agentExists).toHaveBeenCalledWith(mockAgentId)
    expect(mockAgentRegistry.isEnabled).toHaveBeenCalledTimes(1)
    expect(mockAgentRegistry.isEnabled).toHaveBeenCalledWith(mockAgentId)
    expect(mockGetCredentials).toHaveBeenCalledTimes(1)
    expect(mockGetCredentials).toHaveBeenCalledWith()
    expect(mockAgentRegistry.disableAgent).toHaveBeenCalledTimes(1)
    const [fromWallet, agentId] = mockAgentRegistry.disableAgent.mock.calls[0]
    expect(fromWallet).toBeInstanceOf(Wallet)
    expect(fromWallet.getAddress()).toEqual(new Wallet(mockPrivateKey).getAddress())
    expect(agentId).toEqual(mockAgentId)
    expect(mockAppendToFile).toHaveBeenCalledTimes(1)
    expect(mockAppendToFile).toHaveBeenCalledWith(`${systemTime.toUTCString()}: successfully disabled agent id ${mockAgentId}`, 'publish.log')
    jest.useRealTimers()
  })
})