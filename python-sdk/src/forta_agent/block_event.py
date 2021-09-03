from .event_type import EventType
from .network import Network
from .block import Block


class BlockEvent:
    def __init__(self, dict):
        self.type = EventType(dict.get('type', EventType.BLOCK))
        self.network = Network(dict.get('network', Network.MAINNET))
        self.block_hash = dict.get('blockHash', dict.get('block_hash'))
        self.block_number = dict.get('blockNumber', dict.get('block_number'))
        self.block = Block(dict.get('block', {}))
