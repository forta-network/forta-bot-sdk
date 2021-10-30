import fs from 'fs'
var keythereum = require("keythereum");

// decrypts keyfile specified by keyfilePath using password
export type DecryptKeyfile = (keyfilePath: string, password: string) => { publicKey: string, privateKey: string}

export function provideDecryptKeyfile(): DecryptKeyfile {

  return function decryptKeyfile(keyfilePath: string, password: string) {
    const keyObject = JSON.parse(fs.readFileSync(keyfilePath).toString())
    return {
      publicKey: `0x${keyObject.address}`,
      privateKey: `0x${keythereum.recover(password, keyObject).toString('hex')}`
    }
  }
}