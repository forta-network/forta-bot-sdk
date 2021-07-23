import fs from 'fs'
import path from 'path'
import { HandleBlock, HandleTransaction } from "../../sdk"
import { assertExists } from "."
import { FortaConfig } from '..'

// imports agent handlers from project
export type GetAgentHandlers = () => Promise<{ transactionHandlers: HandleTransaction[], blockHandlers: HandleBlock[] }>

export function provideGetAgentHandlers(
  isProduction: boolean,
  fortaConfig: FortaConfig
): GetAgentHandlers {
  assertExists(isProduction, 'isProduction')
  assertExists(fortaConfig, 'fortaConfig')
  const handlersFromConfig = fortaConfig.handlers

  return async function getAgentHandlers() {
    const transactionHandlers: HandleTransaction[] = []
    const blockHandlers: HandleBlock[] = []
  
    try {
      // look in current working directory by default
      const rootHandlerPath = process.cwd()
      // use handler paths from config if specified
      const handlerPaths = handlersFromConfig?.length ? handlersFromConfig : [rootHandlerPath]
      for (let handlerPath of handlerPaths) {
        if (handlerPath.startsWith(`.${path.sep}`)) {
          handlerPath = handlerPath.replace(`.${path.sep}`, `${rootHandlerPath}${path.sep}`)
        }
        const handlers = await import(handlerPath)
        const { handleTransaction, handleBlock } = handlers.default
        if (handleTransaction) transactionHandlers.push(handleTransaction)
        if (handleBlock) blockHandlers.push(handleBlock)
      }
    } catch (e) {
      throw new Error(`issue getting agent handlers: ${e.message}`)
    }
    
    return { transactionHandlers, blockHandlers}
  }
}
