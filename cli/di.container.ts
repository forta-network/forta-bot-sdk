import os from 'os'
import fs from 'fs'
import { join } from "path"
import { asClass, asFunction, asValue, createContainer, InjectionMode } from "awilix"
import Web3 from 'web3'
import shell from 'shelljs'
import prompts from 'prompts'
import { jsonc } from 'jsonc'
import axios, { AxiosRequestConfig } from 'axios'
import provideInit from "./commands/init"
import provideRun from "./commands/run"
import providePublish from "./commands/publish"
import AgentController from "./commands/run/server/agent.controller"
import { provideRunTransaction } from "./commands/run/run.transaction"
import { provideRunBlock } from "./commands/run/run.block"
import { provideRunBlockRange } from "./commands/run/run.block.range"
import { provideRunFile } from "./commands/run/run.file"
import { provideRunLive } from "./commands/run/run.live"
import provideRunServer from "./commands/run/server"
import provideGetCredentials from './commands/publish/get.credentials'
import provideUploadImage from './commands/publish/upload.image'
import provideUploadManifest from './commands/publish/upload.manifest'
import providePushToRegistry from './commands/publish/push.to.registry'
import { createBlockEvent, createTransactionEvent, getJsonFile, keccak256 } from "./utils"
import AgentRegistry from "./commands/publish/agent.registry"
import { provideGetAgentHandlers } from "./utils/get.agent.handlers"
import { provideGetKeyfile } from "./utils/get.keyfile"
import { provideCreateKeyfile } from "./utils/create.keyfile"
import { provideGetTraceData } from './utils/get.trace.data'
import { FortaConfig } from '../sdk'
import { provideGetPythonAgentHandlers } from './utils/get.python.agent.handlers'
import { CommandName } from '.'
import provideAddToIpfs from './utils/add.to.ipfs'
import { provideRunHandlersOnBlock } from './utils/run.handlers.on.block'
import { provideRunHandlersOnTransaction } from './utils/run.handlers.on.transaction'
import provideAppendToFile from './utils/append.to.file'
import provideGetFortaConfig, { GetFortaConfig } from './utils/get.forta.config'

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
    agentId: asFunction((agentName: string) => keccak256(agentName)).singleton(),
    version: asFunction((packageJson: any) => packageJson.version),
    documentation: asValue(join(process.cwd(), 'README.md')),
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
    createKeyfile: asFunction(provideCreateKeyfile),
    addToIpfs: asFunction(provideAddToIpfs),
    appendToFile: asFunction(provideAppendToFile),

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
      return fortaConfig.agentRegistryContractAddress || "0xFE1927bF5bc338e4884A0d406e33921e8058d75d"
    }),
    agentRegistryJsonRpcUrl: asFunction((fortaConfig: FortaConfig) => {
      return fortaConfig.agentRegistryJsonRpcUrl || "https://goerli-light.eth.linkpool.io/"
    }),

    jsonRpcUrl: asFunction((fortaConfig: FortaConfig) => {
      if (!fortaConfig.jsonRpcUrl) {
        throw new Error(`no jsonRpcUrl provided in config`)
      } else if (!fortaConfig.jsonRpcUrl.startsWith("http")) {
        throw new Error(`jsonRpcUrl must begin with http or https`)
      }
      return fortaConfig.jsonRpcUrl
    }),
    web3: asFunction((jsonRpcUrl: string) =>  new Web3(jsonRpcUrl)).singleton(),
    web3AgentRegistry: asFunction((agentRegistryJsonRpcUrl: string) => new Web3(agentRegistryJsonRpcUrl)).singleton(),

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
