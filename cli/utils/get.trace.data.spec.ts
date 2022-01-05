import { GetTraceData, provideGetTraceData, getCacheKey } from "./get.trace.data"

describe("getTraceData", () => {
  let getTraceData: GetTraceData
  const mockTraceRpcUrl = "http://some.infura.api/tracing"
  const mockTraceBlockMethod = "trace_block"
  const mockTraceTransactionMethod = "trace_tx"
  const mockAxios = {
    post: jest.fn()
  } as any
  const mockCache = {
    getKey: jest.fn(),
    setKey: jest.fn()
  } as any
  const mockBlockNumber = 55
  const mockTxHash = "0x123"

  const resetMocks = () => {
    mockAxios.post.mockReset()
    mockCache.getKey.mockReset()
    mockCache.setKey.mockReset()
  }

  beforeEach(() => resetMocks())

  beforeAll(() => {
    getTraceData = provideGetTraceData(
      mockTraceRpcUrl, mockTraceBlockMethod, mockTraceTransactionMethod, mockAxios, mockCache
    )
  })

  it("returns empty array if no traceRpcUrl provided", async () => {
    const getTraceData = provideGetTraceData("", mockTraceBlockMethod, mockTraceTransactionMethod, mockAxios, mockCache)

    const traces = await getTraceData(mockBlockNumber)

    expect(traces).toBeArrayOfSize(0)
    expect(mockAxios.post).toHaveBeenCalledTimes(0 )
  })

  it("returns empty array if error fetching trace data", async () => {
    mockAxios.post.mockRejectedValueOnce(new Error())

    const traces = await getTraceData(mockBlockNumber)

    expect(traces).toBeArrayOfSize(0)
    expect(mockAxios.post).toHaveBeenCalledTimes(1)
  })

  it("returns cached trace data if it exists", async () => {
    const mockTraces = ['some block trace data']
    mockCache.getKey.mockReturnValueOnce(mockTraces)

    const traces = await getTraceData(mockBlockNumber)

    expect(traces).toEqual(mockTraces)
    expect(mockCache.getKey).toHaveBeenCalledTimes(1)
    expect(mockCache.getKey).toHaveBeenCalledWith(getCacheKey(mockBlockNumber))
    expect(mockAxios.post).toHaveBeenCalledTimes(0)
    expect(mockCache.setKey).toHaveBeenCalledTimes(0)
  })

  it("returns block trace data when requesting block number", async () => {
    const systemTime = new Date()
    jest.useFakeTimers('modern').setSystemTime(systemTime)
    const mockTraces = ['some block trace data']
    mockAxios.post.mockReturnValueOnce({ data: { result: mockTraces }})

    const traces = await getTraceData(mockBlockNumber)

    expect(traces).toEqual(mockTraces)
    expect(mockCache.getKey).toHaveBeenCalledTimes(1)
    expect(mockCache.getKey).toHaveBeenCalledWith(getCacheKey(mockBlockNumber))
    expect(mockAxios.post).toHaveBeenCalledTimes(1)
    expect(mockAxios.post).toHaveBeenCalledWith(mockTraceRpcUrl, {
      method: mockTraceBlockMethod,
      params: [`0x${mockBlockNumber.toString(16)}`],
      jsonrpc: "2.0",
      id: systemTime.getTime(),
    }, {
      headers: {
        "Content-Type": "application/json",
    }})
    expect(mockCache.setKey).toHaveBeenCalledTimes(1)
    expect(mockCache.setKey).toHaveBeenCalledWith(getCacheKey(mockBlockNumber), mockTraces)
    jest.useRealTimers()
  })

  it("returns transaction trace data when requesting transaction hash", async () => {
    const systemTime = new Date()
    jest.useFakeTimers('modern').setSystemTime(systemTime)
    const mockTraces = ['some transaction trace data']
    mockAxios.post.mockReturnValueOnce({ data: { result: mockTraces }})

    const traces = await getTraceData(mockTxHash)

    expect(traces).toEqual(mockTraces)
    expect(mockCache.getKey).toHaveBeenCalledTimes(1)
    expect(mockCache.getKey).toHaveBeenCalledWith(getCacheKey(mockTxHash))
    expect(mockAxios.post).toHaveBeenCalledTimes(1)
    expect(mockAxios.post).toHaveBeenCalledWith(mockTraceRpcUrl, {
      method: mockTraceTransactionMethod,
      params: [mockTxHash],
      jsonrpc: "2.0",
      id: systemTime.getTime(),
    }, {
      headers: {
        "Content-Type": "application/json",
    }})
    expect(mockCache.setKey).toHaveBeenCalledTimes(1)
    expect(mockCache.setKey).toHaveBeenCalledWith(getCacheKey(mockTxHash), mockTraces)
    jest.useRealTimers()
  })
})