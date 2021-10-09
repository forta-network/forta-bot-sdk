import { join } from 'path'
import provideInit from "."
import { CommandHandler } from "../.."

describe("init", () => {
  let init: CommandHandler
  const mockShell = {
    ls: jest.fn(),
    cp: jest.fn(),
    mv: jest.fn(),
    rm: jest.fn(),
    mkdir: jest.fn()
  } as any
  const mockPrompt = jest.fn() as any
  const mockFilesystem = {
    existsSync: jest.fn()
  } as any
  const mockFortaKeystore = "/some/keystore/path"
  const mockConfigFilename = "forta.config.json"
  const mockListKeyfiles = jest.fn()
  const mockCreateKeyfile = jest.fn()
  const mockCliArgs = {}
  const starterProjectPath = `${join(__dirname, '..', '..', '..', 'starter-project')}`

  const resetMocks = () => {
    mockShell.ls.mockReset()
    mockShell.cp.mockReset()
    mockShell.mv.mockReset()
    mockShell.rm.mockReset()
    mockShell.mkdir.mockReset()
    mockPrompt.mockReset()
    mockFilesystem.existsSync.mockReset()
    mockListKeyfiles.mockReset()
    mockCreateKeyfile.mockReset()
  }

  beforeAll(() => {
    init = provideInit(
      mockShell, mockPrompt, mockFilesystem, mockFortaKeystore, mockConfigFilename, mockListKeyfiles, mockCreateKeyfile)
  })

  beforeEach(() => resetMocks())

  it("prompts user if current directory is empty and aborts if user says so", async () => {
    mockShell.ls.mockReturnValueOnce(['file1', 'file2'])
    mockPrompt.mockReturnValueOnce({ proceed: 'no' })

    await init(mockCliArgs)

    expect(mockShell.ls).toHaveBeenCalledTimes(1)
    expect(mockPrompt).toHaveBeenCalledTimes(1)
    expect(mockPrompt).toHaveBeenCalledWith({
      type: 'text',
      name: 'proceed',
      message: `The current directory is not empty and files could be overwritten. Are you sure you want to initialize? (type 'yes' to proceed)`
    })
    expect(mockShell.cp).toHaveBeenCalledTimes(0)
    expect(mockShell.mv).toHaveBeenCalledTimes(0)
    expect(mockShell.rm).toHaveBeenCalledTimes(0)
    expect(mockCreateKeyfile).toHaveBeenCalledTimes(0)
  })

  it("throws error if unable to copy starter project directory", async () => {
    mockShell.ls.mockReturnValue([])
    const copyProjectResult = { code: -1, stderr: 'some shell error' }
    mockShell.cp.mockReturnValueOnce(copyProjectResult)

    try {
      await init(mockCliArgs)
    } catch (e) {
      expect(e.message).toEqual(`error copying starter-project folder: ${copyProjectResult.stderr}`)
    }

    expect(mockShell.ls).toHaveBeenCalledTimes(1)
    expect(mockShell.cp).toHaveBeenCalledTimes(1)
    expect(mockShell.cp).toHaveBeenCalledWith('-r', [`${starterProjectPath}/*`, `${starterProjectPath}/.*`], '.')
  })

  it("throws error if unable to copy files out of js/ts directory", async () => {
    mockShell.ls.mockReturnValue([])
    const copyProjectResult = { code: 0 }
    const copyJsTsResult = { code: -1, stderr: 'some shell error' }
    mockShell.cp.mockReturnValueOnce(copyProjectResult)
      .mockReturnValueOnce(copyJsTsResult)
      .mockReturnValueOnce(copyProjectResult)
      .mockReturnValueOnce(copyJsTsResult)

    try {
      await init(mockCliArgs)
    } catch (e) {
      expect(e.message).toEqual(`error unpacking js folder: ${copyJsTsResult.stderr}`)
    }
    try {
      await init({ ...mockCliArgs, typescript: true })
    } catch (e) {
      expect(e.message).toEqual(`error unpacking ts folder: ${copyJsTsResult.stderr}`)
    }

    expect(mockShell.ls).toHaveBeenCalledTimes(2)
    expect(mockShell.cp).toHaveBeenCalledTimes(4)
    expect(mockShell.cp).toHaveBeenNthCalledWith(1, '-r', [`${starterProjectPath}/*`, `${starterProjectPath}/.*`], '.')
    expect(mockShell.cp).toHaveBeenNthCalledWith(2, '-r', './js/*', '.')
    expect(mockShell.cp).toHaveBeenNthCalledWith(3, '-r', [`${starterProjectPath}/*`, `${starterProjectPath}/.*`], '.')
    expect(mockShell.cp).toHaveBeenNthCalledWith(4, '-r', './ts/*', '.')
  })

  it("throws error if unable to rename gitignore file", async () => {
    mockShell.ls.mockReturnValue([])
    const copyProjectResult = { code: 0 }
    const copyJsTsResult = { code: 0 }
    mockShell.cp.mockReturnValueOnce(copyProjectResult).mockReturnValueOnce(copyJsTsResult)
    const renameGitignoreResult = { code: -1, stderr: 'some shell error' }
    mockShell.mv.mockReturnValueOnce(renameGitignoreResult)

    try {
      await init(mockCliArgs)
    } catch (e) {
      expect(e.message).toEqual(`error renaming gitignore file: ${renameGitignoreResult.stderr}`)
    }

    expect(mockShell.ls).toHaveBeenCalledTimes(1)
    expect(mockShell.cp).toHaveBeenCalledTimes(2)
    expect(mockShell.mv).toHaveBeenCalledTimes(1)
    expect(mockShell.mv).toHaveBeenCalledWith('_gitignore', '.gitignore')
  })

  it("throws error if unable to remove unused files/folders", async () => {
    mockShell.ls.mockReturnValue([])
    const copyProjectResult = { code: 0 }
    const copyJsTsResult = { code: 0 }
    mockShell.cp.mockReturnValueOnce(copyProjectResult).mockReturnValueOnce(copyJsTsResult)
    const renameGitignoreResult = { code: 0 }
    mockShell.mv.mockReturnValueOnce(renameGitignoreResult)
    const removeUnusedResult = { code: -1, stderr: 'some shell error' }
    mockShell.rm.mockReturnValueOnce(removeUnusedResult)

    try {
      await init(mockCliArgs)
    } catch (e) {
      expect(e.message).toEqual(`error cleaning up files: ${removeUnusedResult.stderr}`)
    }

    expect(mockShell.ls).toHaveBeenCalledTimes(1)
    expect(mockShell.cp).toHaveBeenCalledTimes(2)
    expect(mockShell.mv).toHaveBeenCalledTimes(1)
    expect(mockShell.rm).toHaveBeenCalledTimes(1)
    expect(mockShell.rm).toHaveBeenCalledWith('-rf', 'js', 'ts', 'py', '.npmignore')
  })

  it("throws error if unable to create keystore folder", async () => {
    mockShell.ls.mockReturnValue([])
    const copyProjectResult = { code: 0 }
    const copyJsTsResult = { code: 0 }
    mockShell.cp.mockReturnValueOnce(copyProjectResult).mockReturnValueOnce(copyJsTsResult)
    const renameGitignoreResult = { code: 0 }
    mockShell.mv.mockReturnValueOnce(renameGitignoreResult)
    const removeUnusedResult = { code: 0 }
    mockShell.rm.mockReturnValueOnce(removeUnusedResult)
    mockFilesystem.existsSync.mockReturnValueOnce(false)
    const createKeystoreResult = { code: -1, stderr: 'some shell error'}
    mockShell.mkdir.mockReturnValueOnce(createKeystoreResult)

    try {
      await init(mockCliArgs)
    } catch (e) {
      expect(e.message).toEqual(`error creating keystore folder ${mockFortaKeystore}: ${createKeystoreResult.stderr}`)
    }

    expect(mockShell.ls).toHaveBeenCalledTimes(1)
    expect(mockShell.cp).toHaveBeenCalledTimes(2)
    expect(mockShell.mv).toHaveBeenCalledTimes(1)
    expect(mockShell.rm).toHaveBeenCalledTimes(1)
    expect(mockFilesystem.existsSync).toHaveBeenCalledTimes(1)
    expect(mockFilesystem.existsSync).toHaveBeenNthCalledWith(1, mockFortaKeystore)
    expect(mockShell.mkdir).toHaveBeenCalledTimes(1)
    expect(mockShell.mkdir).toHaveBeenNthCalledWith(1, mockFortaKeystore)
  })

  it("throws error if unable to create forta.config.json", async () => {
    mockShell.ls.mockReturnValue([])
    const copyProjectResult = { code: 0 }
    const copyJsTsResult = { code: 0 }
    mockShell.cp.mockReturnValueOnce(copyProjectResult).mockReturnValueOnce(copyJsTsResult)
    const renameGitignoreResult = { code: 0 }
    mockShell.mv.mockReturnValueOnce(renameGitignoreResult)
    const removeUnusedResult = { code: 0 }
    mockShell.rm.mockReturnValueOnce(removeUnusedResult)
    const createKeystoreResult = { code: 0 }
    mockShell.mkdir.mockReturnValueOnce(createKeystoreResult)
    mockFilesystem.existsSync.mockReturnValueOnce(true).mockReturnValueOnce(false)
    const copyConfigResult = { code: -1, stderr: 'some shell error'}
    mockShell.cp.mockReturnValueOnce(copyConfigResult)

    try {
      await init(mockCliArgs)
    } catch (e) {
      expect(e.message).toEqual(`error creating ${mockConfigFilename}: ${copyConfigResult.stderr}`)
    }

    expect(mockShell.ls).toHaveBeenCalledTimes(1)
    expect(mockShell.cp).toHaveBeenCalledTimes(3)
    expect(mockShell.mv).toHaveBeenCalledTimes(1)
    expect(mockShell.rm).toHaveBeenCalledTimes(1)
    expect(mockFilesystem.existsSync).toHaveBeenCalledTimes(2)
    expect(mockFilesystem.existsSync).toHaveBeenNthCalledWith(2, join(mockFortaKeystore, mockConfigFilename))
    expect(mockShell.mkdir).toHaveBeenCalledTimes(0)
    expect(mockShell.cp).toHaveBeenNthCalledWith(3, join(__dirname, mockConfigFilename), mockFortaKeystore)
  })

  it("prompts user for password to encrypt new keyfile if one does not exist", async () => {
    mockShell.ls.mockReturnValue([])
    mockListKeyfiles.mockReturnValueOnce([])
    const copyProjectResult = { code: 0 }
    const copyJsTsResult = { code: 0 }
    const copyConfigResult = { code: 0 }
    mockShell.cp.mockReturnValueOnce(copyProjectResult).mockReturnValueOnce(copyJsTsResult).mockReturnValueOnce(copyConfigResult)
    const renameGitignoreResult = { code: 0 }
    mockShell.mv.mockReturnValueOnce(renameGitignoreResult)
    const removeUnusedResult = { code: 0 }
    mockShell.rm.mockReturnValueOnce(removeUnusedResult)
    const password = 'some password'
    mockPrompt.mockReturnValueOnce({ password })
    mockFilesystem.existsSync.mockReturnValueOnce(true).mockReturnValueOnce(true)

    await init(mockCliArgs)

    expect(mockShell.ls).toHaveBeenCalledTimes(1)
    expect(mockShell.cp).toHaveBeenCalledTimes(2)
    expect(mockShell.mv).toHaveBeenCalledTimes(1)
    expect(mockShell.rm).toHaveBeenCalledTimes(1)
    expect(mockShell.mkdir).toHaveBeenCalledTimes(0)
    expect(mockPrompt).toHaveBeenCalledTimes(1)
    expect(mockPrompt).toHaveBeenLastCalledWith({
      type: 'password',
      name: 'password',
      message: `Enter password to encrypt new keyfile`
    })
    expect(mockListKeyfiles).toHaveBeenCalledTimes(1)
    expect(mockListKeyfiles).toHaveBeenCalledWith()
    expect(mockCreateKeyfile).toHaveBeenCalledTimes(1)
    expect(mockCreateKeyfile).toHaveBeenCalledWith(password)
  })

  it("does not prompt user for password if keyfile already exists", async () => {
    mockShell.ls.mockReturnValueOnce([])
    mockListKeyfiles.mockReturnValueOnce(['existingKeyfile'])
    const copyProjectResult = { code: 0 }
    const copyJsTsResult = { code: 0 }
    const copyConfigResult = { code: 0 }
    mockShell.cp.mockReturnValueOnce(copyProjectResult).mockReturnValueOnce(copyJsTsResult).mockReturnValueOnce(copyConfigResult)
    const renameGitignoreResult = { code: 0 }
    mockShell.mv.mockReturnValueOnce(renameGitignoreResult)
    const removeUnusedResult = { code: 0 }
    mockShell.rm.mockReturnValueOnce(removeUnusedResult)
    mockFilesystem.existsSync.mockReturnValueOnce(true).mockReturnValueOnce(true)

    await init(mockCliArgs)

    expect(mockShell.ls).toHaveBeenCalledTimes(1)
    expect(mockShell.cp).toHaveBeenCalledTimes(2)
    expect(mockShell.mv).toHaveBeenCalledTimes(1)
    expect(mockShell.rm).toHaveBeenCalledTimes(1)
    expect(mockShell.mkdir).toHaveBeenCalledTimes(0)
    expect(mockPrompt).toHaveBeenCalledTimes(0)
    expect(mockListKeyfiles).toHaveBeenCalledTimes(1)
    expect(mockListKeyfiles).toHaveBeenCalledWith()
    expect(mockCreateKeyfile).toHaveBeenCalledTimes(0)
  })
})