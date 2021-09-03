from .event_type import EventType
from .network import Network
from .block import Block


class BlockEvent:
    def __init__(self, dict):
        typeVal = dict.get('type', "BLOCK")
        self.type = EventType[typeVal] if type(
            typeVal) == str else EventType(typeVal)
        networkVal = dict.get('network', "MAINNET")
        self.network = Network[networkVal] if type(
            networkVal) == str else Network(networkVal)
        self.block_hash = dict.get('blockHash', dict.get('block_hash'))
        self.block_number = dict.get('blockNumber', dict.get('block_number'))
        self.block = Block(dict.get('block', {}))
