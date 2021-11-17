import shelljs from "shelljs"
import prompts from "prompts"
import { assertExists, assertIsNonEmptyString, assertShellResult, isAppleM1 } from "../../utils"

// uploads agent image to repository and returns image reference
export type UploadImage = () => Promise<string>

export default function provideUploadImage(
  shell: typeof shelljs,
  prompt: typeof prompts,
  imageRepositoryUrl: string,
  imageRepositoryUsername: string,
  imageRepositoryPassword: string,
  agentName: string
): UploadImage {
  assertExists(shell, 'shell')
  assertExists(prompt, 'prompt')
  assertIsNonEmptyString(imageRepositoryUrl, 'imageRepositoryUrl')
  assertIsNonEmptyString(agentName, 'agentName')

  return async function uploadImage() {
    // authenticate against repository if credentials provided
    if (imageRepositoryUsername && imageRepositoryPassword) {
      const loginResult = shell.exec(`docker login ${imageRepositoryUrl} -u ${imageRepositoryUsername} -p ${imageRepositoryPassword}`)
      assertShellResult(loginResult, 'error authenticating with image repository')
    }

    // build the agent image
    console.log('building agent image...')
    const containerTag = `${agentName}-intermediate`
    let buildCommand = `docker build --tag ${containerTag} .`
    if (isAppleM1()) {
      // TODO should this just be the default build command?
      buildCommand = `docker buildx build --platform linux/amd64 --tag ${containerTag} .`
    }
    const buildResult = shell.exec(buildCommand)
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
    
    return imageReference
  }
}