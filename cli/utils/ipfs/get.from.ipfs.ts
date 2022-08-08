import { AxiosInstance } from "axios";
import { assertExists, assertIsNonEmptyString } from "..";

export type GetFromIpfs = (metadataHash: string) => Promise<IpfsData>

export interface IpfsData {
    manifest: IpfsManifestData
}

export interface IpfsManifestData {
    name: string,
    from: string,
    agentId: string,
    version: string,
    imageReference: string,
    agentIdHash: string,
    timestamp: string,
    repository: string,
    publishedFrom: string,
    documentation: string
}

export default function provideGetFromIpfs(
    fortaIpfsHttpClient: AxiosInstance,
    botId: string
): GetFromIpfs {
    assertExists(fortaIpfsHttpClient, 'fortaIpfsHttpClient')
    assertIsNonEmptyString(botId, 'botId')

    return async function getIpfsByHash(metadataHash: string) {
        try {
            const { data } = await fortaIpfsHttpClient({url: `/ipfs/${metadataHash}`});

            if(data && data.manifest) {
                return data;
            }

            throw Error(`No data found for ipfs hash ${metadataHash}`)

        } catch(e) {
            if(e.response && e.response.status === 403) {
                console.log(`Unable to find ipfs data for bot id: ${botId}. Please verify your bot has been deployed at https://explorer.forta.network/ `)
            } else {
                throw e
            }
        }
    }
}