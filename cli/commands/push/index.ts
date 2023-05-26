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

    let logMessage = `${new Date().toUTCString()}: successfully pushed image with reference ${imageReference}`
    if (args.refOnly) {
      logMessage = imageReference
    }
    console.log(logMessage)
    appendToFile(logMessage, 'publish.log')

    if (!args.manifest) {
      return;
    }

    const { privateKey } = await getCredentials()
    const manifestReference = await uploadManifest(imageReference, privateKey)

    logMessage = `${new Date().toUTCString()}: successfully uploaded manifest with reference ${manifestReference}`
    console.log(logMessage)
    appendToFile(logMessage, 'publish.log')
  } 
}
