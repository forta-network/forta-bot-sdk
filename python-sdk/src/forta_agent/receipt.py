class Receipt:
    def __init__(self, dict):
        self.status = dict['status']
        self.root = dict['root']
        self.gas_used = dict['gasUsed']
        self.cumulative_gas_used = dict['cumulativeGasUsed']
        self.logs_bloom = dict['logsBloom']
        self.logs = list(map(lambda t: Log(t), dict['logs']))
        self.contract_address = dict['contractAddress']
        self.block_number = dict['blockNumber']
        self.block_hash = dict['blockHash']
        self.transaction_index = dict['transactionIndex']
        self.transaction_hash = dict['transactionHash']


class Log:
    def __init__(self, dict):
        self.address = dict['address']
        self.topics = dict['topics']
        self.data = dict['data']
        self.log_index = dict['logIndex']
        self.block_number = dict['blockNumber']
        self.block_hash = dict['blockHash']
        self.transaction_index = dict['transactionIndex']
        self.transaction_hash = dict['transactionHash']
        self.removed = dict['removed']
