import provideInitKeystore, { InitKeystore } from "./init.keystore";

describe("initKeystore", () => {
  let initKeystore: InitKeystore;
  const mockShell = {
    mkdir: jest.fn(),
  } as any;
  const mockFilesystem = {
    existsSync: jest.fn(),
  } as any;
  const mockFortaKeystore = "/some/keystore/path";

  const resetMocks = () => {
    mockShell.mkdir.mockReset();
    mockFilesystem.existsSync.mockReset();
  };

  beforeEach(() => resetMocks());

  beforeAll(() => {
    initKeystore = provideInitKeystore(
      mockShell,
      mockFilesystem,
      mockFortaKeystore
    );
  });

  it("throws error if unable to create keystore folder", async () => {
    mockFilesystem.existsSync.mockReturnValueOnce(false);
    const createKeystoreResult = { code: -1, stderr: "some shell error" };
    mockShell.mkdir.mockReturnValueOnce(createKeystoreResult);

    try {
      await initKeystore();
    } catch (e) {
      expect(e.message).toEqual(
        `Error creating keystore folder ${mockFortaKeystore}: ${createKeystoreResult.stderr}`
      );
    }
    expect(mockFilesystem.existsSync).toHaveBeenCalledTimes(1);
    expect(mockFilesystem.existsSync).toHaveBeenCalledWith(mockFortaKeystore);
    expect(mockShell.mkdir).toHaveBeenCalledTimes(1);
    expect(mockShell.mkdir).toHaveBeenCalledWith(mockFortaKeystore);
  });

  it("does nothing if keystore already exists", async () => {
    mockFilesystem.existsSync.mockReturnValueOnce(true);

    await initKeystore();

    expect(mockShell.mkdir).toHaveBeenCalledTimes(0);
  });
});
