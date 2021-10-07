import { join } from "path"
import fs from 'fs'
import { FortaConfig } from "../../sdk"
import { assertExists, assertIsNonEmptyString, GetJsonFile } from "."

export type GetFortaConfig = () => FortaConfig

export default function provideGetFortaConfig(
  commandName: string,
  filesystem: typeof fs,
  isProduction: boolean,
  configFilename: string,
  localConfigFilename: string,
  fortaKeystore: string,
  getJsonFile: GetJsonFile
): GetFortaConfig {
  assertIsNonEmptyString(commandName, 'commandName')
  assertExists(filesystem, 'filesystem')
  assertIsNonEmptyString(configFilename, 'configFilename')
  assertIsNonEmptyString(localConfigFilename, 'localConfigFilename')
  assertIsNonEmptyString(fortaKeystore, 'fortaKeystore')
  assertExists(getJsonFile, 'getJsonFile')

  return function getFortaConfig() {
    let config = {}
    // config file will not exist when running "init" or when running in production
    if (commandName === "init" || isProduction) return config
    
    // try to read from global config file
    const globalConfigPath = join(fortaKeystore, configFilename)
    if (filesystem.existsSync(globalConfigPath)) {
      try {
        config = Object.assign(config, getJsonFile(globalConfigPath))
      } catch (e) {
        throw new Error(`unable to parse config file ${configFilename}: ${e.message}`)
      }
    }
  
    // try to read from local (project-specific) config file
    const localConfigPath = join(process.cwd(), localConfigFilename)
    if (filesystem.existsSync(localConfigPath)) {
      try {
        config = Object.assign(config, getJsonFile(localConfigPath))
      } catch (e) {
        throw new Error(`unable to parse project config file ${localConfigFilename}: ${e.message}`)
      }
    }
  
    return config
  }
}