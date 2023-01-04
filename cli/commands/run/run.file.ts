import { assertExists, GetJsonFile } from '../../utils';
import { GetAgentHandlers } from '../../utils/get.agent.handlers';
import { RunHandlersOnAlert } from '../../utils/run.handlers.on.alert';
import { RunHandlersOnBlock } from '../../utils/run.handlers.on.block';
import { RunHandlersOnTransaction } from '../../utils/run.handlers.on.transaction';
import { RunSequence } from './run.sequence';

// runs agent handlers against a specified json file with test data
export type RunFile = (filePath: string) => Promise<void>

export function provideRunFile(
  getAgentHandlers: GetAgentHandlers,
  getJsonFile: GetJsonFile,
  runHandlersOnBlock: RunHandlersOnBlock,
  runHandlersOnTransaction: RunHandlersOnTransaction,
  runHandlersOnAlert: RunHandlersOnAlert,
  runSequence: RunSequence
): RunFile {
  assertExists(getAgentHandlers, 'getAgentHandlers')
  assertExists(getJsonFile, 'getJsonFile')
  assertExists(runHandlersOnBlock, 'runHandlersOnBlock')
  assertExists(runHandlersOnTransaction, 'runHandlersOnTransaction')
  assertExists(runHandlersOnAlert, 'runHandlersOnAlert')
  assertExists(runSequence, 'runSequence')

  return async function runFile(filePath: string) {
    const { handleBlock, handleTransaction, handleAlert } = await getAgentHandlers()
    if (!handleBlock && !handleTransaction && !handleAlert) {
      throw new Error("no block/transaction/alert handler found")
    }
    
    console.log('parsing file data...')
    const { transactionEvents, blockEvents, alertEvents, sequenceEvents } = getJsonFile(filePath)

    if (handleBlock && blockEvents?.length) {
      console.log('running block events...')
      for (const blockEvent of blockEvents) {
        if (typeof blockEvent === 'string' || typeof blockEvent === 'number') {
          await runHandlersOnBlock(blockEvent)
        } else {
          const findings = await handleBlock(blockEvent)
          console.log(`${findings.length} findings for block ${blockEvent.hash} ${findings}`)
        }
      }
    }

    if (handleTransaction && transactionEvents?.length) {
      console.log('running transaction events...')
      for (const transactionEvent of transactionEvents) {
        if (typeof transactionEvent === 'string') {
          await runHandlersOnTransaction(transactionEvent)
        } else {
          const findings = await handleTransaction(transactionEvent)
          console.log(`${findings.length} findings for transaction ${transactionEvent.transaction.hash} ${findings}`)
        }
      }
    }

    if (handleAlert && alertEvents?.length) {
      console.log('running alert events...')
      for (const alertEvent of alertEvents) {
        if (typeof alertEvent === 'string') {
          await runHandlersOnAlert(alertEvent)
        } else {
          const findings = await handleAlert(alertEvent)
          console.log(`${findings.length} findings for alert ${alertEvent.alert.hash} ${findings}`)
        }
      }
    }

    if (sequenceEvents?.length) {
      for (const sequence of sequenceEvents) {
        await runSequence(sequence)
      }
    }
  }
}