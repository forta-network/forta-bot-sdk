import { Alert } from '../alert'

export const FORTA_GRAPHQL_URL = "https://api.forta.network/graphql";

interface AlertCursor {
    alertId: string,
    blockNumber: number
}
export interface AlertQueryOptions {
    botIds: string[], // filter results by bot ids
    addresses?: string[], // filter results based on addresses involved in alerts
    alertId?: string,
    chainId?: number,
    createdSince?: number,
    first?: number, // indicates max number of results,
    startingCursor?: AlertCursor, // query results after the specified cursor
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
        hasNextPage: boolean,
        endCursor?: {
            alertId: string,
            blockNumber: number
        }
    }
}

export interface RawGraphqlAlertResponse {
    data: {
        data: {
            alerts: AlertsResponse
        },
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
                $after: AlertEndCursorInput,
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
                        after: $after,
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
                                    id
                                }
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
        "variables": {
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
            blockDateRange: options.blockDateRange ? 
                { startDate: options.blockDateRange.startDate.toISOString().split('T')[0], endDate: options.blockDateRange.endDate.toISOString().split('T')[0]} :
                undefined,
            blockNumberRange: options.blockNumberRange
        } 
    }
}