import provideInitKeyfile, { InitKeyfile } from "./init.keyfile";

describe("initKeyfile", () => {
  let initKeyfile: InitKeyfile;
  const mockPrompt = jest.fn() as any;
  const mockFortaKeystore = "/some/keystore/path";
  const mockListKeyfiles = jest.fn();
  const mockCreateKeyfile = jest.fn();

  const resetMocks = () => {
    mockPrompt.mockReset();
    mockListKeyfiles.mockReset();
    mockCreateKeyfile.mockReset();
  };

  beforeEach(() => resetMocks());

  beforeAll(() => {
    initKeyfile = provideInitKeyfile(
      mockPrompt,
      mockFortaKeystore,
      mockListKeyfiles,
      mockCreateKeyfile
    );
  });

  it("prompts user for password to encrypt new keyfile if one does not exist", async () => {
    mockListKeyfiles.mockReturnValueOnce([]);
    const password = "some password";
    mockPrompt.mockReturnValueOnce({ password });

    await initKeyfile();

    expect(mockPrompt).toHaveBeenCalledTimes(1);
    expect(mockPrompt).toHaveBeenLastCalledWith({
      type: "password",
      name: "password",
      message: `Enter password to encrypt new keyfile`,
    });
    expect(mockListKeyfiles).toHaveBeenCalledTimes(1);
    expect(mockListKeyfiles).toHaveBeenCalledWith();
    expect(mockCreateKeyfile).toHaveBeenCalledTimes(1);
    expect(mockCreateKeyfile).toHaveBeenCalledWith(password);
  });

  it("does nothing if keyfile already exists", async () => {
    mockListKeyfiles.mockReturnValueOnce(["existingKeyfile"]);

    await initKeyfile();

    expect(mockPrompt).toHaveBeenCalledTimes(0);
    expect(mockListKeyfiles).toHaveBeenCalledTimes(1);
    expect(mockListKeyfiles).toHaveBeenCalledWith();
    expect(mockCreateKeyfile).toHaveBeenCalledTimes(0);
  });
});
