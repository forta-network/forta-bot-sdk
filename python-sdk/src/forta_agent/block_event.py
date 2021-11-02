from .event_type import EventType
from .network import Network
from .block import Block


class BlockEvent:
    def __init__(self, dict):
        typeVal = dict.get('type', "BLOCK")
        self.type = EventType[typeVal] if type(
            typeVal) == str else EventType(typeVal)
        networkVal = dict.get('network', "MAINNET")
        networkVal = int(networkVal) if type(
            networkVal) == str and networkVal.isdigit() else networkVal
        self.network = Network[networkVal] if type(
            networkVal) == str else Network(networkVal)
        self.block = Block(dict.get('block', {}))

    @property
    def block_hash(self):
        return self.block.hash

    @property
    def block_number(self):
        return self.block.number
