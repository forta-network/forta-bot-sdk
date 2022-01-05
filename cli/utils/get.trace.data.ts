import { AxiosStatic } from "axios"
import { Cache } from "flat-cache"
import { assertExists, assertIsNonEmptyString } from "."
import { Trace } from "../../sdk/trace"

export type GetTraceData = (blockNumberOrTxHash: number | string) => Promise<Trace[]>

export function provideGetTraceData(
  traceRpcUrl: string,
  traceBlockMethod: string,
  traceTransactionMethod: string,
  axios: AxiosStatic,
  cache: Cache
): GetTraceData {
  assertIsNonEmptyString(traceBlockMethod, 'traceBlockMethod')
  assertIsNonEmptyString(traceTransactionMethod, 'traceTransactionMethod')
  assertExists(axios, 'axios')
  assertExists(cache, 'cache')

  return async function getTraceData(blockNumberOrTxHash: number | string) {
    if (!traceRpcUrl?.length) return []

    // check cache first
    const cacheKey = getCacheKey(blockNumberOrTxHash)
    const cachedTraceData = cache.getKey(cacheKey)
    if (cachedTraceData) return cachedTraceData

    // fetch trace data
    const isBlockNumber = typeof blockNumberOrTxHash === 'number'
    try {
      const { data } = await axios.post(traceRpcUrl, {
        method: isBlockNumber ? traceBlockMethod : traceTransactionMethod,
        params: isBlockNumber ? [`0x${blockNumberOrTxHash.toString(16)}`] : [blockNumberOrTxHash],
        jsonrpc: "2.0",
        id: Date.now(),
      }, {
        headers: {
          "Content-Type": "application/json",
      }});

      if (data.error) throw new Error(data.error.message)
      // if block/tx has not yet been detected by tracing node, result can be null
      if (!data.result) throw new Error(`unknown ${isBlockNumber ? 'block' : 'transaction'} ${blockNumberOrTxHash}`)

      cache.setKey(cacheKey, data.result)
      return data.result
    } catch (e) {
      console.log(`error getting trace data: ${e.message}`)
    }
    
    return []
  }
}

export const getCacheKey = (blockNumberOrTxHash: number | string) => `${blockNumberOrTxHash.toString().toLowerCase()}-trace`