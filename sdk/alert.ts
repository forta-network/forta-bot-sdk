export interface Alert {
    addresses: string[],
    alertId: string,
    contracts: {
        address: string,
        name: string,
        projectId: string
    }[],
    createdAt: string,
    description: string,
    findingType: string,
    name: string,
    protocol: string,
    scanNodeCount: number,
    severity: string,
    source: {
        transactionHash: string
    }
}
