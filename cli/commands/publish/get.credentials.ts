import fs from 'fs'
import path from 'path'
import shelljs from "shelljs"
import prompts from "prompts"
import { assertExists, assertIsNonEmptyString } from "../../utils"
import { GetKeyfile } from '../../utils/get.keyfile'

// gets agent public and private key after prompting user for password
export type GetCredentials = () => Promise<{ publicKey: string, privateKey: string }>

export default function provideGetCredentials(
  shell: typeof shelljs,
  prompt: typeof prompts,
  filesystem: typeof fs,
  getKeyfile: GetKeyfile,
  fortaKeystore: string,
  keyfileName?: string
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

      // if a keyfile name is not specified in config
      if (!keyfileName) {
        // assuming only one file in keystore
        [ keyfileName ] = shell.ls(fortaKeystore)
      }

      const keyfilePath = path.join(fortaKeystore, keyfileName)
      if (!filesystem.existsSync(keyfilePath)) {
        throw new Error(`keyfile not found at ${keyfilePath}`)
      }

      const { password } = await prompt({
        type: 'password',
        name: 'password',
        message: `Enter password to decrypt keyfile ${keyfileName}`
      })
      return getKeyfile(keyfilePath, password)
  }
}