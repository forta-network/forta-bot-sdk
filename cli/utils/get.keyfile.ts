import fs from 'fs'
var keythereum = require("keythereum");

// decrypts keyfile specified by keyfilePath using password
export type GetKeyfile = (keyfilePath: string, password: string) => Promise<{ publicKey: string, privateKey: string}>

export function provideGetKeyfile(): GetKeyfile {

  return async function getKeyfile(keyfilePath: string, password: string) {
    const keyObject = JSON.parse(fs.readFileSync(keyfilePath).toString())
    return {
      publicKey: `0x${keyObject.address}`,
      privateKey: `0x${keythereum.recover(password, keyObject).toString('hex')}`
    }
  }
}