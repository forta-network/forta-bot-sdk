import os from 'os'
import fs from 'fs'
import { join } from "path"
import { asClass, asFunction, asValue, createContainer, InjectionMode } from "awilix"
import { ethers } from "ethers"
import shell from 'shelljs'
import prompts from 'prompts'
import { jsonc } from 'jsonc'
import axios, { AxiosRequestConfig } from 'axios'
import flatCache from 'flat-cache'
import provideInit from "./commands/init"
import provideRun from "./commands/run"
import providePublish from "./commands/publish"
import providePush from './commands/push'
import provideDisable from './commands/disable'
import provideEnable from './commands/enable'
import provideKeyfile from './commands/keyfile'
import AgentController from "./commands/run/server/agent.controller"
import { provideRunTransaction } from "./commands/run/run.transaction"
import { provideRunBlock } from "./commands/run/run.block"
import { provideRunBlockRange } from "./commands/run/run.block.range"
import { provideRunFile } from "./commands/run/run.file"
import { provideRunLive } from "./commands/run/run.live"
import provideRunServer from "./commands/run/server"
import provideUploadImage from './commands/publish/upload.image'
import provideUploadManifest from './commands/publish/upload.manifest'
import providePushToRegistry from './commands/publish/push.to.registry'
import { createBlockEvent, createTransactionEvent, getJsonFile, keccak256 } from "./utils"
import AgentRegistry from "./contracts/agent.registry"
import { provideGetAgentHandlers } from "./utils/get.agent.handlers"
import { provideDecryptKeyfile } from "./utils/decrypt.keyfile"
import { provideCreateKeyfile } from "./utils/create.keyfile"
import provideGetCredentials from './utils/get.credentials'
import { provideGetTraceData } from './utils/get.trace.data'
import { FortaConfig } from '../sdk'
import { provideGetPythonAgentHandlers } from './utils/get.python.agent.handlers'
import { CommandName } from '.'
import provideAddToIpfs from './utils/add.to.ipfs'
import { provideRunHandlersOnBlock } from './utils/run.handlers.on.block'
import { provideRunHandlersOnTransaction } from './utils/run.handlers.on.transaction'
import provideAppendToFile from './utils/append.to.file'
import provideGetFortaConfig, { GetFortaConfig } from './utils/get.forta.config'
import provideListKeyfiles from './utils/list.keyfiles'
import provideGetNetworkId from './utils/get.network.id'
import provideGetBlockWithTransactions from './utils/get.block.with.transactions'
import provideGetTransactionReceipt from './utils/get.transaction.receipt'
import provideGetKeyfile from './utils/get.keyfile'

export default function configureContainer(commandName: CommandName, cliArgs: any) {
  const container = createContainer({ injectionMode: InjectionMode.CLASSIC });

  const bindings = {
    container: asValue(container),
    isProduction: asValue(process.env.NODE_ENV === 'production'),
    isDebug: asFunction((fortaConfig: FortaConfig) => fortaConfig.debug),
    shell: asFunction((isDebug: boolean) => {
      shell.config.silent = isDebug ? false : true
      return shell
    }).singleton(),
    axios: asValue(axios),
    prompt: asValue(prompts),
    setInterval: asValue(setInterval),
    filesystem: asValue(fs),
    dynamicImport: asValue((path: string) => import(path)),
    commandName: asValue(commandName),
    cliVersion: asFunction(() => {
      try {
        // in the distributed npm package, the package.json will be 2 levels above this file
        const packageJsonPath = join(__dirname, "..", "..", "package.json")
        const packageJson =  getJsonFile(packageJsonPath)
        return packageJson.version
      } catch (e) {
        throw new Error(`unable to parse cli package.json: ${e.message}`)
      }
    }).singleton(),
    cache: asFunction((fortaKeystore: string) => flatCache.load('cli-cache', fortaKeystore)).singleton(),

    fortaKeystore: asValue(join(os.homedir(), ".forta")),
    getFortaConfig: asFunction(provideGetFortaConfig),
    fortaConfig: asFunction((getFortaConfig: GetFortaConfig) => getFortaConfig()).singleton(),
    configFilename: asValue("forta.config.json"),
    localConfigFilename: asFunction((configFilename: string) => {
      return cliArgs.config || configFilename
    }).singleton(),

    init: asFunction(provideInit),
    run: asFunction(provideRun),
    publish: asFunction(providePublish),
    push: asFunction(providePush),
    disable: asFunction(provideDisable),
    enable: asFunction(provideEnable),
    keyfile: asFunction(provideKeyfile),

    runProdServer: asFunction(provideRunServer),
    runTransaction: asFunction(provideRunTransaction),
    runBlock: asFunction(provideRunBlock),
    runBlockRange: asFunction(provideRunBlockRange),
    runFile: asFunction(provideRunFile),
    runLive: asFunction(provideRunLive),

    getCredentials: asFunction(provideGetCredentials),
    uploadImage: asFunction(provideUploadImage),
    uploadManifest: asFunction(provideUploadManifest),
    pushToRegistry: asFunction(providePushToRegistry),

    packageJson: asFunction(() => {
      try {
        const packageJsonPath = join(process.cwd(), "package.json")
        return getJsonFile(packageJsonPath)
      } catch (e) {
        throw new Error(`unable to parse package.json: ${e.message}`)
      }
    }).singleton(),
    agentName: asFunction((packageJson: any) => packageJson.name).singleton(),
    agentId: asFunction((fortaConfig: FortaConfig, agentName: string) => {
      return fortaConfig.agentId || keccak256(agentName)
    }).singleton(),
    version: asFunction((packageJson: any) => packageJson.version),
    documentation: asValue(join(process.cwd(), 'README.md')),
    repository: asFunction((packageJson: any) => {
      const repository = packageJson.repository
      if (typeof repository === 'string') {
        return repository
      } else if (typeof repository === 'object') {
        return repository.url
      }
      return undefined
    }).singleton(),
    keyfileName: asFunction((fortaConfig: FortaConfig) => {
      return fortaConfig.keyfile
    }),
    agentPath: asFunction(() => {
      const projectDir = process.cwd()
      // default js agent
      let agentPath = join(projectDir, "src", "agent")
      // check if typescript agent
      if (fs.existsSync(join(projectDir, "src", "agent.ts"))) {
        // point to compiled javascript agent in output folder
        const tsConfigPath = join(projectDir, "tsconfig.json")
        const { compilerOptions } = jsonc.parse(fs.readFileSync(tsConfigPath, 'utf8'))
        agentPath = join(projectDir, compilerOptions.outDir, "agent")
      }
      // check if python agent
      else if (fs.existsSync(join(projectDir, "src", "agent.py"))) {
        agentPath = join(projectDir, "src", "agent.py")
      }
      return agentPath
    }),
    getAgentHandlers: asFunction(provideGetAgentHandlers).singleton(),
    getPythonAgentHandlers: asFunction(provideGetPythonAgentHandlers),
    runHandlersOnBlock: asFunction(provideRunHandlersOnBlock),
    runHandlersOnTransaction: asFunction(provideRunHandlersOnTransaction),
    getJsonFile: asValue(getJsonFile),
    createBlockEvent: asValue(createBlockEvent),
    createTransactionEvent: asValue(createTransactionEvent),
    getKeyfile: asFunction(provideGetKeyfile),
    decryptKeyfile: asFunction(provideDecryptKeyfile),
    createKeyfile: asFunction(provideCreateKeyfile),
    listKeyfiles: asFunction(provideListKeyfiles),
    addToIpfs: asFunction(provideAddToIpfs),
    appendToFile: asFunction(provideAppendToFile),

    getNetworkId: asFunction(provideGetNetworkId),
    getBlockWithTransactions: asFunction(provideGetBlockWithTransactions),
    getTransactionReceipt: asFunction(provideGetTransactionReceipt),

    getTraceData: asFunction(provideGetTraceData),
    traceRpcUrl: asFunction((fortaConfig: FortaConfig) => {
      return fortaConfig.traceRpcUrl
    }).singleton(),
    traceBlockMethod: asFunction((fortaConfig: FortaConfig) => {
      return fortaConfig.traceBlockMethod || "trace_block"
    }).singleton(),
    traceTransactionMethod: asFunction((fortaConfig: FortaConfig) => {
      return fortaConfig.traceTransactionMethod || "trace_transaction"
    }).singleton(),

    agentController: asClass(AgentController),
    port: asValue(process.env.AGENT_GRPC_PORT || "50051"),

    imageRepositoryUrl: asFunction((fortaConfig: FortaConfig) => {
      return fortaConfig.imageRepositoryUrl || "disco.forta.network"
    }),
    imageRepositoryUsername: asFunction((fortaConfig: FortaConfig) => {
      return fortaConfig.imageRepositoryUsername || "discouser"
    }),
    imageRepositoryPassword: asFunction((fortaConfig: FortaConfig) => {
      return fortaConfig.imageRepositoryPassword || "discopass"
    }),

    agentRegistry: asClass(AgentRegistry),
    agentRegistryContractAddress: asFunction((fortaConfig: FortaConfig) => {
      return fortaConfig.agentRegistryContractAddress || "0x61447385B019187daa48e91c55c02AF1F1f3F863"
    }),
    agentRegistryJsonRpcUrl: asFunction((fortaConfig: FortaConfig) => {
      const url = fortaConfig.agentRegistryJsonRpcUrl || "https://polygon-rpc.com/"
      if (!url.startsWith("http")) {
        throw new Error(`agentRegistryJsonRpcUrl must begin with http or https`)
      }
      return url
    }),

    jsonRpcUrl: asFunction((fortaConfig: FortaConfig) => {
      if (!fortaConfig.jsonRpcUrl) {
        throw new Error(`no jsonRpcUrl provided in config`)
      } else if (!fortaConfig.jsonRpcUrl.startsWith("http")) {
        throw new Error(`jsonRpcUrl must begin with http or https`)
      }
      return fortaConfig.jsonRpcUrl
    }),
    ethersProvider: asFunction((jsonRpcUrl: string) =>  new ethers.providers.JsonRpcProvider(jsonRpcUrl)).singleton(),
    ethersAgentRegistryProvider: asFunction((agentRegistryJsonRpcUrl: string) => new ethers.providers.JsonRpcProvider(agentRegistryJsonRpcUrl)).singleton(),

    ipfsGatewayUrl: asFunction((fortaConfig: FortaConfig) => {
      if (!fortaConfig.ipfsGatewayUrl) {
        throw new Error(`no ipfsGatewayUrl provided in config`)
      }
      return fortaConfig.ipfsGatewayUrl
    }),
    ipfsGatewayAuth: asFunction((ipfsGatewayUrl: string, fortaConfig: FortaConfig) => {
      if (ipfsGatewayUrl.includes('ipfs.infura.io') && !fortaConfig.ipfsGatewayAuth) {
        throw new Error(`no ipfsGatewayAuth provided in config`)
      }
      return fortaConfig.ipfsGatewayAuth
    }),
    ipfsHttpClient: asFunction((ipfsGatewayUrl: string, ipfsGatewayAuth: string) => {
      const options: AxiosRequestConfig = { baseURL: ipfsGatewayUrl }
      if (ipfsGatewayAuth) {
        options['headers'] = {
          authorization: ipfsGatewayAuth
        }
      }
      return axios.create(options)
    }).singleton()
  };
  container.register(bindings);

  return container;
};
