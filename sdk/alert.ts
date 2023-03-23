import { BloomFilter } from "./bloom.filter";
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

export type AlertAddressBloomFilter = {
  bitset: string;
  k: string;
  m: string;
};

export type AlertInput = {
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
  addressBloomFilter?: AlertAddressBloomFilter;
};

export class Alert {
  private readonly addressFilter?: BloomFilter;

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
    readonly projects?: AlertProject[],
    readonly addressBloomFilter?: AlertAddressBloomFilter
  ) {
    this.addressFilter = addressBloomFilter
      ? new BloomFilter(
          addressBloomFilter.m,
          addressBloomFilter.k,
          addressBloomFilter.bitset
        )
      : undefined;
  }

  public hasAddress(address: string): boolean {
    if (this.addressFilter) {
      return this.addressFilter.has(address);
    }
    if (this.addresses?.length) {
      return this.addresses.includes(address);
    }
    return false;
  }

  public toString(): string {
    return JSON.stringify(this, (key, value) => {
      if (key === "addressFilter") return undefined; //dont try to serialize BloomFilter object
      return value;
    });
  }

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
    addressBloomFilter,
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
      projects,
      addressBloomFilter
    );
  }
}
