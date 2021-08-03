import { AxiosStatic } from "axios"
import { assertExists, assertIsNonEmptyString } from "."
import { Trace } from "../../sdk/trace"

export type GetTraceData = (blockNumberOrTxHash: number | string) => Promise<Trace[]>

export function provideGetTraceData(
  traceRpcUrl: string,
  traceBlockMethod: string,
  traceTransactionMethod: string,
  axios: AxiosStatic
): GetTraceData {
  assertIsNonEmptyString(traceBlockMethod, 'traceBlockMethod')
  assertIsNonEmptyString(traceTransactionMethod, 'traceTransactionMethod')
  assertExists(axios, 'axios')

  return async function getTraceData(blockNumberOrTxHash: number | string) {
    if (!traceRpcUrl?.length) return []

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

      return data.result
    } catch (e) {
      console.log(`error getting trace data: ${e.message}`)
    }
    
    return []
  }
}