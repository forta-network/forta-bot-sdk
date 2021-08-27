import os from 'os'
import fs from 'fs'
import { join } from "path"
import { asClass, asFunction, asValue, createContainer, InjectionMode } from "awilix"
import Web3 from 'web3'
import shell from 'shelljs'
import prompts from 'prompts'
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
import { getJsonFile } from "./utils"
import AgentRegistry from "./commands/publish/agent.registry"
import { provideGetAgentHandlers } from "./utils/get.agent.handlers"
import { provideGetKeyfile } from "./utils/get.keyfile"
import { provideCreateKeyfile } from "./utils/create.keyfile"
import { provideGetTraceData } from './utils/get.trace.data'
import { FortaConfig } from '../sdk'
import { CommandName } from '.'
import provideAddToIpfs from './utils/add.to.ipfs'
import { provideRunHandlersOnBlock } from './utils/run.handlers.on.block'
import { provideRunHandlersOnTransaction } from './utils/run.handlers.on.transaction'

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

    fortaKeystore: asValue(join(os.homedir(), ".forta")),
    fortaConfigFilename: asFunction(() => {
      return cliArgs.config || "forta.config.json"
    }).singleton(),
    fortaConfig: asFunction((fortaConfigFilename: string) => {
      let config = {}
      // config file will not exist when running "init"
      if (commandName === "run" || commandName === "publish") {
        // try to read from config file
        const filePath = join('.', fortaConfigFilename)
        if (!fs.existsSync(filePath)) throw new Error(`config file ${fortaConfigFilename} not found`)
        try {
          config = getJsonFile(filePath)
        } catch (e) {
          throw new Error(`unable to parse config file ${fortaConfigFilename}: ${e.message}`)
        }
      }
      return config
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

    agentId: asFunction((fortaConfig: FortaConfig) => {
      return fortaConfig.agentId
    }),
    version: asFunction((fortaConfig: FortaConfig) => {
      return fortaConfig.version
    }),
    documentation: asFunction((fortaConfig: FortaConfig, fortaConfigFilename: string) => {
      if (!fortaConfig.documentation) {
        throw new Error(`no documentation provided in ${fortaConfigFilename}`)
      }
      return join('.', fortaConfig.documentation)
    }),
    handlerPaths: asFunction((fortaConfig: FortaConfig, fortaConfigFilename: string) => {
      if (!fortaConfig.handlers || !fortaConfig.handlers.length) {
        throw new Error(`no handlers provided in ${fortaConfigFilename}`)
      }
      return fortaConfig.handlers
    }),
    getAgentHandlers: asFunction(provideGetAgentHandlers),
    runHandlersOnBlock: asFunction(provideRunHandlersOnBlock),
    runHandlersOnTransaction: asFunction(provideRunHandlersOnTransaction),
    getJsonFile: asValue(getJsonFile),
    getKeyfile: asFunction(provideGetKeyfile),
    createKeyfile: asFunction(provideCreateKeyfile),
    addToIpfs: asFunction(provideAddToIpfs),

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

    jsonRpcUrl: asFunction((fortaConfig: FortaConfig, fortaConfigFilename: string) => {
      if (!fortaConfig.jsonRpcUrl) {
        throw new Error(`no jsonRpcUrl provided in ${fortaConfigFilename}`)
      }
      return fortaConfig.jsonRpcUrl
    }),
    web3: asFunction((jsonRpcUrl: string) => {
      const provider = jsonRpcUrl.startsWith('ws') ? 
        new Web3.providers.WebsocketProvider(jsonRpcUrl) : 
        new Web3.providers.HttpProvider(jsonRpcUrl)
      return new Web3(provider)
    }).singleton(),
    web3AgentRegistry: asFunction((agentRegistryJsonRpcUrl: string) => new Web3(agentRegistryJsonRpcUrl)).singleton(),

    ipfsGatewayUrl: asFunction((fortaConfig: FortaConfig, fortaConfigFilename: string) => {
      if (!fortaConfig.ipfsGatewayUrl) {
        throw new Error(`no ipfsGatewayUrl provided in ${fortaConfigFilename}`)
      }
      return fortaConfig.ipfsGatewayUrl
    }),
    ipfsGatewayAuth: asFunction((ipfsGatewayUrl: string, fortaConfig: FortaConfig, fortaConfigFilename: string) => {
      if (ipfsGatewayUrl.includes('ipfs.infura.io') && !fortaConfig.ipfsGatewayAuth) {
        throw new Error(`no ipfsGatewayAuth provided in ${fortaConfigFilename}`)
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
