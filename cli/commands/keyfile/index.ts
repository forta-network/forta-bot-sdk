import fs from 'fs'
import path from 'path'
import { CommandHandler } from "../..";
import { GetJsonFile } from '../../utils';
import { ListKeyfiles } from "../../utils/list.keyfiles";

export default function provideKeyfile(
  listKeyfiles: ListKeyfiles,
  getJsonFile: GetJsonFile,
  filesystem: typeof fs,
  fortaKeystore: string,
  keyfileName?: string
): CommandHandler {

  return async function keyfile() {
    // if a keyfile name is not specified in config
    if (!keyfileName) {
      // assuming only one keyfile in keystore
      [ keyfileName ] = listKeyfiles()
    }

    const keyfilePath = path.join(fortaKeystore, keyfileName)
    if (!filesystem.existsSync(keyfilePath)) {
      throw new Error(`keyfile not found at ${keyfilePath}`)
    }
    const { address } = getJsonFile(keyfilePath)

    console.log(`path: ${keyfilePath}`)
    console.log(`address: 0x${address}`)
  }
}