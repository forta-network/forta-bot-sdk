import Web3 from "web3";
import { BlockTransactionString } from "web3-eth"
import { assertExists } from ".";
import { BlockEvent, EventType, HandleBlock } from "../../sdk";

export type RunBlockHandlers = (blockHandlers: HandleBlock[], blockHashOrNumber: string | number) => Promise<BlockTransactionString>

export function provideRunBlockHandlers(
  web3: Web3,
): RunBlockHandlers {
  assertExists(web3, 'web3')

  return async function runBlockHandlers(blockHandlers: HandleBlock[], blockHashOrNumber: string | number) {
    console.log(`fetching block ${blockHashOrNumber}...`)
    // TODO consider using returnTransactionObjects parameter of getBlock
    const block = await web3.eth.getBlock(blockHashOrNumber)

    if (blockHandlers.length) {
      const networkId = await web3.eth.net.getId()
      const blockEvent = new BlockEvent(EventType.BLOCK, networkId, block.hash, block.number);
      const findings = []
      for (const handleBlock of blockHandlers) {
        findings.push(...await handleBlock(blockEvent))
      }
      console.log(`${findings.length} findings for block ${block.hash}: ${findings}`)
    }

    return block
  }
}



