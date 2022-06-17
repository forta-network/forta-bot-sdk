import { AxiosInstance } from "axios";
import { assertExists } from "..";

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
    ipfsHttpClient: AxiosInstance
): GetFromIpfs {
    assertExists(ipfsHttpClient, 'ipfsHttpClient')

    return async function getIpfsByHash(metadataHash: string) {
        const { data } = await ipfsHttpClient.get(`/ipfs/${metadataHash}`);

        if(data && data.manifest) {
            return data;
        }

        throw Error(`No data found for ipfs hash ${metadataHash}`)
    }
}