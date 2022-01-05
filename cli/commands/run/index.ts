import { AwilixContainer } from 'awilix';
import { Cache } from 'flat-cache';
import { CommandHandler } from '../..';
import { assertExists } from '../../utils';
import { RunBlock } from './run.block';
import { RunBlockRange } from './run.block.range';
import { RunFile } from './run.file';
import { RunLive } from './run.live';
import { RunTransaction } from './run.transaction';
import { RunProdServer } from './server';

export default function provideRun(
  container: AwilixContainer,
  cache: Cache
): CommandHandler {
  assertExists(container, 'container')
  assertExists(cache, 'cache')

  return async function run(cliArgs: any) {
    // we manually inject the run functions here (instead of through the provide function above) so that
    // we get RUNTIME errors if certain configuration is missing for that run function e.g. jsonRpcUrl
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

    // persist any cached blocks/txs/traces to disk
    cache.save(true) // true = dont prune keys not used in this run

    // invoke process.exit() for short-lived functions, otherwise
    // a child process (i.e. python agent process) can prevent commandline from returning
    let isShortLived = cliArgs.tx || cliArgs.block || cliArgs.range || cliArgs.file
    if (isShortLived) process.exit()
  }
}


