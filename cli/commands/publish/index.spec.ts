import { Wallet } from "ethers";
import providePublish from ".";
import { CommandHandler } from "../..";

describe("publish", () => {
  let publish: CommandHandler;
  const mockGetCredentials = jest.fn();
  const mockUploadImage = jest.fn();
  const mockUploadManifest = jest.fn();
  const mockPushToRegistry = jest.fn();
  const mockPrivateKey = "0x4567";
  const mockImageRef = "abc123";
  const mockManifestRef = "def456";
  let mockExternal = false;

  beforeEach(() => {
    mockUploadImage.mockReset();
    mockGetCredentials.mockReset();
    mockUploadManifest.mockReset();
    mockPushToRegistry.mockReset();

    mockGetCredentials.mockReturnValueOnce({ privateKey: mockPrivateKey });
    mockUploadImage.mockReturnValueOnce(mockImageRef);
    mockUploadManifest.mockReturnValueOnce(mockManifestRef);
  });

  beforeAll(() => {
    publish = providePublish(
      mockGetCredentials,
      mockUploadImage,
      mockUploadManifest,
      mockPushToRegistry,
      mockExternal
    );
  });

  it("publishes the image and manifest correctly", async () => {
    await publish();

    expect(mockUploadImage).toHaveBeenCalledTimes(1);
    expect(mockUploadImage).toHaveBeenCalledWith();
    expect(mockUploadImage).toHaveBeenCalledBefore(mockGetCredentials);
    expect(mockGetCredentials).toHaveBeenCalledTimes(1);
    expect(mockGetCredentials).toHaveBeenCalledWith();
    expect(mockGetCredentials).toHaveBeenCalledBefore(mockUploadManifest);
    expect(mockUploadManifest).toHaveBeenCalledTimes(1);
    expect(mockUploadManifest).toHaveBeenCalledWith(
      mockImageRef,
      mockPrivateKey
    );
    expect(mockUploadManifest).toHaveBeenCalledBefore(mockPushToRegistry);
    expect(mockPushToRegistry).toHaveBeenCalledTimes(1);
    const [manifestRef, fromWallet] = mockPushToRegistry.mock.calls[0];
    expect(manifestRef).toEqual(mockManifestRef);
    expect(fromWallet).toBeInstanceOf(Wallet);
    expect(fromWallet.address).toEqual(new Wallet(mockPrivateKey).address);
  });

  it("does not publish an image for external bots", async () => {
    mockExternal = true;
    publish = providePublish(
      mockGetCredentials,
      mockUploadImage,
      mockUploadManifest,
      mockPushToRegistry,
      mockExternal
    );

    await publish();

    expect(mockUploadImage).toHaveBeenCalledTimes(0);
    expect(mockGetCredentials).toHaveBeenCalledTimes(1);
    expect(mockGetCredentials).toHaveBeenCalledWith();
    expect(mockGetCredentials).toHaveBeenCalledBefore(mockUploadManifest);
    expect(mockUploadManifest).toHaveBeenCalledTimes(1);
    expect(mockUploadManifest).toHaveBeenCalledWith(undefined, mockPrivateKey);
    expect(mockUploadManifest).toHaveBeenCalledBefore(mockPushToRegistry);
    expect(mockPushToRegistry).toHaveBeenCalledTimes(1);
    const [manifestRef, fromWallet] = mockPushToRegistry.mock.calls[0];
    expect(manifestRef).toEqual(mockManifestRef);
    expect(fromWallet).toBeInstanceOf(Wallet);
    expect(fromWallet.address).toEqual(new Wallet(mockPrivateKey).address);
  });
});
