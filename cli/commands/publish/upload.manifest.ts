import fs from "fs"
import { ethers, Wallet } from "ethers"
import { assertExists, assertIsNonEmptyString, assertIsValidChainSettings, keccak256 } from "../../utils"
import { AddToIpfs } from "../../utils/add.to.ipfs"

// uploads signed agent manifest to ipfs and returns ipfs reference
export type UploadManifest = (imageReference: string, privateKey: string) => Promise<string>

export type ChainSetting = {
  shards: number;
  target: number;
}

export type ChainSettings = { [id: string]: ChainSetting }

type Manifest = {
  from: string,
  name: string,
  displayName?: string,
  description: string,
  longDescription?: string,
  agentId: string,
  agentIdHash: string,
  version: string,
  timestamp: string,
  imageReference: string,
  documentation: string,
  repository?: string,
  licenseUrl?: string,
  promoUrl?: string,
  chainIds: number[],
  publishedFrom: string,
  chainSettings?: ChainSettings
}

export default function provideUploadManifest(
 filesystem: typeof fs,
 addToIpfs: AddToIpfs,
 agentName: string,
 agentDisplayName: string,
 description: string,
 longDescription: string,
 agentId: string,
 version: string,
 documentation: string,
 repository: string,
 licenseUrl: string,
 promoUrl: string,
 cliVersion: string,
 chainIds: number[],
 chainSettings?: ChainSettings
): UploadManifest {
  assertExists(filesystem, 'filesystem')
  assertExists(addToIpfs, 'addToIpfs')
  assertIsNonEmptyString(agentName, 'agentName')
  assertIsNonEmptyString(description, 'description')
  assertIsNonEmptyString(agentId, 'agentId')
  assertIsNonEmptyString(version, 'version')
  assertIsNonEmptyString(documentation, 'documentation')
  assertIsNonEmptyString(cliVersion, 'cliVersion')
  assertExists(chainIds, 'chainIds')
  assertIsValidChainSettings(chainSettings)

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
      displayName: agentDisplayName,
      longDescription: longDescription,
      description,
      agentId: agentName,
      agentIdHash: agentId,
      version,
      timestamp: new Date().toUTCString(),
      imageReference,
      documentation: documentationReference,
      repository,
      licenseUrl: licenseUrl,
      promoUrl: promoUrl,
      chainIds,
      publishedFrom: `Forta CLI ${cliVersion}`,
      chainSettings: formatChainSettings(chainSettings),
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

function formatChainSettings(chainSettings?: ChainSettings): ChainSettings | undefined {
  if (!chainSettings) return undefined;

  const formattedChainSettings = Object.assign({}, chainSettings)
  for (const key of Object.keys(chainSettings)) {
    // make sure keys are not numbers
    if (typeof key === 'number') {
      delete formattedChainSettings[key]
      formattedChainSettings[`${key}`] = chainSettings[key]
    }
    // make sure shards and targets are numbers
    if (typeof chainSettings[key].shards === 'string') {
      formattedChainSettings[`${key}`].shards = parseInt(chainSettings[key].shards as any)
    }
    if (typeof chainSettings[key].target === 'string') {
      formattedChainSettings[`${key}`].target = parseInt(chainSettings[key].target as any)
    }
  }
  return formattedChainSettings
}