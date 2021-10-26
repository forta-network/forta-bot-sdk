import { CommandHandler } from '../..'
import { assertExists } from '../../utils'
import { UploadImage } from '../publish/upload.image'

export default function providePush(
  uploadImage: UploadImage,
): CommandHandler {
  assertExists(uploadImage, 'uploadImage')

  return async function push(cliArgs: any) {
    const imageReference = await uploadImage()
    console.log(`successfully pushed image with reference ${imageReference}`)
  } 
}