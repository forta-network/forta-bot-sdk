import { AwilixContainer } from 'awilix';
import { providers } from 'ethers';
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
  ethersProvider: providers.JsonRpcProvider,
  chainIds: number[],
  jsonRpcUrl: string,
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

    const network = await ethersProvider.getNetwork();

    if(!network) throw Error(`No network detected at rpc url: ${jsonRpcUrl}`);

    if(!chainIds.includes(network.chainId)) throw Error(`Detected chainId mismatch between ${jsonRpcUrl} [chainId: ${network.chainId}] and package.json [chainIds: ${chainIds}].`)

    // we manually inject the run functions here (instead of through the provide function above) so that
    // we get RUNTIME errors if certain configuration is missing for that run function e.g. jsonRpcUrl
    if (args.tx) {
      const runTransaction = container.resolve<RunTransaction>("runTransaction")
      await runTransaction(args.tx)
    } else if (args.block) {
      const runBlock = container.resolve<RunBlock>("runBlock")
      await runBlock(args.block)
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
    let isShortLived = args.tx || args.block || args.range || args.file
    if (isShortLived) process.exit()
  }
}


