from .utils import hex_to_int


class Receipt:
    def __init__(self, dict):
        statusVal = dict.get('status')
        self.status = statusVal == "0x1" if type(
            statusVal) == str else statusVal
        self.root = dict.get('root')
        self.gas_used = hex_to_int(dict.get('gasUsed', dict.get('gas_used')))
        self.cumulative_gas_used = hex_to_int(dict.get(
            'cumulativeGasUsed', dict.get('cumulative_gas_used')))
        self.logs_bloom = dict.get('logsBloom', dict.get('logs_bloom'))
        self.logs = list(map(lambda t: Log(t), dict.get('logs', [])))
        self.contract_address = dict.get(
            'contractAddress', dict.get('contract_address'))
        self.block_number = dict.get('blockNumber', dict.get('block_number'))
        self.block_hash = dict.get('blockHash', dict.get('block_hash'))
        self.transaction_index = dict.get(
            'transactionIndex', dict.get('transaction_index'))
        self.transaction_hash = dict.get(
            'transactionHash', dict.get('transaction_hash'))


class Log:
    def __init__(self, dict):
        self.address = dict.get('address')
        self.topics = dict.get('topics', [])
        self.data = dict.get('data')
        self.log_index = dict.get('logIndex', dict.get('log_index'))
        self.block_number = dict.get('blockNumber', dict.get('block_number'))
        self.block_hash = dict.get('blockHash', dict.get('block_hash'))
        self.transaction_index = dict.get(
            'transactionIndex', dict.get('transaction_index'))
        self.transaction_hash = dict.get(
            'transactionHash', dict.get('transaction_hash'))
        self.removed = dict.get('removed')

    @property
    def logIndex(self):
        return self.log_index

    @property
    def blockNumber(self):
        return self.block_number

    @property
    def blockHash(self):
        return self.block_hash

    @property
    def transactionIndex(self):
        return self.transaction_index

    @property
    def transactionHash(self):
        return self.transaction_hash

    def __getitem__(self, key):
        return getattr(self, key)
