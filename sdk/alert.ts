import { Label } from "./label";

export type AlertContract = {
  address: string;
  name: string;
  projectId?: string;
};

export type AlertSource = {
  transactionHash?: string;
  block?: {
    timestamp: string;
    chainId: number;
    hash: string;
    number: number;
  };
  bot?: {
    id?: string;
    reference?: string;
    image?: string;
  };
  sourceAlert?: {
    hash?: string;
    botId?: string;
    timestamp?: string;
    chainId?: number;
  };
};

export type AlertProject = {
  id: string;
  name: string;
  contacts?: {
    securityEmailAddress?: string;
    generalEmailAddress?: string;
  };
  website?: string;
  token?: {
    symbol?: string;
    name?: string;
    decimals?: number;
    chainId: number;
    address: string;
  };
  social?: {
    twitter?: string;
    github?: string;
    everest?: string;
    coingecko?: string;
  };
};

type AlertInput = {
  addresses?: string[];
  alertId?: string;
  hash?: string;
  contracts?: AlertContract[];
  createdAt?: string;
  description?: string;
  findingType?: string;
  name?: string;
  protocol?: string;
  scanNodeCount?: number;
  severity?: string;
  alertDocumentType?: string;
  relatedAlerts?: string[];
  chainId?: number;
  labels?: Label[];
  source?: AlertSource;
  metadata?: any;
  projects?: AlertProject[];
};

export class Alert {
  private constructor(
    readonly addresses?: string[],
    readonly alertId?: string,
    readonly hash?: string,
    readonly contracts?: AlertContract[],
    readonly createdAt?: string,
    readonly description?: string,
    readonly findingType?: string,
    readonly name?: string,
    readonly protocol?: string,
    readonly scanNodeCount?: number,
    readonly severity?: string,
    readonly alertDocumentType?: string,
    readonly relatedAlerts?: string[],
    readonly chainId?: number,
    readonly labels?: Label[],
    readonly source?: AlertSource,
    readonly metadata?: any,
    readonly projects?: AlertProject[]
  ) {}

  static fromObject({
    addresses,
    alertId,
    hash,
    contracts,
    createdAt,
    description,
    findingType,
    name,
    protocol,
    scanNodeCount,
    severity,
    alertDocumentType,
    relatedAlerts,
    chainId,
    labels,
    source,
    metadata,
    projects,
  }: AlertInput) {
    labels = labels ? labels.map((l) => Label.fromObject(l)) : [];

    return new Alert(
      addresses,
      alertId,
      hash,
      contracts,
      createdAt,
      description,
      findingType,
      name,
      protocol,
      scanNodeCount,
      severity,
      alertDocumentType,
      relatedAlerts,
      chainId,
      labels,
      source,
      metadata,
      projects
    );
  }
}
