import fs from "fs"
import { ethers, Wallet } from "ethers"
import {
  assertExists,
  assertIsValidDocumentationSettings,
  assertIsNonEmptyString,
  assertIsValidChainSettings,
  keccak256
} from "../../utils"
import { AddToIpfs } from "../../utils/add.to.ipfs"

// uploads signed agent manifest to ipfs and returns ipfs reference
export type UploadManifest = (imageReference: string | undefined, privateKey: string) => Promise<string>

export type ChainSetting = {
  shards: number;
  target: number;
}

export type ChainSettings = { [id: string]: ChainSetting }

export type DocumentationSetting = {
  title: string;
  filePath: string
};

export type DocumentationItem = {
  title: string;
  ipfsUrl: string
};

type Manifest = {
  from: string,
  name: string,
  description: string,
  longDescription?: string,
  agentId: string,
  agentIdHash: string,
  version: string,
  timestamp: string,
  imageReference?: string,
  documentation: string,
  repository?: string,
  licenseUrl?: string,
  promoUrl?: string,
  chainIds: number[],
  publishedFrom: string,
  chainSettings?: ChainSettings,
  external?: boolean
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
 documentationSettings: DocumentationSetting[] | undefined,
 repository: string,
 licenseUrl: string,
 promoUrl: string,
 cliVersion: string,
 chainIds: number[],
 external: boolean,
 chainSettings?: ChainSettings,
): UploadManifest {
  assertExists(filesystem, 'filesystem')
  assertExists(addToIpfs, 'addToIpfs')
  assertIsNonEmptyString(agentName, 'agentName')
  assertIsNonEmptyString(description, 'description')
  assertIsNonEmptyString(agentId, 'agentId')
  assertIsNonEmptyString(version, 'version')
  assertIsNonEmptyString(cliVersion, 'cliVersion')
  assertExists(chainIds, 'chainIds')
  assertIsValidChainSettings(chainSettings)
  if(documentationSettings) {
    assertIsValidDocumentationSettings(documentationSettings);
  } else {
    assertIsNonEmptyString(documentation, 'documentation')
  }

  return async function uploadManifest(imageReference: string | undefined, privateKey: string) {
    const assertDocumentationFile = (documentationFile: string) => {
      if (!filesystem.existsSync(documentationFile)) {
        throw new Error(`documentation file ${documentationFile} not found`)
      }
      if (!filesystem.statSync(documentationFile).size) {
        throw new Error(`documentation file ${documentationFile} cannot be empty`)
      }
    }

    if(documentationSettings) {
      for(const item of documentationSettings) {
        assertDocumentationFile(item.filePath)
      }
    } else {
      assertDocumentationFile(documentation)
    }

    // normalize to one format
    const settings: DocumentationSetting[] = [];
    if(documentationSettings) {
      settings.push(...documentationSettings);
    } else {
      settings.push({
        title: 'README',
        filePath: documentation
      })
    }

    // upload documentation to ipfs
    console.log('pushing agent documentation to IPFS...')

    const items: DocumentationItem[] = [];
    for(const setting of settings) {
      const documentationFile = filesystem.readFileSync(setting.filePath, 'utf8')
      const documentationReference = await addToIpfs(documentationFile)

      items.push({
        title: setting.title,
        ipfsUrl: documentationReference
      })
    }

    // create agent manifest
    const manifest: Manifest = {
      from: new Wallet(privateKey).address,
      name: agentDisplayName ?? agentName,
      description,
      longDescription: longDescription,
      agentId: agentName,
      agentIdHash: agentId,
      version,
      timestamp: new Date().toUTCString(),
      imageReference,
      documentation: JSON.stringify(items),
      repository,
      licenseUrl,
      promoUrl,
      chainIds,
      publishedFrom: `Forta CLI ${cliVersion}`,
      external,
      chainSettings: formatChainSettings(chainSettings),
    }

    // sign agent manifest
    const signingKey = new ethers.utils.SigningKey(privateKey)
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
