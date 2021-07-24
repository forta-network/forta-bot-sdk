import fs from 'fs'
import shelljs from 'shelljs'
import { assertExists, assertShellResult } from '.'
var keythereum = require("keythereum");

// creates a keyfile in keystore folder (which is created if needed) encrypted using password
export type CreateKeyfile = (password: string) => Promise<{ publicKey: string, privateKey: string}>

export function provideCreateKeyfile(
  shell: typeof shelljs,
  fortaKeystore: string
): CreateKeyfile {
  assertExists(shell, 'shell')
  assertExists(fortaKeystore, 'fortaKeystore')

  return async function createKeyfile(password: string) {
    if (!fs.existsSync(fortaKeystore)) {
      const mkdirResult = shell.mkdir(fortaKeystore)
      assertShellResult(mkdirResult, 'error creating keystore folder')
    }

    const key = keythereum.create()
    const keyObject = keythereum.dump(password, key.privateKey, key.salt, key.iv)
    keythereum.exportToFile(keyObject, fortaKeystore)

    const publicKey = `0x${keyObject.address}`
    const privateKey = `0x${key.privateKey.toString('hex')}`
    console.log(`created key ${publicKey} in ${fortaKeystore}`)

    return {
      publicKey,
      privateKey
    }
  }
}