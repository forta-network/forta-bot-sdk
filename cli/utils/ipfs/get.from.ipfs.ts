import { AxiosInstance } from "axios";
import { assertExists } from "..";

export type GetFromIpfs = (metadataHash: string) => Promise<IpfsMetadata>

export interface IpfsMetadata {
    name: string,
    from: string,
    agentId: string,
    version: string,
    imageReference: string,
    agentIdHash: string,
    timestamp: string,
    repository: string,
}

export default function provideGetFromIpfs(
    ipfsHttpClient: AxiosInstance
): GetFromIpfs {
    assertExists(ipfsHttpClient, 'ipfsHttpClient')

    return async function getIpfsByHash(metadataHash: string) {
        const { data } = await ipfsHttpClient.get(`/ipfs/${metadataHash}`);
        return data.manifest;
    }
}