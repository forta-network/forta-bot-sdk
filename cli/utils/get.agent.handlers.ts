import { HandleBlock, HandleTransaction, Initialize } from "../../sdk"
import { assertExists, assertIsNonEmptyString } from "."
import { GetPythonBotHandlers } from './get.python.agent.handlers'

type BotHandlers = { 
  initialize?: Initialize,
  handleTransaction?: HandleTransaction,
  handleBlock?: HandleBlock
}

// imports bot handlers from project
export type GetBotHandlers = () => Promise<BotHandlers>

export function provideGetBotHandlers(
  botPath: string,
  getPythonBotHandlers: GetPythonBotHandlers,
  dynamicImport: (path: string) => Promise<any>
): GetBotHandlers {
  assertIsNonEmptyString(botPath, 'botPath')
  assertExists(getPythonBotHandlers, 'getPythonBotHandlers')
  assertExists(dynamicImport, 'dynamicImport')

  let botHandlers: BotHandlers

  return async function getBotHandlers() {
    // only get the bot handlers once
    if (botHandlers) {
      return botHandlers
    }

    try {
      if (botPath.endsWith(".py")) {
        botHandlers = await getPythonBotHandlers(botPath)
      } else {
        botHandlers = (await dynamicImport(botPath)).default
      }
    } catch (e) {
      throw new Error(`issue getting bot handlers: ${e.message}`)
    }
    
    if (botHandlers.initialize) {
      try {
        console.log('initializing bot...')
        await botHandlers.initialize()
      } catch (e) {
        throw new Error(`error initializing bot: ${e.message}`)
      }
    }

    return botHandlers
  }
}
