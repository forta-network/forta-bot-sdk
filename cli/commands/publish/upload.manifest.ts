import fs from "fs"
import { ethers, Wallet } from "ethers"
import { assertExists, assertIsNonEmptyString, keccak256 } from "../../utils"
import { AddToIpfs } from "../../utils/add.to.ipfs"

// uploads signed agent manifest to ipfs and returns ipfs reference
export type UploadManifest = (imageReference: string, privateKey: string) => Promise<string>

type Manifest = {
  from: string,
  name: string,
  agentId: string,
  agentIdHash: string,
  version: string,
  timestamp: string,
  imageReference: string,
  documentation: string,
  repository?: string,
  chainIds: number[],
  publishedFrom: string
}

export default function provideUploadManifest(
  filesystem: typeof fs,
  addToIpfs: AddToIpfs,
  agentName: string,
  agentId: string,
  version: string,
  documentation: string,
  repository: string,
  cliVersion: string,
): UploadManifest {
  assertExists(filesystem, 'filesystem')
  assertExists(addToIpfs, 'addToIpfs')
  assertIsNonEmptyString(agentName, 'agentName')
  assertIsNonEmptyString(agentId, 'agentId')
  assertIsNonEmptyString(version, 'version')
  assertIsNonEmptyString(documentation, 'documentation')
  assertIsNonEmptyString(cliVersion, 'cliVersion')

  return async function uploadManifest(imageReference: string, privateKey: string) {
    // upload documentation to ipfs
    if (!filesystem.existsSync(documentation)) {
      throw new Error(`documentation file ${documentation} not found`)
    }
    if (!filesystem.statSync(documentation).size) {
      throw new Error(`documentation file ${documentation} cannot be empty`)
    }
    console.log('pushing agent documentation to IPFS...')
    const documentationFile = filesystem.readFileSync(documentation, 'utf8')
    const documentationReference = await addToIpfs(documentationFile)

    // create agent manifest
    const manifest: Manifest = {
      from: new Wallet(privateKey).address,
      name: agentName,
      agentId: agentName,
      agentIdHash: agentId,
      version,
      timestamp: new Date().toUTCString(),
      imageReference,
      documentation: documentationReference,
      repository,
      chainIds: [1],
      publishedFrom: `Forta CLI ${cliVersion}`
    }

    // sign agent manifest
    const signingKey = new ethers.utils.SigningKey(privateKey)
    const signature = ethers.utils.joinSignature(signingKey.signDigest(keccak256(JSON.stringify(manifest))))

    // upload signed manifest to ipfs
    console.log('pushing agent manifest to IPFS...')
    const manifestReference = await addToIpfs(JSON.stringify({ manifest, signature }))

    return manifestReference
  }
}