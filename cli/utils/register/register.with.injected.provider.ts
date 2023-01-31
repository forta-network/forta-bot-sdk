import configureContainer from "../../di.container";
import { ethers, providers, Signer } from "ethers"
import { assertExists } from "..";
import { asFunction, asValue } from "awilix"
import { GetFromIpfs } from "../ipfs/get.from.ipfs";
import { PushToRegistry } from "../../commands/publish/push.to.registry";

export async function registerWithCustomEthersProvider(
  provider: providers.JsonRpcProvider,
  signer: Signer,
  manifestReference: string
) {
  const diContainer = configureContainer();
  diContainer.register('ethersAgentRegistryProvider', asValue(provider))
  diContainer.register('appendToFile', asValue(() => {})) // no-op
  
  const getFromIpfs = diContainer.resolve<GetFromIpfs>('getFromIpfs')
  const manifest = await getFromIpfs(manifestReference)

  diContainer.register('agentId', asValue(manifest.manifest.agentId))
  diContainer.register('chainIds', asValue(manifest.manifest.chainIds))

  const pushToRegistry = diContainer.resolve<PushToRegistry>('pushToRegistry')
  await pushToRegistry(manifestReference, signer)
}
