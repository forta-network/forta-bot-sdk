import { assertExists, GetJsonFile } from '../../utils';
import { GetAgentHandlers } from '../../utils/get.agent.handlers';

// runs agent handlers against a specified json file with test data
export type RunFile = (filePath: string) => Promise<void>

export function provideRunFile(
  getAgentHandlers: GetAgentHandlers,
  getJsonFile: GetJsonFile
): RunFile {
  assertExists(getAgentHandlers, 'getAgentHandlers')
  assertExists(getJsonFile, 'getJsonFile')

  return async function runFile(filePath: string) {
    const { blockHandlers, transactionHandlers } = await getAgentHandlers()
    if (!blockHandlers.length && !transactionHandlers.length) {
      throw new Error("no block/transaction handlers found")
    }
    
    console.log('parsing file data...')
    const { transactionEvents, blockEvents } = getJsonFile(filePath)

    if (blockHandlers.length && blockEvents?.length) {
      console.log('running block events...')
      for (const blockEvent of blockEvents) {
        const findings = []
        for (const handleBlock of blockHandlers) {
          findings.push(...await handleBlock(blockEvent))
        }
        console.log(`${findings.length} findings for block ${blockEvent.hash}: ${JSON.stringify(findings)}`)
      }
    }

    if (transactionHandlers.length && transactionEvents?.length) {
      console.log('running transaction events...')
      for (const transactionEvent of transactionEvents) {
        const findings = [];
        for (const handleTransaction of transactionHandlers) {
          findings.push(...await handleTransaction(transactionEvent))
        }
        console.log(`${findings.length} findings for transaction ${transactionEvent.transaction.hash}: ${JSON.stringify(findings)}`)
      }
    }
  }
}