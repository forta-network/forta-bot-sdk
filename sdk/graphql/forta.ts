import { Alert } from '../alert'

export const FORTA_GRAPHQL_URL = "https://api.forta.network/graphql";

export interface AlertQueryOptions {
    botIds: string[], // filter results by bot ids
    addresses?: string[], // filter results based on addresses involved in alerts
    alertId?: string,
    chainId?: number,
    createdSince?: Date,
    first?: number, // indicates max number of results,
    projectId?: string, 
    scanNodeConfirmations?: { // filter results by number of scan nodes confirming the alert 
        gte: number,
        lte: number
    },
    severities?: string[], // filter results by severity levels,
    transactionHash?: string,
    blockSortDirection?: "desc" | "asc", // set sorting order by block number
    blockDateRange?: {
        startDate: Date,
        endDate: Date
    }
    blockNumberRange?: {
        startBlockNumber: number,
        endBlockNumber: number
    }
}

export interface AlertsResponse {
    alerts: Alert[],
    pageInfo: {
        hasNextPage: boolean
    }
}

export interface RawGraphqlResponse {
    data: {
        data: any,
        errors: any
    }
}

export const getQueryFromAlertOptions = (options: AlertQueryOptions) => {
    return {
        "operationName": "fetchAlerts",
        "query" : `
            query fetchAlerts(
                $bots: [String]!, 
                $addresses: [String], 
                $alertId: String, 
                $chainId: NonNegativeInt,
                $first: NonNegativeInt,
                $projectId: String,
                $scanNodeConfirmations: scanNodeFilters,
                $severities: [String],
                $transactionHash: String,
                $blockSortDirection: Sort,
                $createdSince: NonNegativeInt,
                $blockDateRange: DateRange,
                $blockNumberRange: BlockRange
                ) {
                    alerts(input:{
                        bots: $bots,
                        addresses: $addresses,
                        alertId: $alertId,
                        chainId: $chainId,
                        projectId: $projectId,
                        scanNodeConfirmations: $scanNodeConfirmations,
                        severities: $severities,
                        transactionHash: $transactionHash,
                        blockSortDirection: $blockSortDirection,
                        first: $first,
                        createdSince: $createdSince,
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
                            findingType
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
                                    id
                                }
                            }
                        }
                        pageInfo {
                            hasNextPage
                        }
                    }
            }
        `,
        "variables": {
            bots: options.botIds,
            addresses: options.addresses,
            alertId: options.alertId,
            chainId: options.chainId,
            first: options.first,
            projectId: options.projectId,
            scanNodeConfirmations: options.scanNodeConfirmations,
            severities: options.severities,
            transactionHash: options.transactionHash,
            blockSortDirection: options.blockSortDirection,
            createdSince: options.createdSince?.getDate(),
            blockDateRange: options.blockDateRange ? 
                { startDate: options.blockDateRange.startDate.toISOString().split('T')[0], endDate: options.blockDateRange.endDate.toISOString().split('T')[0]} :
                undefined,
            blockNumberRange: options.blockNumberRange
        } 
    }
}