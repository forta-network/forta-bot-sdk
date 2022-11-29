import { AwilixContainer } from 'awilix';
import { providers } from 'ethers';
import { Cache } from 'flat-cache';
import { CommandHandler } from '../..';
import { assertExists } from '../../utils';
import { RunAlert } from './run.alert';
import { RunBlock } from './run.block';
import { RunBlockRange } from './run.block.range';
import { RunFile } from './run.file';
import { RunLive } from './run.live';
import { RunSequence } from './run.sequence';
import { RunTransaction } from './run.transaction';
import { RunProdServer } from './server';

export default function provideRun(
  container: AwilixContainer,
  ethersProvider: providers.JsonRpcProvider,
  chainIds: number[],
  jsonRpcUrl: string,
  isProduction: boolean,
  cache: Cache,
  args: any
): CommandHandler {
  assertExists(container, 'container')
  assertExists(cache, 'cache')
  assertExists(chainIds, 'chainIds')
  assertExists(ethersProvider, "ethersProvider");
  assertExists(args, 'args')

  return async function run(runtimeArgs: any = {}) {
    args = { ...args, ...runtimeArgs }

    // only check network id during local development
    if (!isProduction) {
      const network = await ethersProvider.getNetwork();
      if(!network || !chainIds.includes(network.chainId)) console.warn(`Warning: Detected chainId mismatch between ${jsonRpcUrl} [chainId: ${network.chainId}] and package.json [chainIds: ${chainIds}]. \n`)
    }

    // we manually inject the run functions here (instead of through the provide function above) so that
    // we get RUNTIME errors if certain configuration is missing for that run function e.g. jsonRpcUrl
    if (args.tx) {
      const runTransaction = container.resolve<RunTransaction>("runTransaction")
      await runTransaction(args.tx)
    } else if (args.block) {
      const runBlock = container.resolve<RunBlock>("runBlock")
      await runBlock(args.block)
    } else if (args.alert) {
      const runAlert = container.resolve<RunAlert>("runAlert")
      await runAlert(args.alert)
    } else if (args.sequence) {
      const runSequence = container.resolve<RunSequence>("runSequence")
      await runSequence(args.sequence)
    } else if (args.range) {
      const runBlockRange = container.resolve<RunBlockRange>("runBlockRange")
      await runBlockRange(args.range)
    } else if (args.file) {
      const runFile = container.resolve<RunFile>("runFile")
      await runFile(args.file)
    } else if (args.prod) {
      const runProdServer = container.resolve<RunProdServer>("runProdServer")
      await runProdServer()
    } else {
      const runLive = container.resolve<RunLive>("runLive")
      await runLive()
    }

    if (!("nocache" in args)) {
      // persist any cached blocks/txs/traces to disk
      cache.save(true) // true = dont prune keys not used in this run
    }

    // invoke process.exit() for short-lived functions, otherwise
    // a child process (i.e. python agent process) can prevent commandline from returning
    let isShortLived = args.tx || args.block || args.range || args.file || args.alert || args.sequence
    if (isShortLived) process.exit()
  }
}


