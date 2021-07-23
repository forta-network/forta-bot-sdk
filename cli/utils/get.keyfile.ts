import fs from 'fs'
import path from 'path'
import { assertExists } from '.';
var keythereum = require("keythereum");

// decrypts keyfile specified by keyfileName from keystore using password
export type GetKeyfile = (keyfileName: string, password: string) => Promise<{ publicKey: string, privateKey: string}>

export function provideGetKeyfile(
  fortaKeystore: string
): GetKeyfile {
  assertExists(fortaKeystore, 'fortaKeystore')

  return async function getKeyfile(keyfileName: string, password: string) {
    const keyFilePath = path.join(fortaKeystore, keyfileName)
    const keyObject = JSON.parse(fs.readFileSync(keyFilePath).toString())

    return {
      publicKey: `0x${keyObject.address}`,
      privateKey: `0x${keythereum.recover(password, keyObject).toString('hex')}`
    }
  }
}