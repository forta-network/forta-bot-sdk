import { AxiosInstance } from "axios"
import FormData from 'form-data'
import { assertExists } from "."

// uploads provided string to IPFS and returns IPFS hash
export type AddToIpfs = (value: string) => Promise<string>

export default function provideAddToIpfs(
  ipfsHttpClient: AxiosInstance
) {
  assertExists(ipfsHttpClient, 'ipfsHttpClient')

  return async function addToIpfs(value: string) {
    const formData = new FormData()
    formData.append('value', value)
    const { data } = await ipfsHttpClient.post('/api/v0/add', formData, {
      headers: formData.getHeaders()
    })
    return data.Hash
  }
}