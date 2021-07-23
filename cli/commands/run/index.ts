import { AwilixContainer } from 'awilix';
import { assertExists } from '../../utils';
import { RunBlock } from './run.block';
import { RunBlockRange } from './run.block.range';
import { RunFile } from './run.file';
import { RunLive } from './run.live';
import { RunTransaction } from './run.transaction';
import { RunProdServer } from './server';

export default function provideRun(
  container: AwilixContainer
) {
  assertExists(container, 'container')
  // we manually inject the run functions here (instead of through the provide function above) so that
  // we get RUNTIME errors if certain configuration is missing for that run function e.g. jsonRpcUrl

  return async function run(cliArgs: any) {
    // invoke process.exit() for short-lived functions, otherwise a web3 websocket connection
    // can prevent the process from completing
    let isShortLived = cliArgs.tx || cliArgs.block || cliArgs.range || cliArgs.file

    try {
      if (cliArgs.tx) {
        const runTransaction = container.resolve<RunTransaction>("runTransaction")
        await runTransaction(cliArgs.tx)
      } else if (cliArgs.block) {
        const runBlock = container.resolve<RunBlock>("runBlock")
        await runBlock(cliArgs.block)
      } else if (cliArgs.range) {
        const runBlockRange = container.resolve<RunBlockRange>("runBlockRange")
        await runBlockRange(cliArgs.range)
      } else if (cliArgs.file) {
        const runFile = container.resolve<RunFile>("runFile")
        await runFile(cliArgs.file)
      } else if (cliArgs.prod) {
        const runProdServer = container.resolve<RunProdServer>("runProdServer")
        await runProdServer()
      } else {
        const runLive = container.resolve<RunLive>("runLive")
        await runLive()
      }
    } catch (e) {
      console.error(`ERROR: ${e.message}`)
      process.exit()
    }

    if (isShortLived) process.exit()
  }
}


