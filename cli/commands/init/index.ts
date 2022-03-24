import { join } from 'path'
import fs from 'fs'
import shelljs from 'shelljs'
import prompts from 'prompts'
import { assertExists, assertIsNonEmptyString, assertShellResult } from '../../utils'
import { CommandHandler } from '../..'
import { InitKeystore } from '../../utils/init.keystore'
import { InitConfig } from '../../utils/init.config'
import { InitKeyfile } from '../../utils/init.keyfile'

export default function provideInit(
  shell: typeof shelljs,
  prompt: typeof prompts,
  filesystem: typeof fs,
  contextPath: string,
  initKeystore: InitKeystore,
  initConfig: InitConfig,
  initKeyfile: InitKeyfile,
  args: any
): CommandHandler {
  assertExists(shell, 'shell')
  assertExists(prompt, 'prompt')
  assertExists(filesystem, 'filesystem')
  assertIsNonEmptyString(contextPath, 'contextPath')
  assertExists(initKeystore, 'initKeystore')
  assertExists(initConfig, 'initConfig')
  assertExists(initKeyfile, 'initKeyfile')
  assertExists(args, 'args')

  return async function init(runtimeArgs: any = {}) {
    args = { ...args, ...runtimeArgs }

    // make sure contextPath folder exists
    if (!filesystem.existsSync(contextPath)) {
      const createContextPathResult = shell.mkdir(contextPath)
      assertShellResult(createContextPathResult, `error creating project folder ${contextPath}`)
    }
    shell.cd(contextPath)

    // check if contextPath folder is empty
    const files = shell.ls()
    if (files.length > 0) {
      const { proceed } = await prompt({
        type: 'text',
        name: 'proceed',
        message: `The directory ${contextPath} is not empty and files could be overwritten. Are you sure you want to initialize? (type 'yes' to proceed)`
      })
      if (proceed !== 'yes') {
        console.log('aborting initialization')
        return
      }
    }

    const isTypescript = !!args.typescript
    const isPython = !!args.python
    console.log(`Initializing ${isPython ? "Python" : isTypescript ? "Typescript" : "Javascript"} Forta Agent...`)
    const starterProjectPath = `${join(__dirname, '..', '..', '..', 'starter-project')}`
    // copy files from starter-project to current directory
    const copyProjectResult = shell.cp('-r', [`${starterProjectPath}/*`, `${starterProjectPath}/.*`], '.')
    assertShellResult(copyProjectResult, 'error copying starter-project folder')
    // copy files out from js/ts/py folder
    const copyJsTsPyResult = shell.cp('-r', isPython ? './py/*' : isTypescript ? './ts/*' : './js/*', '.')
    assertShellResult(copyJsTsPyResult, `error unpacking ${isPython ? 'py' : isTypescript ? 'ts' : 'js'} folder`)
    // rename _gitignore to .gitignore
    // (if we just name it .gitignore, npm publish will rename it to .npmignore 🤷🏻‍♂️)
    const renameGitignoreResult = shell.mv('_gitignore', '.gitignore')
    assertShellResult(renameGitignoreResult, 'error renaming gitignore file')
    // remove unused files/folders
    const rmResult = shell.rm('-rf', 'js', 'ts', 'py', '.npmignore')
    assertShellResult(rmResult, 'error cleaning up files')

    // make sure keystore folder exists
    await initKeystore()
    // create global forta.config.json if doesnt already exist
    await initConfig()
    // create keyfile if one doesnt already exist
    await initKeyfile()

    // run npm install in the project folder to initialize dependencies
    console.log('Running npm install...')
    const npmInstallResult = shell.exec(`npm install`)
    assertShellResult(npmInstallResult, `error installing npm dependencies`)
    
    console.log(`You agree that your use is subject to the terms and conditions found at https://forta.org/terms-of-use/`)
  } 
}