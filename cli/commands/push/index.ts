import { CommandHandler } from '../..'
import { assertExists } from '../../utils'
import { AppendToFile } from '../../utils/append.to.file'
import { UploadImage } from '../publish/upload.image'

export default function providePush(
  uploadImage: UploadImage,
  appendToFile: AppendToFile,
  args: any
): CommandHandler {
  assertExists(uploadImage, 'uploadImage')
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
  } 
}
