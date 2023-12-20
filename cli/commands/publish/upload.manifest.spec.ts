import {ethers, Wallet} from "ethers";
import {keccak256} from "../../utils";
import provideUploadManifest, {
  DocumentationSetting,
  UploadManifest,
} from "./upload.manifest";

describe("uploadManifest", () => {
  let uploadManifest: UploadManifest;
  const mockSystemTime = new Date();
  const mockFilesystem = {
    existsSync: jest.fn(),
    readFileSync: jest.fn(),
    statSync: jest.fn(),
  } as any;
  const mockAddToIpfs = jest.fn();
  const mockAgentName = "agent name";
  const mockAgentDisplayName = "agent display name";
  const mockDescription = "some description";
  const mockLongDescription = "some long description";
  const mockAgentId = "0xagentId";
  const mockVersion = "0.1";
  const mockReadmeFilePath = "README.md";
  const mockDocumentationSettings: DocumentationSetting[] = [
    {title: 'General', filePath: 'General.md'},
    {title: 'API Guide', filePath: 'API.md'},
  ];
  const mockRepository = "github.com/myrepository";
  const mockLicenseUrl = "github.com/myrepository";
  const mockPromoUrl = "github.com/myrepository";
  const mockImageRef = "123abc";
  const mockPrivateKey = "0xabcd";
  const mockCliVersion = "0.2";
  const mockChainIds = [1, 1337];
  const mockExternal = false;
  const mockChainSettings = {
    default: {
      shards: 1,
      target: 1,
    },
    1: {
      shards: "5",
      target: "10",
    },
    "137": {
      shards: "2",
      targets: 3,
    },
  } as any;
  const formattedMockChainSettings = {
    default: {
      shards: 1,
      target: 1,
    },
    "1": {
      shards: 5,
      target: 10,
    },
    "137": {
      shards: 2,
      targets: 3,
    },
  };

  const resetMocks = () => {
    mockFilesystem.existsSync.mockReset();
    mockFilesystem.statSync.mockReset();
    mockFilesystem.readFileSync.mockReset();
    mockAddToIpfs.mockReset();
  };

  const setupUploadManifest = (props?: { documentationSettings?: DocumentationSetting[] }) => {
    uploadManifest = provideUploadManifest(
      mockFilesystem,
      mockAddToIpfs,
      mockAgentName,
      mockAgentDisplayName,
      mockDescription,
      mockLongDescription,
      mockAgentId,
      mockVersion,
      mockReadmeFilePath,
      props?.documentationSettings,
      mockRepository,
      mockLicenseUrl,
      mockPromoUrl,
      mockCliVersion,
      mockChainIds,
      mockExternal,
      mockChainSettings
    );
  }

  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(mockSystemTime);
    resetMocks();
  });

  afterEach(() => {
    jest.useRealTimers();
  })

  it("throws error if readme file not found and documentation settings undefined", async () => {
    mockFilesystem.existsSync.mockReturnValueOnce(false);

    try {
      setupUploadManifest();
      await uploadManifest(mockImageRef, mockPrivateKey);
    } catch (e) {
      expect(e.message).toBe(
        `documentation file ${mockReadmeFilePath} not found`
      );
    }

    expect(mockFilesystem.existsSync).toHaveBeenCalledTimes(1);
    expect(mockFilesystem.existsSync).toHaveBeenCalledWith(mockReadmeFilePath);
  });

  it("throws error if readme file is empty and documentation settings undefined", async () => {
    mockFilesystem.existsSync.mockReturnValueOnce(true);
    mockFilesystem.statSync.mockReturnValueOnce({size: 0});

    try {
      setupUploadManifest();
      await uploadManifest(mockImageRef, mockPrivateKey);
    } catch (e) {
      expect(e.message).toBe(
        `documentation file ${mockReadmeFilePath} cannot be empty`
      );
    }

    expect(mockFilesystem.existsSync).toHaveBeenCalledTimes(1);
    expect(mockFilesystem.existsSync).toHaveBeenCalledWith(mockReadmeFilePath);
    expect(mockFilesystem.statSync).toHaveBeenCalledTimes(1);
    expect(mockFilesystem.statSync).toHaveBeenCalledWith(mockReadmeFilePath);
  });

  it("throws error if one of documentation files not found", async () => {
    const missingFile = 'API.md';

    mockFilesystem.existsSync.mockImplementation((fileName: string) => fileName !== missingFile);
    mockFilesystem.statSync.mockImplementation((fileName: string) => {
      if (fileName === missingFile) throw new Error(`Cannot find ${fileName}`);
      return {size: 1};
    });

    try {
      setupUploadManifest({documentationSettings: mockDocumentationSettings});
      await uploadManifest(mockImageRef, mockPrivateKey);
    } catch (e) {
      expect(e.message).toBe(
        `documentation file ${missingFile} not found`
      );
    }

    expect(mockFilesystem.existsSync).toHaveBeenCalledTimes(2);
    expect(mockFilesystem.statSync).toHaveBeenCalledTimes(1);
  });

  it('throws error if documentation settings defined with empty array', async () => {
    try {
      setupUploadManifest({documentationSettings: []});
      await uploadManifest(mockImageRef, mockPrivateKey);
    } catch (e) {
      expect(e.message).toBe(
        `documentationSettings must be non-empty array`
      );
    }

    expect(mockFilesystem.existsSync).toHaveBeenCalledTimes(0);
    expect(mockFilesystem.statSync).toHaveBeenCalledTimes(0);
  })

  it("throws error if one of documentation files is empty", async () => {
    const emptyFile = 'API.md';

    mockFilesystem.existsSync.mockReturnValue(true);
    mockFilesystem.statSync.mockImplementation((fileName: string) => {
      if (fileName === emptyFile) return {size: 0};
      return {size: 1};
    });

    try {
      setupUploadManifest({documentationSettings: mockDocumentationSettings});
      await uploadManifest(mockImageRef, mockPrivateKey);
    } catch (e) {
      expect(e.message).toBe(
        `documentation file ${emptyFile} cannot be empty`
      );
    }

    expect(mockFilesystem.existsSync).toHaveBeenCalledTimes(2);
    expect(mockFilesystem.statSync).toHaveBeenCalledTimes(2);
  });

  it("throws error if one of documentation settings has empty title", async () => {
    mockFilesystem.existsSync.mockReturnValue(true);
    mockFilesystem.statSync.mockReturnValue({size: 1});

    try {
      setupUploadManifest({
        documentationSettings: [{
          title: '  ',
          filePath: 'FILE.md'
        }]
      });
      await uploadManifest(mockImageRef, mockPrivateKey);
    } catch (e) {
      expect(e.message).toBe(
        `title in documentationSettings must be non-empty string`
      );
    }

    expect(mockFilesystem.existsSync).toHaveBeenCalledTimes(0);
    expect(mockFilesystem.statSync).toHaveBeenCalledTimes(0);
  });

  it("uploads signed manifest to ipfs and returns ipfs reference", async () => {
    setupUploadManifest();

    mockFilesystem.existsSync.mockReturnValueOnce(true);
    mockFilesystem.statSync.mockReturnValueOnce({size: 1});

    const mockDocumentationFile = JSON.stringify({some: "documentation"});
    mockFilesystem.readFileSync.mockReturnValueOnce(mockDocumentationFile);

    const mockDocumentationRef = "docRef";
    mockAddToIpfs.mockReturnValueOnce(mockDocumentationRef);

    const mockManifest = {
      from: new Wallet(mockPrivateKey).address,
      name: mockAgentDisplayName,
      description: mockDescription,
      longDescription: mockLongDescription,
      agentId: mockAgentName,
      agentIdHash: mockAgentId,
      version: mockVersion,
      timestamp: mockSystemTime.toUTCString(),
      imageReference: mockImageRef,
      documentation: JSON.stringify([{
        title: 'README',
        ipfsUrl: mockDocumentationRef
      }]),
      repository: mockRepository,
      licenseUrl: mockLicenseUrl,
      promoUrl: mockPromoUrl,
      chainIds: mockChainIds,
      publishedFrom: `Forta CLI ${mockCliVersion}`,
      external: mockExternal,
      chainSettings: formattedMockChainSettings,
    };
    const mockManifestRef = "manifestRef";
    mockAddToIpfs.mockReturnValueOnce(mockManifestRef);

    const manifestRef = await uploadManifest(mockImageRef, mockPrivateKey);

    expect(manifestRef).toBe(mockManifestRef);
    expect(mockFilesystem.existsSync).toHaveBeenCalledTimes(1);
    expect(mockFilesystem.existsSync).toHaveBeenCalledWith(mockReadmeFilePath);
    expect(mockFilesystem.statSync).toHaveBeenCalledTimes(1);
    expect(mockFilesystem.statSync).toHaveBeenCalledWith(mockReadmeFilePath);
    expect(mockFilesystem.readFileSync).toHaveBeenCalledTimes(1);
    expect(mockFilesystem.readFileSync).toHaveBeenCalledWith(
      mockReadmeFilePath,
      "utf8"
    );
    expect(mockAddToIpfs).toHaveBeenCalledTimes(2);
    expect(mockAddToIpfs).toHaveBeenNthCalledWith(1, mockDocumentationFile);
    const signingKey = new ethers.utils.SigningKey(mockPrivateKey);
    const signature = ethers.utils.joinSignature(
      signingKey.signDigest(keccak256(JSON.stringify(mockManifest)))
    );
    expect(mockAddToIpfs).toHaveBeenNthCalledWith(
      2,
      JSON.stringify({manifest: mockManifest, signature})
    );
  });

  it("uploads documentation settings correctly", async () => {
    setupUploadManifest({ documentationSettings: mockDocumentationSettings });

    // mocking file existence and content
    mockFilesystem.existsSync.mockReturnValue(true);
    mockFilesystem.statSync.mockReturnValue({ size: 1 });
    mockFilesystem.readFileSync.mockImplementation((fileName: string) => {
      if (fileName === 'General.md') return 'General Content';
      if (fileName === 'API.md') return 'API Content';
    });

    // mocking IPFS addition
    const mockGeneralDocRef = "generalDocRef";
    const mockApiDocRef = "apiDocRef";
    mockAddToIpfs.mockImplementation((content: string) => {
      if (content === 'General Content') return mockGeneralDocRef;
      if (content === 'API Content') return mockApiDocRef;
    });

    const manifestRef = await uploadManifest(mockImageRef, mockPrivateKey);

    // asserting that files were read correctly
    expect(mockFilesystem.existsSync).toHaveBeenCalledTimes(2);
    expect(mockFilesystem.readFileSync).toHaveBeenCalledWith('General.md', 'utf8');
    expect(mockFilesystem.readFileSync).toHaveBeenCalledWith('API.md', 'utf8');

    // asserting that files were added to IPFS correctly
    expect(mockAddToIpfs).toHaveBeenCalledTimes(3); // 2 docs + 1 manifest
    expect(mockAddToIpfs).toHaveBeenCalledWith('General Content');
    expect(mockAddToIpfs).toHaveBeenCalledWith('API Content');

    // asserting manifest structure
    const expectedDocumentation = JSON.stringify([
      { title: 'General', ipfsUrl: mockGeneralDocRef },
      { title: 'API Guide', ipfsUrl: mockApiDocRef },
    ]);
    expect(JSON.parse(mockAddToIpfs.mock.calls[2][0]).manifest.documentation).toEqual(expectedDocumentation);
  });
});
