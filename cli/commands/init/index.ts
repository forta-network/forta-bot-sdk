import fs from 'fs'
import { join } from 'path'
import { AwilixContainer } from 'awilix'
import shelljs from 'shelljs'
import prompts from 'prompts'
import { assertExists, assertShellResult } from '../../utils'
import { CreateKeyfile } from '../../utils/create.keyfile'

export default function provideInit(
  container: AwilixContainer
) {
  assertExists(container, 'container')

  return async function init(cliArgs: any) {
    try {
      // we manually inject dependencies here (instead of through the provide function above) so that
      // we get RUNTIME errors if certain configuration is missing
      const shell = container.resolve<typeof shelljs>("shell")
      const fortaKeystore = container.resolve<string>("fortaKeystore")
      const createKeyfile = container.resolve<CreateKeyfile>("createKeyfile")

      const isTypescript = !!cliArgs.typescript
      console.log(`initializing ${isTypescript ? "Typescript" : "Javascript"} Forta Agent...`)
      const starterProjectPath = `${join(__dirname, '..', '..', '..', 'starter-project')}`
      // copy files from starter-project to current directory
      const copyProjectResult = shell.cp('-r', [`${starterProjectPath}/*`, `${starterProjectPath}/.*`], '.')
      assertShellResult(copyProjectResult, 'error copying starter-project folder')
      // copy files out from js/ts folder
      const copyJsTsResult = shell.cp('-r', isTypescript ? './ts/*' : './js/*', '.')
      assertShellResult(copyJsTsResult, `error unpacking ${isTypescript ? 'ts' : 'js'} folder`)
      // remove unused files/folders
      const rmResult = shell.rm('-rf', 'js', 'ts', 'node_modules', '.git')
      assertShellResult(rmResult, 'error cleaning up files')

      // create keyfile if one doesnt already exist
      const keyfiles = shell.ls(fortaKeystore)
      if (!keyfiles.length) {
        console.log('creating new keyfile...')
        const { password } = await prompts({
          type: 'password',
          name: 'password',
          message: `Enter password to encrypt new keyfile`
        })
        await createKeyfile(password)
      } else {
        console.log(`found existing keyfile ${keyfiles[0]} in ${fortaKeystore}`)
      }
    } catch (e) {
      console.error(`ERROR: ${e.message}`)
    }
  } 
}