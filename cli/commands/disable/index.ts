import Web3 from "web3"
import { CommandHandler } from "../.."
import { assertExists, assertIsNonEmptyString } from "../../utils"
import { AppendToFile } from "../../utils/append.to.file"
import { GetCredentials } from "../../utils/get.credentials"
import AgentRegistry from "../../contracts/agent.registry"

export default function provideDisable(
  web3AgentRegistry: Web3,
  appendToFile: AppendToFile,
  getCredentials: GetCredentials,
  agentRegistry: AgentRegistry,
  agentId: string
): CommandHandler {
  assertExists(web3AgentRegistry, 'web3AgentRegistry')
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

    const { publicKey, privateKey } = await getCredentials()
    //make sure web3 knows about this wallet in order to sign the transaction
    web3AgentRegistry.eth.accounts.wallet.add(privateKey);

    console.log('disabling agent...')
    await agentRegistry.disableAgent(publicKey, agentId)

    const logMessage = `successfully disabled agent id ${agentId}`
    console.log(logMessage)
    appendToFile(`${new Date().toUTCString()}: ${logMessage}`, 'publish.log')
  }
}