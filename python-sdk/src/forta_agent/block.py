from dataclasses import dataclass

@dataclass
class Block:

    block_info: dict

    def __post_init__(self):
        self.difficulty = self.block_info['difficulty']
        
        self.extra_data = self.block_info.get('extraData', self.block_info['extra_data'])

        self.gas_limit = self.block_info.get('gasLimit', self.block_info['gas_limit'])
        self.gas_used = self.block_info.get('gasUsed', self.block_info['gas_used'])

        self.hash = self.block_info['hash']

        self.logs_bloom = self.block_info.get('logsBloom', self.block_info['logs_bloom'])

        self.miner = self.block_info['miner']
        self.mix_hash = self.block_info.get('mixHash', self.block_info['mix_hash'])

        self.nonce = self.block_info['nonce']
        self.number = self.block_info['number']

        self.parent_hash = self.block_info.get('parentHash', self.block_info['parent_hash'])

        self.receipts_root = self.block_info.get('receiptsRoot', self.block_info['receipts_root'])

        self.sha3_uncles = self.block_info.get('sha3Uncles', self.block_info['sha3_uncles'])
        self.size = self.block_info['size']
        self.state_root = self.block_info.get('stateRoot', self.block_info['state_root'])

        self.timestamp = self.block_info['timestamp']
        self.total_difficulty = self.block_info.get('totalDifficulty', self.block_info['total_difficulty'])
        self.transactions = self.block_info['transactions']
        self.transactions_root = self.block_info.get('transactionsRoot', self.block_info['transactions_root'])

        self.uncles = self.block_info['uncles']
