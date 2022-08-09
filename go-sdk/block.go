package utils

type Block struct {
	difficulty       string
	extraData        string
	gasLimit         string
	gasUsed          string
	hash             string
	logsBloom        string
	miner            string
	mixHash          string
	nonce            string
	number           int
	parentHash       string
	receiptsRoot     string
	sha3Uncles       string
	size             string
	stateRoot        string
	timestamp        int
	totalDifficulty  string
	transactions     []string
	transactionsRoot string
	uncles           []string
}

type BlockEvent struct {
	eventType    EventType
	eventNetwork Network
	block        Block
}
