import fs from 'fs'
import shelljs from 'shelljs'
import { assertExists } from '.'
var keythereum = require("keythereum");

// creates a new keyfile in keystore folder (which is created if needed) encrypted using password
export type CreateNewKeyfile = (password: string) => Promise<{ publicKey: string, privateKey: string}>

export function provideCreateNewKeyfile(
  shell: typeof shelljs,
  fortaKeystore: string
): CreateNewKeyfile {
  assertExists(shell, 'shell')
  assertExists(fortaKeystore, 'fortaKeystore')

  return async function createNewKeyfile(password: string) {
    if (!fs.existsSync(fortaKeystore)) {
      shell.mkdir(fortaKeystore)
    }

    const key = keythereum.create()
    const keyObject = keythereum.dump(password, key.privateKey, key.salt, key.iv)
    keythereum.exportToFile(keyObject, fortaKeystore)

    const publicKey = `0x${keyObject.address}`
    const privateKey = `0x${key.privateKey.toString('hex')}`
    console.log(`created key ${publicKey} in ${fortaKeystore} folder`)

    return {
      publicKey,
      privateKey
    }
  }
}