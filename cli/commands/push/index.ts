import { CommandHandler } from '../..'
import { assertExists } from '../../utils'
import { AppendToFile } from '../../utils/append.to.file'
import { UploadImage } from '../publish/upload.image'

export default function providePush(
  uploadImage: UploadImage,
  appendToFile: AppendToFile
): CommandHandler {
  assertExists(uploadImage, 'uploadImage')
  assertExists(appendToFile, 'appendToFile')

  return async function push(cliArgs: any) {
    const imageReference = await uploadImage()

    const logMessage = `successfully pushed image with reference ${imageReference}`
    console.log(logMessage)
    appendToFile(`${new Date().toUTCString()}: ${logMessage}`, 'publish.log')
  } 
}