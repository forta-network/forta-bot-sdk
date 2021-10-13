
import { CommandHandler } from '../..'
import { assertExists } from '../../utils'
import { GetCredentials } from '../../utils/get.credentials'
import { UploadImage } from './upload.image'
import { UploadManifest } from './upload.manifest'
import { PushToRegistry } from './push.to.registry'

export default function providePublish(
  getCredentials: GetCredentials,
  uploadImage: UploadImage,
  uploadManifest: UploadManifest,
  pushToRegistry: PushToRegistry
): CommandHandler {
  assertExists(getCredentials, 'getCredentials')
  assertExists(uploadImage, 'uploadImage')
  assertExists(uploadManifest, 'uploadManifest')
  assertExists(pushToRegistry, 'pushToRegistry')

  return async function publish(cliArgs: any) {
    const imageReference = await uploadImage()
    const { publicKey, privateKey } = await getCredentials()
    const manifestReference = await uploadManifest(imageReference, publicKey, privateKey)
    await pushToRegistry(manifestReference, publicKey, privateKey)
    // invoke process.exit() otherwise a web3 websocket connection can prevent the process from completing
    process.exit()
  } 
}