class Block:
    def __init__(self, dict):
        self.difficulty = dict.get('difficulty')
        self.extra_data = dict.get('extraData', dict.get('extra_data'))
        self.gas_limit = dict.get('gasLimit', dict.get('gas_limit'))
        self.gas_used = dict.get('gasUsed', dict.get('gas_used'))
        self.hash = dict.get('hash')
        self.logs_bloom = dict.get('logsBloom', dict.get('logs_bloom'))
        self.miner = dict.get('miner')
        self.mix_hash = dict.get('mixHash', dict.get('mix_hash'))
        self.nonce = dict.get('nonce')
        self.number = dict.get('number')
        self.parent_hash = dict.get('parentHash', dict.get('parent_hash'))
        self.receipts_root = dict.get(
            'receiptsRoot', dict.get('receipts_root'))
        self.sha3_uncles = dict.get('sha3Uncles', dict.get('sha3_uncles'))
        self.size = dict.get('size')
        self.state_root = dict.get('stateRoot', dict.get('state_root'))
        self.timestamp = dict.get('timestamp')
        self.total_difficulty = dict.get(
            'totalDifficulty', dict.get('total_difficulty'))
        self.transactions = dict.get('transactions')
        self.transactions_root = dict.get(
            'transactionsRoot', dict.get('transactions_root'))
        self.uncles = dict.get('uncles')
