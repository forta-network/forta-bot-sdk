import { AwilixContainer } from 'awilix'
import shelljs from 'shelljs'
import fs from 'fs'
import prompts from 'prompts'
import { assertExists, assertIsNonEmptyString, assertShellResult, keccak256 } from '../../utils'
import Web3 from 'web3'
import AgentRegistry from './agent.registry'
import { GetKeyfile } from '../../utils/get.keyfile'
import { FortaConfig } from '../../../sdk'
import { AddToIpfs } from '../../utils/add.to.ipfs'

export default function providePublish(
  container: AwilixContainer
) {
  assertExists(container, 'container')

  return async function publish(cliArgs: any) {
    try {
      // we manually inject dependencies here (instead of through the provide function above) so that
      // we get RUNTIME errors if certain configuration is missing
      const shell = container.resolve<typeof shelljs>("shell")
      const web3 = container.resolve<Web3>("web3AgentRegistry")
      const addToIpfs = container.resolve<AddToIpfs>("addToIpfs")
      const imageRepositoryUrl = container.resolve<string>("imageRepositoryUrl")
      const imageRepositoryUsername = container.resolve<string>("imageRepositoryUsername")
      const imageRepositoryPassword = container.resolve<string>("imageRepositoryPassword")
      const fortaKeystore = container.resolve<string>("fortaKeystore")
      const documentation = container.resolve<string>("documentation")
      const agentRegistry = container.resolve<AgentRegistry>("agentRegistry")
      const getKeyfile = container.resolve<GetKeyfile>("getKeyfile")
      const { agentId, version } = container.resolve<FortaConfig>("fortaConfig")
      assertIsNonEmptyString(agentId!, 'agentId')
  
      // authenticate against repository if credentials provided
      if (imageRepositoryUsername && imageRepositoryPassword) {
        const loginResult = shell.exec(`docker login ${imageRepositoryUrl} -u ${imageRepositoryUsername} -p ${imageRepositoryPassword}`)
        assertShellResult(loginResult, 'error authenticating with image repository')
      }

      // build the agent image
      console.log('building agent image...')
      const containerTag = `${agentId}-intermediate`
      const buildResult = shell.exec(`docker build --tag ${containerTag} .`)
      assertShellResult(buildResult, 'error building agent image')
  
      // push agent image to repository
      console.log('pushing agent image to repository...')
      const tagResult = shell.exec(`docker tag ${containerTag} ${imageRepositoryUrl}/${containerTag}`)
      assertShellResult(tagResult, 'error tagging agent image')
      const pushResult = shell.exec(`docker push ${imageRepositoryUrl}/${containerTag}`)
      assertShellResult(pushResult, 'error pushing agent image')
  
      // extract image sha256 digest from pushResult
      const digestLine = pushResult.grep('sha256').toString()
      const digestStartIndex = digestLine.indexOf('sha256:')+7
      const imageDigest = digestLine.substring(digestStartIndex, digestStartIndex+64)
  
      // pull all tagged images for digest to get ipfs CID
      const pullResult = shell.exec(`docker pull -a ${imageRepositoryUrl}/${imageDigest}`)
      assertShellResult(pullResult, 'error pulling tagged agent images')
  
      // extract image ipfs CID from pullResult
      const cidLine = pullResult.grep('bafy').toString()// v1 CID begins with 'bafy'
      const cidStartIndex = cidLine.indexOf('bafy')
      const cidEndIndex = cidLine.indexOf(':', cidStartIndex)
      const imageIpfsCid = cidLine.substring(cidStartIndex, cidEndIndex)
      const imageReference = `${imageIpfsCid}@sha256:${imageDigest}`
  
      // get private key to sign agent manifest
      if (!fs.existsSync(fortaKeystore)) {
        throw new Error(`keystore folder ${fortaKeystore} not found`)
      }
      console.log('found Forta keystore...')
      const [ keyfileName ] = shell.ls(fortaKeystore)// assuming only one file in keystore
      const { password } = await prompts({
        type: 'password',
        name: 'password',
        message: `Enter password to decrypt keyfile ${keyfileName}`
      })
      const { publicKey, privateKey } = await getKeyfile(keyfileName, password)
  
      // upload documentation to ipfs
      console.log('pushing agent documentation to IPFS...')
      if (!fs.existsSync(documentation)) {
        throw new Error(`documentation file ${documentation} not found`)
      }
      const documentationFile = fs.readFileSync(documentation, 'utf8')
      const documentationReference = await addToIpfs(documentationFile)

      // create agent manifest and sign it
      const agentIdHash = keccak256(agentId!)
      const manifest = {
        from: publicKey,
        agentId,
        agentIdHash,
        version,
        timestamp: new Date().toUTCString(),
        imageReference,
        documentation: documentationReference
      }
      const { signature } = web3.eth.accounts.sign(JSON.stringify(manifest), privateKey);
  
      // add manifest and signature to ipfs
      console.log('pushing agent manifest to IPFS...')
      const manifestReference = await addToIpfs(JSON.stringify({ manifest, signature }))
  
      // add/update the agent in the registry contract
      web3.eth.accounts.wallet.add(privateKey);//make sure web3 knows about this wallet in order to sign
      const agentExists = await agentRegistry.agentExists(agentIdHash)
      if (!agentExists) {
        console.log('adding agent to registry...')
        await agentRegistry.createAgent(publicKey, agentIdHash, manifestReference)
      } else {
        console.log('updating agent in registry...')
        await agentRegistry.updateAgent(publicKey, agentIdHash, manifestReference)
      }
  
      console.log(`${agentExists ? 'updated' : 'added'} agent ${agentIdHash} with reference ${manifestReference}`)
    } catch (e) {
      console.error(`ERROR: ${e.message}`)
    }
  } 
}