import axios from "axios";
import { Alert } from "./alert";
import { getFortaApiHeaders, getFortaApiURL, isPrivateFindings } from "./utils";
import { Finding } from "./finding";

export type SendAlerts = (
  input: SendAlertsInput[] | SendAlertsInput
) => Promise<SendAlertsResponse[]>;
export const sendAlerts: SendAlerts = async (
  input: SendAlertsInput[] | SendAlertsInput
): Promise<SendAlertsResponse[]> => {
  if (!Array.isArray(input)) {
    input = [input];
  }

  const response: RawGraphqlSendAlertsResponse = await axios.post(
    getFortaApiURL(),
    getMutationFromInput(input),
    getFortaApiHeaders()
  );

  if (response.data && response.data.errors)
    throw Error(JSON.stringify(response.data.errors));

  return response.data.data.sendAlerts.alerts;
};

export interface SendAlertsInput {
  botId: string;
  finding: Finding;
}

export interface RawGraphqlSendAlertsResponse {
  data: {
    data: {
      sendAlerts: {
        alerts: SendAlertsResponse[];
      };
    };
    errors: any;
  };
}

export interface SendAlertsResponse {
  alertHash?: string;
  error?: SendAlertError;
}

export interface SendAlertError {
  code: string;
  message: string;
}

export type GetAlerts = (query: AlertQueryOptions) => Promise<AlertsResponse>;
export const getAlerts: GetAlerts = async (
  query: AlertQueryOptions
): Promise<AlertsResponse> => {
  const response: RawGraphqlAlertResponse = await axios.post(
    getFortaApiURL(),
    getQueryFromAlertOptions(query),
    getFortaApiHeaders()
  );

  if (response.data && response.data.errors)
    throw Error(JSON.stringify(response.data.errors));

  const pageInfo = response.data.data.alerts.pageInfo;
  const alerts: Alert[] = [];
  for (const alertData of response.data.data.alerts.alerts) {
    alerts.push(Alert.fromObject(alertData));
  }
  return { alerts, pageInfo };
};

export interface AlertQueryOptions {
  botIds?: string[]; // filter results by bot ids
  addresses?: string[]; // filter results based on addresses involved in alerts
  alertHash?: string;
  alertName?: string;
  alertId?: string;
  alertIds?: string[];
  chainId?: number;
  createdSince?: number;
  createdBefore?: number;
  first?: number; // indicates max number of results,
  startingCursor?: AlertCursor; // query results after the specified cursor
  projectId?: string;
  scanNodeConfirmations?: {
    // filter results by number of scan nodes confirming the alert
    gte: number;
    lte: number;
  };
  severities?: string[]; // filter results by severity levels,
  transactionHash?: string;
  blockSortDirection?: "desc" | "asc"; // set sorting order by block number
  blockDateRange?: {
    startDate: Date;
    endDate: Date;
  };
  blockNumberRange?: {
    startBlockNumber: number;
    endBlockNumber: number;
  };
}

export interface AlertsResponse {
  alerts: Alert[];
  pageInfo: {
    hasNextPage: boolean;
    endCursor?: {
      alertId: string;
      blockNumber: number;
    };
  };
}

export interface AlertCursor {
  alertId: string;
  blockNumber: number;
}

interface RawGraphqlAlertResponse {
  data: {
    data: {
      alerts: AlertsResponse;
    };
    errors: any;
  };
}

const getQueryFromAlertOptions = (options: AlertQueryOptions) => {
  return {
    operationName: "fetchAlerts",
    query: `
            query fetchAlerts(
                $bots: [String], 
                $addresses: [String], 
                $after: AlertEndCursorInput,
                $alertHash: String, 
                $alertName: String, 
                $alertId: String, 
                $alertIds: [String], 
                $chainId: NonNegativeInt,
                $first: NonNegativeInt,
                $projectId: String,
                $scanNodeConfirmations: scanNodeFilters,
                $severities: [String],
                $transactionHash: String,
                $blockSortDirection: Sort,
                $createdSince: NonNegativeInt,
                $createdBefore: NonNegativeInt,
                $blockDateRange: DateRange,
                $blockNumberRange: BlockRange
                ) {
                    alerts(input:{
                        bots: $bots,
                        addresses: $addresses,
                        after: $after,
                        alertHash: $alertHash,
                        alertName: $alertName,
                        alertId: $alertId,
                        alertIds: $alertIds,
                        chainId: $chainId,
                        projectId: $projectId,
                        scanNodeConfirmations: $scanNodeConfirmations,
                        severities: $severities,
                        transactionHash: $transactionHash,
                        blockSortDirection: $blockSortDirection,
                        first: $first,
                        createdSince: $createdSince,
                        createdBefore: $createdBefore,
                        blockDateRange: $blockDateRange,
                        blockNumberRange: $blockNumberRange
                    }) {
                        alerts {
                            alertId
                            addresses
                            contracts {
                                address
                                name
                                projectId
                            }
                            createdAt
                            description
                            hash
                            metadata
                            name
                            projects {
                                id
                            }
                            protocol
                            scanNodeCount
                            severity
                            source {
                                transactionHash
                                bot {
                                    chainIds
                                    createdAt
                                    description
                                    developer
                                    docReference
                                    enabled
                                    id
                                    image
                                    name
                                    reference
                                    repository
                                    projects
                                    scanNodes
                                    version
                                }
                                block {
                                    number
                                    hash
                                    timestamp
                                    chainId
                                }
                                sourceAlert {
                                    hash
                                    botId
                                    timestamp
                                    chainId
                                }
                            }
                            alertDocumentType
                            findingType
                            relatedAlerts
                            chainId
                            labels {
                                label
                                confidence
                                entity
                                entityType
                                remove
                                metadata
                                uniqueKey
                            }
                            addressBloomFilter {
                                bitset
                                k
                                m
                            }
                        }
                        pageInfo {
                            hasNextPage
                            endCursor {
                                alertId
                                blockNumber
                            }
                        }
                    }
            }
        `,
    variables: {
      bots: options.botIds,
      addresses: options.addresses,
      after: options.startingCursor,
      alertId: options.alertId,
      chainId: options.chainId,
      first: options.first,
      projectId: options.projectId,
      scanNodeConfirmations: options.scanNodeConfirmations,
      severities: options.severities,
      transactionHash: options.transactionHash,
      blockSortDirection: options.blockSortDirection,
      createdSince: options.createdSince,
      createdBefore: options.createdBefore,
      blockDateRange: options.blockDateRange
        ? {
            startDate: options.blockDateRange.startDate
              .toISOString()
              .split("T")[0],
            endDate: options.blockDateRange.endDate.toISOString().split("T")[0],
          }
        : undefined,
      blockNumberRange: options.blockNumberRange,
      alertIds: options.alertIds,
      alertHash: options.alertHash,
      alertName: options.alertName,
    },
  };
};

const getMutationFromInput = (inputs: SendAlertsInput[]) => {
  return {
    query: `
      mutation SendAlerts(
        $alerts: [AlertRequestInput!]!
      ) {
        sendAlerts(alerts: $alerts) {
          alerts {
            alertHash
            error {
              code
              message
            }
          }
        }
      }
    `,
    variables: {
      alerts: inputs.map((input) => {
        const finding = JSON.parse(input.finding.toString());
        // convert enums to all caps to match graphql enums
        finding.type = finding.type.toUpperCase();
        finding.severity = finding.severity.toUpperCase();
        for (const label of finding.labels) {
          label.entityType = label.entityType.toUpperCase();
        }
        // remove protocol field (not part of graphql schema)
        delete finding["protocol"];
        // remove any empty fields
        for (const key of Object.keys(finding)) {
          if (isEmptyValue(finding[key])) {
            delete finding[key];
          } else if (key === "labels") {
            // if there are labels, remove empty fields from them too
            for (const label of finding.labels) {
              for (const labelKey of Object.keys(label)) {
                if (isEmptyValue(label[labelKey])) {
                  delete label[labelKey];
                }
              }
            }
          }
        }
        // set private flag
        finding.private = isPrivateFindings();

        return {
          botId: input.botId,
          finding,
        };
      }),
    },
  };
};

function isEmptyValue(val: any): boolean {
  if (val == null || val == undefined) return true;
  if (Array.isArray(val)) return val.length == 0;
  if (typeof val === "string") return val.length == 0;
  if (typeof val === "object") return Object.keys(val).length == 0;
  return false;
}
