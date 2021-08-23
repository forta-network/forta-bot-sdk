import { join } from 'path'
import shelljs from 'shelljs'
import prompts from 'prompts'
import { assertExists, assertIsNonEmptyString, assertShellResult } from '../../utils'
import { CreateKeyfile } from '../../utils/create.keyfile'

export default function provideInit(
  shell: typeof shelljs,
  prompt: typeof prompts,
  fortaKeystore: string,
  createKeyfile: CreateKeyfile
) {
  assertExists(shell, 'shell')
  assertExists(prompt, 'prompt')
  assertIsNonEmptyString(fortaKeystore, 'fortaKeystore')
  assertExists(createKeyfile, 'createKeyfile')

  return async function init(cliArgs: any) {
    // check if current directory is empty
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

    const isTypescript = !!cliArgs.typescript
    console.log(`initializing ${isTypescript ? "Typescript" : "Javascript"} Forta Agent...`)
    const starterProjectPath = `${join(__dirname, '..', '..', '..', 'starter-project')}`
    // copy files from starter-project to current directory
    const copyProjectResult = shell.cp('-r', [`${starterProjectPath}/*`, `${starterProjectPath}/.*`], '.')
    assertShellResult(copyProjectResult, 'error copying starter-project folder')
    // copy files out from js/ts folder
    const copyJsTsResult = shell.cp('-r', isTypescript ? './ts/*' : './js/*', '.')
    assertShellResult(copyJsTsResult, `error unpacking ${isTypescript ? 'ts' : 'js'} folder`)
    // rename _gitignore to .gitignore
    // (if we just name it .gitignore, npm publish will rename it to .npmignore 🤷🏻‍♂️)
    const renameGitignoreResult = shell.mv('_gitignore', '.gitignore')
    assertShellResult(renameGitignoreResult, 'error renaming gitignore file')
    // remove unused files/folders
    const rmResult = shell.rm('-rf', 'js', 'ts', '.npmignore')
    assertShellResult(rmResult, 'error cleaning up files')

    // create keyfile if one doesnt already exist
    const keyfiles = shell.ls(fortaKeystore)
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
  } 
}