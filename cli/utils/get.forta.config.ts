import { join } from "path"
import fs from 'fs'
import {assign} from "comment-json";
import { FortaConfig } from "../../sdk"
import { assertExists, assertIsNonEmptyString, GetJsonFile } from "."

export type GetFortaConfig = () => FortaConfig

export default function provideGetFortaConfig(
  filesystem: typeof fs,
  isProduction: boolean,
  configFilename: string,
  localConfigFilename: string,
  fortaKeystore: string,
  getJsonFile: GetJsonFile,
  contextPath: string
): GetFortaConfig {
  assertExists(filesystem, 'filesystem')
  assertIsNonEmptyString(configFilename, 'configFilename')
  assertIsNonEmptyString(localConfigFilename, 'localConfigFilename')
  assertIsNonEmptyString(fortaKeystore, 'fortaKeystore')
  assertExists(getJsonFile, 'getJsonFile')
  assertIsNonEmptyString(contextPath, 'contextPath')

  return function getFortaConfig() {
    let config = {}
    const globalConfigPath = join(fortaKeystore, configFilename)
    const globalConfigExists = filesystem.existsSync(globalConfigPath)
    const localConfigPath = join(contextPath, localConfigFilename)
    const localConfigExists = filesystem.existsSync(localConfigPath)
    const noConfigExists = !globalConfigExists && !localConfigExists

    // config file will not exist when running "init" or when running in production
    if (noConfigExists || isProduction) return config
    
    // try to read from global config file
    if (globalConfigExists) {
      try {
        config = assign(config, getJsonFile(globalConfigPath, false))
      } catch (e) {
        throw new Error(`unable to parse config file ${configFilename}: ${e.message}`)
      }
    }
  
    // try to read from local (project-specific) config file
    if (localConfigExists) {
      try {
        config = assign(config, getJsonFile(localConfigPath, false))
      } catch (e) {
        throw new Error(`unable to parse project config file ${localConfigFilename}: ${e.message}`)
      }
    }
  
    return config
  }
}