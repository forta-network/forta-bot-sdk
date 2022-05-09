import shelljs from 'shelljs'
import { assertExists, assertIsNonEmptyString } from '.'

// returns a list of keyfiles found in the keystore
export type ListKeyfiles = () => string[]

export default function provideListKeyfiles(
  shell: typeof shelljs,
  fortaKeystore: string,
  configFilename: string,
): ListKeyfiles {
  assertExists(shell, 'shell')
  assertIsNonEmptyString(fortaKeystore, 'fortaKeystore')
  assertIsNonEmptyString(configFilename, 'configFilename')
  
  return function listKeyfiles() {
    return shell.ls(fortaKeystore).filter(filename => filename.startsWith("UTC") && filename !== configFilename)
  }
}