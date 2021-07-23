import { join } from 'path'
import { AwilixContainer } from 'awilix'
import shelljs from 'shelljs'
import prompts from 'prompts'
import { assertExists, assertShellResult } from '../../utils'
import { CreateNewKeyfile } from '../../utils/create.new.keyfile'

export default function provideInit(
  container: AwilixContainer
) {
  assertExists(container, 'container')

  return async function init(cliArgs: any) {
    
    try {
      // we manually inject dependencies here (instead of through the provide function above) so that
      // we get RUNTIME errors if certain configuration is missing
      const shell = container.resolve<typeof shelljs>("shell")
      const createNewKeyfile = container.resolve<CreateNewKeyfile>("createNewKeyfile")

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

      // initialize keystore
      console.log('creating new keyfile...')
      const { password } = await prompts({
        type: 'password',
        name: 'password',
        message: `Enter password to encrypt new keyfile`
      })
      await createNewKeyfile(password)
    } catch (e) {
      console.error(`ERROR: ${e.message}`)
    }
  } 
}