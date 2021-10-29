import { Wallet } from "ethers"
import { CommandHandler } from "../.."
import { assertExists, assertIsNonEmptyString } from "../../utils"
import { AppendToFile } from "../../utils/append.to.file"
import AgentRegistry from "../../contracts/agent.registry"
import { GetCredentials } from "../../utils/get.credentials"

export default function provideEnable(
  appendToFile: AppendToFile,
  getCredentials: GetCredentials,
  agentRegistry: AgentRegistry,
  agentId: string
): CommandHandler {
  assertExists(appendToFile, 'appendToFile')
  assertExists(getCredentials, 'getCredentials')
  assertExists(agentRegistry, 'agentRegistry')
  assertIsNonEmptyString(agentId, 'agentId')

  return async function enable(cliArgs: any) {
    const agentExists = await agentRegistry.agentExists(agentId)
    if (!agentExists) {
      throw new Error(`agent id ${agentId} does not exist`)
    }

    const isAgentEnabled = await agentRegistry.isEnabled(agentId)
    if (isAgentEnabled) {
      console.log(`agent id ${agentId} is already enabled`)
      return
    }

    const { privateKey } = await getCredentials()

    console.log('enabling agent...')
    const fromWallet = new Wallet(privateKey)
    await agentRegistry.enableAgent(fromWallet, agentId)

    const logMessage = `successfully enabled agent id ${agentId}`
    console.log(logMessage)
    appendToFile(`${new Date().toUTCString()}: ${logMessage}`, 'publish.log')
  }
}