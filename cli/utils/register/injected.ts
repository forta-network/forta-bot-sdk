import configureContainer from "../../di.container";
import { Signer } from "ethers"
import { asValue } from "awilix"
import { GetFromIpfs } from "../ipfs/get.from.ipfs";
import { PushToRegistry } from "../../commands/publish/push.to.registry";

export async function registerWithInjectedSigner(
  signer: Signer,
  manifestReference: string
) {
  const diContainer = configureContainer();
  diContainer.register('ethersAgentRegistryProvider', asValue(signer.provider))
  diContainer.register('appendToFile', asValue(() => {})) // no-op
  
  const getFromIpfs = diContainer.resolve<GetFromIpfs>('getFromIpfs')
  const manifest = await getFromIpfs(manifestReference)

  diContainer.register('agentId', asValue(manifest.manifest.agentIdHash))
  diContainer.register('chainIds', asValue(manifest.manifest.chainIds))

  console.log(diContainer.resolve('agentId'))

  const pushToRegistry = diContainer.resolve<PushToRegistry>('pushToRegistry')
  await pushToRegistry(manifestReference, signer)
}
