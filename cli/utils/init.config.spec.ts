import { join } from "path";
import provideInitConfig, { InitConfig } from "./init.config";

describe("initConfig", () => {
  let initConfig: InitConfig;
  const mockShell = {
    cp: jest.fn(),
  } as any;
  const mockFilesystem = {
    existsSync: jest.fn(),
    writeFileSync: jest.fn()
  } as any;
  const mockFortaKeystore = "/some/keystore/path";
  const mockConfigFilename = "forta.config.json";
  const contextPath = "~/";
  const localConfigFilename = "forta.test.config";

  const resetMocks = () => {
    mockShell.cp.mockReset();
    mockFilesystem.existsSync.mockReset();
    mockFilesystem.writeFileSync.mockReset();
  };

  beforeEach(() => resetMocks());

  beforeAll(() => {
    initConfig = provideInitConfig(
      mockShell,
      mockFilesystem,
      mockFortaKeystore,
      mockConfigFilename,
      contextPath,
      localConfigFilename
    );
  });

  it("throws error if unable to create forta.config.json", async () => {
    mockFilesystem.existsSync.mockReturnValueOnce(false);
    const copyConfigResult = { code: -1, stderr: "some shell error" };
    mockShell.cp.mockReturnValueOnce(copyConfigResult);

    try {
      await initConfig();
    } catch (e) {
      expect(e.message).toEqual(
        `Error creating ${mockConfigFilename}: ${copyConfigResult.stderr}`
      );
    }

    expect(mockFilesystem.existsSync).toHaveBeenCalledTimes(1);
    expect(mockFilesystem.existsSync).toHaveBeenCalledWith(
      join(mockFortaKeystore, mockConfigFilename)
    );
    expect(mockShell.cp).toHaveBeenCalledTimes(1);
    expect(mockShell.cp).toHaveBeenCalledWith(
      join(__dirname, "..", "commands", "init", mockConfigFilename),
      mockFortaKeystore
    );
  });

  it("does nothing if config file already exists", async () => {
    mockFilesystem.existsSync.mockReturnValueOnce(true);
    mockFilesystem.writeFileSync.mockResolvedValue();

    await initConfig();

    expect(mockFilesystem.existsSync).toHaveBeenCalledTimes(1);
    expect(mockFilesystem.existsSync).toHaveBeenCalledWith(
      join(mockFortaKeystore, mockConfigFilename)
    );
    expect(mockShell.cp).toHaveBeenCalledTimes(0);
    expect(mockFilesystem.writeFileSync).toHaveBeenCalledTimes(1);
  });
});
