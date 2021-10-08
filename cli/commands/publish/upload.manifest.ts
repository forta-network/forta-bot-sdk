import fs from "fs"
import Web3 from "web3"
import { assertExists, assertIsNonEmptyString, keccak256 } from "../../utils"
import { AddToIpfs } from "../../utils/add.to.ipfs"

// uploads signed agent manifest to ipfs and returns ipfs reference
export type UploadManifest = (imageReference: string, publicKey: string, privateKey: string) => Promise<string>

export default function provideUploadManifest(
  web3AgentRegistry: Web3,
  filesystem: typeof fs,
  addToIpfs: AddToIpfs,
  agentName: string,
  agentId: string,
  version: string,
  documentation: string,
): UploadManifest {
  assertExists(web3AgentRegistry, 'web3AgentRegistry')
  assertExists(filesystem, 'filesystem')
  assertExists(addToIpfs, 'addToIpfs')
  assertIsNonEmptyString(agentName, 'agentName')
  assertIsNonEmptyString(agentId, 'agentId')
  assertIsNonEmptyString(version, 'version')
  assertIsNonEmptyString(documentation, 'documentation')

  return async function uploadManifest(imageReference: string, publicKey: string, privateKey: string) {
    // upload documentation to ipfs
    if (!filesystem.existsSync(documentation)) {
      throw new Error(`documentation file ${documentation} not found`)
    }
    console.log('pushing agent documentation to IPFS...')
    const documentationFile = filesystem.readFileSync(documentation, 'utf8')
    const documentationReference = await addToIpfs(documentationFile)

    // create agent manifest
    const manifest = {
      from: publicKey,
      name: agentName,
      agentId: agentName,
      agentIdHash: agentId,
      version,
      timestamp: new Date().toUTCString(),
      imageReference,
      documentation: documentationReference
    }

    // sign agent manifest
    const { signature } = web3AgentRegistry.eth.accounts.sign(JSON.stringify(manifest), privateKey);

    // upload signed manifest to ipfs
    console.log('pushing agent manifest to IPFS...')
    const manifestReference = await addToIpfs(JSON.stringify({ manifest, signature }))

    return manifestReference
  }
}