import prompts from "prompts"
import { assertExists } from "."
import { DecryptKeyfile } from './decrypt.keyfile'
import { GetKeyfile } from './get.keyfile'

// gets agent public and private key after prompting user for password
export type GetCredentials = () => Promise<{ publicKey: string, privateKey: string }>

export default function provideGetCredentials(
  prompt: typeof prompts,
  getKeyfile: GetKeyfile,
  decryptKeyfile: DecryptKeyfile,
): GetCredentials {
  assertExists(prompt, 'prompt')
  assertExists(getKeyfile, 'getKeyfile')
  assertExists(decryptKeyfile, 'decryptKeyfile')

  return async function getCredentials() {
    const { path, name } = getKeyfile()

    const { password } = await prompt({
      type: 'password',
      name: 'password',
      message: `Enter password to decrypt keyfile ${name}`
    })

    return decryptKeyfile(path, password)
  }
}