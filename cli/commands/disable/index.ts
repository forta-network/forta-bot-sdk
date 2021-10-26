import { Wallet } from "ethers"
import { CommandHandler } from "../.."
import { assertExists, assertIsNonEmptyString } from "../../utils"
import { AppendToFile } from "../../utils/append.to.file"
import { GetCredentials } from "../../utils/get.credentials"
import AgentRegistry from "../../contracts/agent.registry"

export default function provideDisable(
  appendToFile: AppendToFile,
  getCredentials: GetCredentials,
  agentRegistry: AgentRegistry,
  agentId: string
): CommandHandler {
  assertExists(appendToFile, 'appendToFile')
  assertExists(getCredentials, 'getCredentials')
  assertExists(agentRegistry, 'agentRegistry')
  assertIsNonEmptyString(agentId, 'agentId')

  return async function disable(cliArgs: any) {
    const agentExists = await agentRegistry.agentExists(agentId)
    if (!agentExists) {
      throw new Error(`agent id ${agentId} does not exist`)
    }

    const isAgentEnabled = await agentRegistry.isEnabled(agentId)
    if (!isAgentEnabled) {
      console.log(`agent id ${agentId} is already disabled`)
      return
    }

    const { privateKey } = await getCredentials()

    console.log('disabling agent...')
    const fromWallet = new Wallet(privateKey)
    await agentRegistry.disableAgent(fromWallet, agentId)

    const logMessage = `successfully disabled agent id ${agentId}`
    console.log(logMessage)
    appendToFile(`${new Date().toUTCString()}: ${logMessage}`, 'publish.log')
  }
}