import { Wallet } from "ethers"
import { CommandHandler } from "../.."
import { assertExists, assertIsNonEmptyString } from "../../utils"
import { AppendToFile } from "../../utils/append.to.file"
import BotRegistry from "../../contracts/agent.registry"
import { GetCredentials } from "../../utils/get.credentials"

export default function provideEnable(
  appendToFile: AppendToFile,
  getCredentials: GetCredentials,
  botRegistry: BotRegistry,
  botId: string
): CommandHandler {
  assertExists(appendToFile, 'appendToFile')
  assertExists(getCredentials, 'getCredentials')
  assertExists(botRegistry, 'botRegistry')
  assertIsNonEmptyString(botId, 'botId')

  return async function enable() {
    const agentExists = await botRegistry.agentExists(botId)
    if (!agentExists) {
      throw new Error(`bot id ${botId} does not exist`)
    }

    const isAgentEnabled = await botRegistry.isEnabled(botId)
    if (isAgentEnabled) {
      console.log(`bot id ${botId} is already enabled`)
      return
    }

    const { privateKey } = await getCredentials()

    console.log('enabling bot...')
    const fromWallet = new Wallet(privateKey)
    await botRegistry.enableAgent(fromWallet, botId)

    const logMessage = `successfully enabled bot id ${botId}`
    console.log(logMessage)
    appendToFile(`${new Date().toUTCString()}: ${logMessage}`, 'publish.log')
  }
}