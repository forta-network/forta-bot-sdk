import { CommandHandler } from '../..'
import { assertExists } from '../../utils'
import { AppendToFile } from '../../utils/append.to.file'
import { UploadManifest } from '../publish/upload.manifest'
import { GetCredentials } from '../../utils/get.credentials'
import { UploadImage } from '../publish/upload.image'

export default function providePush(
  getCredentials: GetCredentials,
  uploadImage: UploadImage,
  uploadManifest: UploadManifest,
  appendToFile: AppendToFile,
  args: any
): CommandHandler {
  assertExists(getCredentials, 'getCredentials')
  assertExists(uploadImage, 'uploadImage')
  assertExists(uploadManifest, 'uploadManifest')
  assertExists(appendToFile, 'appendToFile')
  assertExists(args, 'args')

  return async function push() {
    const imageReference = await uploadImage()

    const logMessage = `successfully pushed image with reference ${imageReference}`
    console.log(logMessage)
    appendToFile(`${new Date().toUTCString()}: ${logMessage}`, 'publish.log')

    if (!args.manifest) {
      return;
    }

    const { privateKey } = await getCredentials()
    const manifestReference = await uploadManifest(imageReference, privateKey)
    console.log(manifestReference)
    appendToFile(`${new Date().toUTCString()}: successfully uploaded manifest with reference ${manifestReference}`, 'publish.log')
  } 
}
