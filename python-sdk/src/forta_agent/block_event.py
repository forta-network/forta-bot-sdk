from .event_type import EventType
from .network import Network
from .block import Block


class BlockEvent:
    def __init__(self, dict):
        self.type = EventType(dict['type'])
        self.network = Network(dict['network'])
        self.block_hash = dict['blockHash']
        self.block_number = dict['blockNumber']
        self.block = Block(dict['block'])
