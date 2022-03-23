import { join } from "path"
import provideGetFortaConfig, { GetFortaConfig } from "./get.forta.config"

describe("getFortaConfig", () => {
  let getFortaConfig: GetFortaConfig
  const mockFilesystem = {
    existsSync: jest.fn()
  } as any
  const mockIsProduction = false
  const mockConfigFilename = "forta.config.json"
  const mockLocalConfigFilename = "local.forta.config.json"
  const mockFortaKeystore = "/path/to/keystore"
  const mockGetJsonFile = jest.fn()
  const mockContextPath = "/path/to/agent"

  const resetMocks = () => {
    mockFilesystem.existsSync.mockReset()
    mockGetJsonFile.mockReset()
  }

  beforeAll(() => {
    getFortaConfig = provideGetFortaConfig(
      mockFilesystem, mockIsProduction, mockConfigFilename, mockLocalConfigFilename, mockFortaKeystore, mockGetJsonFile, mockContextPath
    )
  })

  beforeEach(() => resetMocks())

  it("throws error if unable to parse global config file", () => {
    mockFilesystem.existsSync.mockReturnValueOnce(true)
    const errMsg = 'some error'
    mockGetJsonFile.mockImplementationOnce(() => { throw new Error(errMsg) })

    try {
      getFortaConfig()
    } catch (e) {
      expect(e.message).toEqual(`unable to parse config file ${mockConfigFilename}: ${errMsg}`)
    }
  })

  it("throws error if unable to parse local config file", () => {
    mockFilesystem.existsSync.mockReturnValueOnce(true).mockReturnValueOnce(true)
    const errMsg = 'some error'
    mockGetJsonFile.mockImplementationOnce(() => ({})).mockImplementationOnce(() => { throw new Error(errMsg) })

    try {
      getFortaConfig()
    } catch (e) {
      expect(e.message).toEqual(`unable to parse project config file ${mockLocalConfigFilename}: ${errMsg}`)
    }
  })

  it("returns empty config if commandName is init", () => {
    mockFilesystem.existsSync.mockReturnValue(false)
    const getFortaConfig = provideGetFortaConfig(
      mockFilesystem, mockIsProduction, mockConfigFilename, mockLocalConfigFilename, mockFortaKeystore, mockGetJsonFile, mockContextPath
    )

    const config = getFortaConfig()

    expect(config).toStrictEqual({})
  })

  it("returns empty config if isProduction is true", () => {
    const getFortaConfig = provideGetFortaConfig(
      mockFilesystem, true, mockConfigFilename, mockLocalConfigFilename, mockFortaKeystore, mockGetJsonFile, mockContextPath
    )

    const config = getFortaConfig()

    expect(config).toStrictEqual({})
  })

  it("returns empty config if no config files exist", () => {
    mockFilesystem.existsSync.mockReturnValue(false)

    const config = getFortaConfig()

    expect(config).toStrictEqual({})
    expect(mockFilesystem.existsSync).toHaveBeenCalledTimes(2)
    expect(mockFilesystem.existsSync).toHaveBeenNthCalledWith(1, join(mockFortaKeystore, mockConfigFilename))
    expect(mockFilesystem.existsSync).toHaveBeenNthCalledWith(2, join(mockContextPath, mockLocalConfigFilename))
  })

  it("returns combined global and local config", () => {
    mockFilesystem.existsSync.mockReturnValue(true)
    const mockGlobalConfig = { some: 'config', another: 'value' }
    const mockLocalConfig = { another: 'value2', val: 'blue' }
    mockGetJsonFile.mockReturnValueOnce(mockGlobalConfig).mockReturnValueOnce(mockLocalConfig)

    const config = getFortaConfig()

    expect(config).toStrictEqual({
      some: mockGlobalConfig.some,
      another: mockLocalConfig.another,
      val: mockLocalConfig.val
    })
    expect(mockFilesystem.existsSync).toHaveBeenCalledTimes(2)
    expect(mockGetJsonFile).toHaveBeenCalledTimes(2)
  })
})