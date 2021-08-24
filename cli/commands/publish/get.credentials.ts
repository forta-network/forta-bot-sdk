import fs from "fs"
import shelljs from "shelljs"
import prompts from "prompts"
import { assertExists, assertIsNonEmptyString } from "../../utils"
import { GetKeyfile } from '../../utils/get.keyfile'

// gets agent public and private key
export type GetCredentials = () => Promise<{ publicKey: string, privateKey: string }>

export default function provideGetCredentials(
  shell: typeof shelljs,
  prompt: typeof prompts,
  filesystem: typeof fs,
  getKeyfile: GetKeyfile,
  fortaKeystore: string
): GetCredentials {
  assertExists(shell, 'shell')
  assertExists(prompt, 'prompt')
  assertExists(filesystem, 'filesystem')
  assertExists(getKeyfile, 'getKeyfile')
  assertIsNonEmptyString(fortaKeystore, 'fortaKeystore')

  return async function getCredentials() {
      if (!filesystem.existsSync(fortaKeystore)) {
        throw new Error(`keystore folder ${fortaKeystore} not found`)
      }

      console.log('found Forta keystore...')
      const [ keyfileName ] = shell.ls(fortaKeystore)// assuming only one file in keystore
      const { password } = await prompt({
        type: 'password',
        name: 'password',
        message: `Enter password to decrypt keyfile ${keyfileName}`
      })
      return getKeyfile(keyfileName, password)
  }
}