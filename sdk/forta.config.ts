export interface FortaConfig {
  agentId?: string;
  jsonRpcUrl?: string;
  ipfsGatewayUrl?: string;
  ipfsGatewayAuth?: string;
  imageRepositoryUrl?: string;
  imageRepositoryUsername?: string;
  imageRepositoryPassword?: string;
  agentRegistryContractAddress?: string;
  agentRegistryJsonRpcUrl?: string;
  debug?: boolean;
  traceRpcUrl?: string;
  traceBlockMethod?: string;
  traceTransactionMethod?: string;
  keyfile?: string;
  keyfilePassword?: string;
  alertsApiUrl?: string;
  fortaApiKey?: string;
  fortTokenAddress?: string;
  stakingContractAddress?: string;
}
