import { join } from 'path'
import fs from 'fs'
import shelljs from 'shelljs'
import prompts from 'prompts'
import { assertExists, assertIsNonEmptyString, assertShellResult } from '../../utils'
import { CreateKeyfile } from '../../utils/create.keyfile'
import { CommandHandler } from '../..'
import { ListKeyfiles } from '../../utils/list.keyfiles'

export default function provideInit(
  shell: typeof shelljs,
  prompt: typeof prompts,
  filesystem: typeof fs,
  fortaKeystore: string,
  configFilename: string,
  listKeyfiles: ListKeyfiles,
  createKeyfile: CreateKeyfile,
  contextPath: string,
  args: any
): CommandHandler {
  assertExists(shell, 'shell')
  assertExists(prompt, 'prompt')
  assertExists(filesystem, 'filesystem')
  assertIsNonEmptyString(fortaKeystore, 'fortaKeystore')
  assertIsNonEmptyString(configFilename, 'configFilename')
  assertExists(listKeyfiles, 'listKeyfiles')
  assertExists(createKeyfile, 'createKeyfile')
  assertIsNonEmptyString(contextPath, 'contextPath')
  assertExists(args, 'args')

  return async function init(runtimeArgs: any = {}) {
    args = { ...args, ...runtimeArgs }

    // make sure contextPath folder exists
    if (!filesystem.existsSync(contextPath)) {
      const createContextPathResult = shell.mkdir(contextPath)
      assertShellResult(createContextPathResult, `error creating project folder ${contextPath}`)
    }
    shell.cd(contextPath)

    // check if directory is empty
    const files = shell.ls()
    if (files.length > 0) {
      const { proceed } = await prompt({
        type: 'text',
        name: 'proceed',
        message: `The current directory is not empty and files could be overwritten. Are you sure you want to initialize? (type 'yes' to proceed)`
      })
      if (proceed !== 'yes') {
        console.log('aborting initialization')
        return
      }
    }

    const isTypescript = !!args.typescript
    const isPython = !!args.python
    console.log(`initializing ${isPython ? "Python" : isTypescript ? "Typescript" : "Javascript"} Forta Agent...`)
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
    if (!filesystem.existsSync(fortaKeystore)) {
      const createKeystoreResult = shell.mkdir(fortaKeystore)
      assertShellResult(createKeystoreResult, `error creating keystore folder ${fortaKeystore}`)
    }
    
    // create global forta.config.json if doesnt already exist
    if (!filesystem.existsSync(join(fortaKeystore, configFilename))) {
      console.log(`creating ${configFilename}...`)
      const copyConfigResult = shell.cp(join(__dirname, configFilename), fortaKeystore)
      assertShellResult(copyConfigResult, `error creating ${configFilename}`)
    } else {
      console.log(`found existing ${configFilename} in ${fortaKeystore}`)
    }

    // create keyfile if one doesnt already exist
    const keyfiles = listKeyfiles()
    if (!keyfiles.length) {
      console.log('creating new keyfile...')
      const { password } = await prompt({
        type: 'password',
        name: 'password',
        message: `Enter password to encrypt new keyfile`
      })
      await createKeyfile(password)
    } else {
      console.log(`found existing keyfile ${keyfiles[0]} in ${fortaKeystore}`)
    }

    // run npm install in the project folder to initialize dependencies
    console.log('running npm install...')
    const npmInstallResult = shell.exec(`npm install`)
    assertShellResult(npmInstallResult, `error installing npm dependencies`)

    if (isTypescript) {
      console.log(`compiling Typescript...`)
      const compileTsResult = shell.exec(`npm run build`)
      assertShellResult(compileTsResult, `error compiling Typescript`)
    }
  } 
}