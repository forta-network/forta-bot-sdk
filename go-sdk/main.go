package utils

type EventType int

const (
	BLOCK EventType = iota
	REORG
)

type Network int

const (
	MAINNET   Network = 1
	ROPSTEN   Network = 3
	RINKEBY   Network = 4
	GOERLI    Network = 5
	POLYGON   Network = 137
	BSC       Network = 56
	AVALANCHE Network = 43114
	ARBITRUM  Network = 42161
	OPTIMISM  Network = 10
	FANTOM    Network = 250
)

type HandleBlock interface {
	handleBlock(blockEvent BlockEvent) []Finding
}
