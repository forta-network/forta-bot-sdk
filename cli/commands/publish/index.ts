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
    const { privateKey } = await getCredentials()
    const manifestReference = await uploadManifest(imageReference, privateKey)
    await pushToRegistry(manifestReference, privateKey)
  } 
}