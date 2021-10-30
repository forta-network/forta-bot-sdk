import { CommandHandler } from "../..";
import { assertExists, GetJsonFile } from '../../utils';
import { GetKeyfile } from '../../utils/get.keyfile';

export default function provideKeyfile(
  getKeyfile: GetKeyfile,
  getJsonFile: GetJsonFile,
): CommandHandler {
  assertExists(getKeyfile, 'getKeyfile')
  assertExists(getJsonFile, 'getJsonFile')

  return async function keyfile() {
    const { path } = getKeyfile()
    const { address } = getJsonFile(path)

    console.log(`path: ${path}`)
    console.log(`address: 0x${address}`)
  }
}