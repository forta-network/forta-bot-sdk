export interface Alert {
    addresses: string[],
    alertId: string,
    contracts: {
        address: string,
        name?: string,
        projectId?: string
    }[],
    createdAt: string,
    description: string,
    findingType: string,
    name: string,
    protocol: string,
    scanNodeCount: number,
    severity: string,
    source: {
        transactionHash: string,
        block?: {
            timestamp: string,
            chainId: number,
            hash: string,
            number: number // block number
        }
        bot: {
            id: string,
            reference?: string,
            image?: string,
        }
    }
    metadata?: any,
    projects?: {
        id: string,
        name?: string,
        contacts?: {
            securityEmailAddress: string,
            generalEmailAddress: string
        },
        website?: string,
        token?: {
            symbol: string,
            name: string,
            decimals: number,
            chainId: number,
            address: string
        },
        social?:{
            twitter: string,
            github: string,
            everest: string,
            coingecko: string
        }
    } []
}
