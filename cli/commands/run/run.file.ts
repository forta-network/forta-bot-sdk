import { assertExists, GetJsonFile } from '../../utils';
import { GetBotHandlers } from '../../utils/get.agent.handlers';

// runs agent handlers against a specified json file with test data
export type RunFile = (filePath: string) => Promise<void>

export function provideRunFile(
  getBotHandlers: GetBotHandlers,
  getJsonFile: GetJsonFile
): RunFile {
  assertExists(getBotHandlers, 'getBotHandlers')
  assertExists(getJsonFile, 'getJsonFile')

  return async function runFile(filePath: string) {
    const { handleBlock, handleTransaction } = await getBotHandlers()
    if (!handleBlock && !handleTransaction) {
      throw new Error("no block/transaction handler found")
    }
    
    console.log('parsing file data...')
    const { transactionEvents, blockEvents } = getJsonFile(filePath)

    if (handleBlock && blockEvents?.length) {
      console.log('running block events...')
      for (const blockEvent of blockEvents) {
        const findings = await handleBlock(blockEvent)
        console.log(`${findings.length} findings for block ${blockEvent.hash} ${findings}`)
      }
    }

    if (handleTransaction && transactionEvents?.length) {
      console.log('running transaction events...')
      for (const transactionEvent of transactionEvents) {
        const findings = await handleTransaction(transactionEvent)
        console.log(`${findings.length} findings for transaction ${transactionEvent.transaction.hash} ${findings}`)
      }
    }
  }
}