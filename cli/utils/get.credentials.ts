import fs from 'fs'
import path from 'path'
import prompts from "prompts"
import { assertExists, assertIsNonEmptyString } from "."
import { GetKeyfile } from './get.keyfile'
import { ListKeyfiles } from './list.keyfiles'

// gets agent public and private key after prompting user for password
export type GetCredentials = () => Promise<{ publicKey: string, privateKey: string }>

export default function provideGetCredentials(
  prompt: typeof prompts,
  filesystem: typeof fs,
  listKeyfiles: ListKeyfiles,
  getKeyfile: GetKeyfile,
  fortaKeystore: string,
  keyfileName?: string
): GetCredentials {
  assertExists(prompt, 'prompt')
  assertExists(filesystem, 'filesystem')
  assertExists(listKeyfiles, 'listKeyfiles')
  assertExists(getKeyfile, 'getKeyfile')
  assertIsNonEmptyString(fortaKeystore, 'fortaKeystore')

  return async function getCredentials() {
      if (!filesystem.existsSync(fortaKeystore)) {
        throw new Error(`keystore folder ${fortaKeystore} not found`)
      }

      const keyfiles = listKeyfiles()
      // if a keyfile name is not specified in config
      if (!keyfileName) {
        // assume only one keyfile in keystore
        keyfileName = keyfiles[0]
      } else {
        // find the keyfile using the address in the specified filename (can't use filename directly since it may contain path separators)
        const keyfileAddress = keyfileName.substr(keyfileName.lastIndexOf('--')+2)
        keyfileName = keyfiles.find(keyfile => keyfile.endsWith(keyfileAddress))!
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