import FormData from 'form-data'
import provideAddToIpfs, { AddToIpfs } from "./add.to.ipfs"

describe("addToIpfs", () => {
  let addToIpfs: AddToIpfs
  const mockIpfsHttpClient = {
    post: jest.fn()
  } as any

  beforeAll(() => {
    addToIpfs = provideAddToIpfs(mockIpfsHttpClient)
  })

  it("invokes POST on the ipfs http client and returns ipfs hash", async () => {
    const mockData = "some data"
    const mockHash = "bfjy1234"
    mockIpfsHttpClient.post.mockReturnValueOnce({ data: { Hash: mockHash }})

    const hash = await addToIpfs(mockData)

    expect(hash).toEqual(mockHash)
    expect(mockIpfsHttpClient.post).toHaveBeenCalledTimes(1)
    expect(mockIpfsHttpClient.post.mock.calls[0]).toHaveLength(3)
    const urlPath = mockIpfsHttpClient.post.mock.calls[0][0]
    const formData = mockIpfsHttpClient.post.mock.calls[0][1]
    const extraConfig = mockIpfsHttpClient.post.mock.calls[0][2]
    expect(urlPath).toEqual('/api/v0/add')
    expect(formData).toBeInstanceOf(FormData)
    expect(formData.getBuffer().toString()).toInclude(mockData)
    expect(extraConfig).toStrictEqual({
      headers: formData.getHeaders()
    })
  })
})